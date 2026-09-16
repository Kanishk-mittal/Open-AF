import asyncio
import datetime
import hashlib
import os
import posixpath
import shutil
import tarfile
import zlib
from typing import Any, Dict, List, Optional

from errors import AppError, BadRequestError, NotFoundError
from lib.database import db_manager
from repository.project_repository import ProjectRepository
from services.adb_service import adb_service
from .models import FileItem, FileListResponse

MAX_HASH_FILE_SIZE = 100 * 1024 * 1024  # 100 MB limit for automatic hashing


class AdbBackupService:
    def __init__(self):
        self.repository = ProjectRepository()

    def _compute_sha256(self, file_path: str) -> Optional[str]:
        """Compute SHA-256 hash for a file if under size limit."""
        try:
            if not os.path.isfile(file_path) or os.path.getsize(file_path) > MAX_HASH_FILE_SIZE:
                return None
            hasher = hashlib.sha256()
            with open(file_path, "rb") as f:
                while chunk := f.read(65536):
                    hasher.update(chunk)
            return hasher.hexdigest()
        except Exception:
            return None

    def _unpack_ab_file(self, ab_path: str, output_dir: str) -> int:
        """
        Unpacks an Android .ab backup file into output_dir.
        Returns the count of extracted files.
        """
        os.makedirs(output_dir, exist_ok=True)
        if not os.path.exists(ab_path) or os.path.getsize(ab_path) == 0:
            return 0

        try:
            with open(ab_path, "rb") as f:
                magic = f.readline().strip()
                if magic != b"ANDROID BACKUP":
                    # Check if it's a direct tar
                    f.seek(0)
                    try:
                        with tarfile.open(fileobj=f, mode="r:*") as tar:
                            tar.extractall(path=output_dir)
                            return len(tar.getmembers())
                    except Exception:
                        return 0

                version = f.readline().strip()
                compressed = f.readline().strip()
                encryption = f.readline().strip()

                if encryption != b"none":
                    print(f"Warning: Encrypted backup ({encryption.decode()}) cannot be unpacked without passphrase.")
                    return 0

                tar_path = ab_path + ".tar"
                decompressor = zlib.decompressobj()

                with open(tar_path, "wb") as out_tar:
                    while chunk := f.read(65536):
                        out_tar.write(decompressor.decompress(chunk))
                    out_tar.write(decompressor.flush())

            file_count = 0
            if os.path.exists(tar_path) and os.path.getsize(tar_path) > 0:
                with tarfile.open(tar_path, "r:*") as tar:
                    tar.extractall(path=output_dir)
                    file_count = len(tar.getmembers())

            if os.path.exists(tar_path):
                os.remove(tar_path)

            return file_count
        except Exception as e:
            print(f"Warning: Error unpacking .ab backup: {e}")
            return 0

    async def _index_extracted_files(self, project_id: str, extracted_dir: str):
        """Index all extracted files into MongoDB collection for hash lookup and search."""
        project_db = db_manager.client[f"OpenAF_{project_id}"]
        collection = project_db["backup_files"]
        await collection.drop()
        await collection.create_index("path")
        await collection.create_index("sha256")

        docs = []
        for root, dirs, files in os.walk(extracted_dir):
            for name in files:
                file_path = os.path.join(root, name)
                rel_path = "/" + os.path.relpath(file_path, extracted_dir).replace("\\", "/")
                size = os.path.getsize(file_path)
                mtime = datetime.datetime.fromtimestamp(
                    os.path.getmtime(file_path), tz=datetime.timezone.utc
                ).isoformat()
                sha256_hash = self._compute_sha256(file_path)
                ext = os.path.splitext(name)[1].lower().lstrip(".") or None

                docs.append(
                    {
                        "name": name,
                        "path": rel_path,
                        "is_dir": False,
                        "size": size,
                        "modified_at": mtime,
                        "sha256": sha256_hash,
                        "extension": ext,
                    }
                )

                if len(docs) >= 500:
                    await collection.insert_many(docs)
                    docs = []

        if docs:
            await collection.insert_many(docs)

    async def perform_initial_backup(self, project_id: str) -> Optional[Dict[str, Any]]:
        """
        Executes initial ADB backup during project initialization.
        Saves backup file into <storage_location>/backup/backup_<project_id>.ab,
        unpacks it into <storage_location>/backup/extracted/, and stores metadata.
        """
        metadata = await self.repository.get_project_metadata(project_id)
        device_serial = metadata.device_serial
        storage_location = metadata.storage_location

        if not device_serial:
            return None

        devices = adb_service.client.devices()
        if not any(d.serial == device_serial for d in devices):
            print(f"Warning: Device {device_serial} not found during initial backup for project {project_id}.")
            return None

        backup_dir = os.path.join(storage_location, "backup")
        extracted_dir = os.path.join(backup_dir, "extracted")
        os.makedirs(backup_dir, exist_ok=True)
        os.makedirs(extracted_dir, exist_ok=True)

        target_file = os.path.join(backup_dir, f"backup_{project_id}.ab")

        # Execute safe adb backup command
        cmd = [
            "adb",
            "-s",
            device_serial,
            "backup",
            "-f",
            target_file,
            "-apk",
            "-shared",
            "-all",
            "-system",
        ]

        process = await asyncio.create_subprocess_exec(
            *cmd, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE
        )
        stdout, stderr = await process.communicate()

        file_size = os.path.getsize(target_file) if os.path.exists(target_file) else 0

        # Unpack the backup archive
        extracted_count = self._unpack_ab_file(target_file, extracted_dir)

        # If .ab yielded no files (e.g. Android 12+ or unconfirmed prompt), pull /sdcard as fallback
        if extracted_count == 0:
            shared_dir = os.path.join(extracted_dir, "shared")
            os.makedirs(shared_dir, exist_ok=True)
            pull_proc = await asyncio.create_subprocess_exec(
                "adb", "-s", device_serial, "pull", "/sdcard/", shared_dir,
                stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE
            )
            await pull_proc.communicate()

        # Index extracted files into database
        await self._index_extracted_files(project_id, extracted_dir)

        project_db = db_manager.client[f"OpenAF_{project_id}"]
        collection = project_db["backup"]

        record = {
            "project_id": project_id,
            "device_serial": device_serial,
            "file_path": target_file,
            "extracted_path": extracted_dir,
            "file_size": file_size,
            "storage_location": storage_location,
            "command": " ".join(cmd),
            "created_at": datetime.datetime.now(datetime.timezone.utc),
            "status": "completed" if process.returncode == 0 else "failed",
            "error": stderr.decode(errors="replace").strip() if process.returncode != 0 and stderr else None,
        }

        await collection.insert_one(record)
        return record

    async def get_backup_for_project(self, project_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve the backup document for a project from MongoDB."""
        project_db = db_manager.client[f"OpenAF_{project_id}"]
        collection = project_db["backup"]
        doc = await collection.find_one({})
        if doc:
            doc["_id"] = str(doc["_id"])
        return doc

    async def delete_backup_for_project(self, project_id: str) -> None:
        """
        Cleans up and deletes the backup (.ab) and extracted directory on host disk
        when the project is deleted.
        """
        try:
            project_db = db_manager.client[f"OpenAF_{project_id}"]
            backup_doc = await project_db["backup"].find_one({})
            metadata_doc = await project_db["metadata"].find_one({})

            storage_location = metadata_doc.get("storage_location") if metadata_doc else None

            if backup_doc:
                extracted_path = backup_doc.get("extracted_path")
                if extracted_path and os.path.exists(extracted_path):
                    shutil.rmtree(extracted_path, ignore_errors=True)

                file_path = backup_doc.get("file_path")
                if file_path and os.path.exists(file_path):
                    try:
                        os.remove(file_path)
                    except Exception:
                        pass

            if storage_location:
                backup_dir = os.path.join(storage_location, "backup")
                if os.path.exists(backup_dir):
                    shutil.rmtree(backup_dir, ignore_errors=True)
        except Exception as e:
            print(f"Warning: Failed to cleanup backup files for project {project_id}: {e}")


    async def _get_extracted_dir(self, project_id: str) -> str:
        """Get the safe path to the project's extracted backup directory."""
        metadata = await self.repository.get_project_metadata(project_id)
        storage_location = metadata.storage_location
        extracted_dir = os.path.abspath(os.path.join(storage_location, "backup", "extracted"))
        os.makedirs(extracted_dir, exist_ok=True)
        return extracted_dir

    def _resolve_safe_path(self, extracted_dir: str, rel_path: str) -> str:
        """Validate and resolve relative path inside the extracted backup directory without escaping."""
        if not rel_path or not rel_path.strip():
            rel_path = "/"

        if "\x00" in rel_path:
            raise BadRequestError(message="Invalid path: null bytes not allowed.")

        clean_rel = rel_path.strip().lstrip("/")
        normalized = posixpath.normpath(clean_rel)
        if normalized == ".":
            normalized = ""

        full_path = os.path.abspath(os.path.join(extracted_dir, normalized))
        if not full_path.startswith(os.path.abspath(extracted_dir)):
            raise BadRequestError(message="Access restricted: path traversal outside backup directory.")

        return full_path

    async def list_files(self, project_id: str, relative_path: str = "/") -> FileListResponse:
        """List files and folders from the offline extracted ADB backup."""
        extracted_dir = await self._get_extracted_dir(project_id)
        target_dir = self._resolve_safe_path(extracted_dir, relative_path)

        if not os.path.exists(target_dir):
            raise NotFoundError(message=f"Path '{relative_path}' not found in project backup.")

        if not os.path.isdir(target_dir):
            raise BadRequestError(message=f"Path '{relative_path}' is not a directory.")

        items: List[FileItem] = []
        try:
            with os.scandir(target_dir) as entries:
                for entry in entries:
                    is_dir = entry.is_dir()
                    item_rel = "/" + os.path.relpath(entry.path, extracted_dir).replace("\\", "/")
                    size = entry.stat().st_size if not is_dir else 0
                    mtime = datetime.datetime.fromtimestamp(
                        entry.stat().st_mtime, tz=datetime.timezone.utc
                    ).isoformat()
                    ext = os.path.splitext(entry.name)[1].lower().lstrip(".") or None

                    items.append(
                        FileItem(
                            name=entry.name,
                            path=item_rel,
                            is_dir=is_dir,
                            size=size,
                            modified_at=mtime,
                            extension=ext,
                        )
                    )
        except Exception as e:
            raise AppError(message=f"Error listing backup files: {str(e)}")

        # Sort directories first, then alphabetically
        items.sort(key=lambda x: (not x.is_dir, x.name.lower()))

        current_norm_path = "/" + os.path.relpath(target_dir, extracted_dir).replace("\\", "/")
        if current_norm_path == "/.":
            current_norm_path = "/"

        return FileListResponse(
            project_id=project_id,
            current_path=current_norm_path,
            items=items,
        )

    async def stat_file(self, project_id: str, relative_path: str) -> FileItem:
        """Get metadata / hash for a specific file or folder in the project backup."""
        extracted_dir = await self._get_extracted_dir(project_id)
        target_path = self._resolve_safe_path(extracted_dir, relative_path)

        if not os.path.exists(target_path):
            raise NotFoundError(message=f"Path '{relative_path}' not found in project backup.")

        is_dir = os.path.isdir(target_path)
        stat = os.stat(target_path)
        size = stat.st_size if not is_dir else 0
        mtime = datetime.datetime.fromtimestamp(stat.st_mtime, tz=datetime.timezone.utc).isoformat()
        sha256_hash = self._compute_sha256(target_path) if not is_dir else None
        ext = os.path.splitext(target_path)[1].lower().lstrip(".") or None
        name = os.path.basename(target_path) or "/"
        rel_norm = "/" + os.path.relpath(target_path, extracted_dir).replace("\\", "/")

        return FileItem(
            name=name,
            path=rel_norm,
            is_dir=is_dir,
            size=size,
            modified_at=mtime,
            sha256=sha256_hash,
            extension=ext,
        )

    async def get_file_for_download(self, project_id: str, relative_path: str) -> Tuple[str, str]:
        """Retrieve local absolute path and filename of a backup file for browser download."""
        extracted_dir = await self._get_extracted_dir(project_id)
        target_path = self._resolve_safe_path(extracted_dir, relative_path)

        if not os.path.exists(target_path):
            raise NotFoundError(message=f"File '{relative_path}' not found in project backup.")

        if os.path.isdir(target_path):
            raise BadRequestError(message=f"Cannot download directory directly. Use export to extract folders.")

        filename = os.path.basename(target_path)
        return target_path, filename

    async def export_file_or_dir(
        self, project_id: str, relative_path: str, destination_path: str
    ) -> Dict[str, Any]:
        """Export/copy a file or directory from the extracted backup to a host location."""
        extracted_dir = await self._get_extracted_dir(project_id)
        source_path = self._resolve_safe_path(extracted_dir, relative_path)

        if not os.path.exists(source_path):
            raise NotFoundError(message=f"Source '{relative_path}' not found in project backup.")

        resolved_dest = os.path.abspath(destination_path)
        try:
            if os.path.isdir(source_path):
                os.makedirs(resolved_dest, exist_ok=True)
                dest_folder = os.path.join(resolved_dest, os.path.basename(source_path))
                shutil.copytree(source_path, dest_folder, dirs_exist_ok=True)
                final_dest = dest_folder
            else:
                if os.path.isdir(resolved_dest) or not os.path.splitext(resolved_dest)[1]:
                    os.makedirs(resolved_dest, exist_ok=True)
                    final_dest = os.path.join(resolved_dest, os.path.basename(source_path))
                else:
                    os.makedirs(os.path.dirname(resolved_dest), exist_ok=True)
                    final_dest = resolved_dest
                shutil.copy2(source_path, final_dest)

            return {
                "source_path": relative_path,
                "destination_path": final_dest,
                "exported_size": os.path.getsize(final_dest) if os.path.isfile(final_dest) else 0,
            }
        except Exception as e:
            raise AppError(message=f"Export failed: {str(e)}")

    async def find_by_hash(self, project_id: str, hash_value: str) -> List[Dict[str, Any]]:
        """Find files in the backup by SHA-256 hash."""
        project_db = db_manager.client[f"OpenAF_{project_id}"]
        collection = project_db["backup_files"]
        cursor = collection.find({"sha256": hash_value.strip().lower()})
        results = []
        async for doc in cursor:
            doc["_id"] = str(doc["_id"])
            results.append(doc)
        return results
