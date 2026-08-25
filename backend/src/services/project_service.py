import os
import shutil
import tempfile
import uuid
import datetime
import asyncio
from typing import Optional
from fastapi import HTTPException, status
from config.config import settings
from models.project_model import (
    ProjectListItem,
    ProjectMetadataCreate,
    ProjectMetadataModel,
    ProjectMetadataUpdate,
)
from repository.project_repository import ProjectRepository


class ProjectService:
    def __init__(self, repository: ProjectRepository):
        self.repository = repository

    async def list_projects(self) -> list[ProjectListItem]:
        return await self.repository.list_projects()

    async def get_project_metadata(self, project_id: str) -> ProjectMetadataModel:
        return await self.repository.get_project_metadata(project_id)

    async def update_project_metadata(
        self, 
        project_id: str, 
        payload: ProjectMetadataUpdate
    ) -> ProjectMetadataModel:
        update_data = payload.model_dump(exclude_unset=True)
        return await self.repository.update_project_metadata(project_id, update_data)

    async def delete_project(self, project_id: str) -> None:
        await self.repository.delete_project(project_id)

    async def export_project(self, project_id: str, destination_path: str) -> str:
        # 1. Verify project exists
        await self.get_project_metadata(project_id)

        # 2. Validate / prepare destination directory
        resolved_dest_dir = os.path.abspath(destination_path)
        try:
            os.makedirs(resolved_dest_dir, exist_ok=True)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid destination directory: {e}"
            )

        db_name = f"OpenAF_{project_id}"
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        archive_name = f"{db_name}_{timestamp}"
        target_zip_file = os.path.join(resolved_dest_dir, f"{archive_name}.zip")

        # 3. Create temp directory for mongodump output
        temp_dir = tempfile.mkdtemp(prefix="openaf_export_")
        try:
            cmd = [
                "mongodump",
                f"--uri={settings.MONGO_URL}",
                f"--db={db_name}",
                f"--out={temp_dir}"
            ]

            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            stdout, stderr = await process.communicate()

            if process.returncode != 0:
                error_msg = stderr.decode() if stderr else "Unknown mongodump error"
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Failed to dump database: {error_msg}"
                )

            # Dump directory contains temp_dir/OpenAF_<project_id>
            dump_source_path = os.path.join(temp_dir, db_name)
            if not os.path.exists(dump_source_path):
                # If mongodump produced output directly at temp_dir
                dump_source_path = temp_dir

            # 4. Zip the dump folder and write directly to destination
            zip_base_name = os.path.join(resolved_dest_dir, archive_name)
            shutil.make_archive(
                base_name=zip_base_name,
                format="zip",
                root_dir=temp_dir,
                base_dir=db_name if os.path.exists(os.path.join(temp_dir, db_name)) else None
            )

            return target_zip_file

        finally:
            # 5. Clean up temporary dump directory
            if os.path.exists(temp_dir):
                shutil.rmtree(temp_dir, ignore_errors=True)

    async def import_project(self, archive_path: str) -> str:
        resolved_path = os.path.abspath(archive_path)

        # 1. Validate file exists and is a file
        if not os.path.exists(resolved_path) or not os.path.isfile(resolved_path):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Archive file not found: {archive_path}"
            )

        # 2. Temporary extraction directory
        temp_dir = tempfile.mkdtemp(prefix="openaf_import_")
        try:
            try:
                shutil.unpack_archive(resolved_path, temp_dir, "zip")
            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid or corrupted zip archive: {e}"
                )

            # 3. Locate the OpenAF_<project_id> directory containing .bson files
            found_db_dir = None
            found_project_id = None

            for root, dirs, files in os.walk(temp_dir):
                dir_name = os.path.basename(root)
                if dir_name.startswith("OpenAF_"):
                    # Check if there are .bson files inside this directory
                    if any(f.endswith(".bson") for f in files):
                        found_db_dir = root
                        found_project_id = dir_name.removeprefix("OpenAF_")
                        break

            if not found_db_dir or not found_project_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="No valid OpenAF project database dump found in the archive."
                )

            # 4. Run mongorestore --drop with dump source directory
            db_name = f"OpenAF_{found_project_id}"
            parent_dir = os.path.dirname(found_db_dir)

            cmd = [
                "mongorestore",
                f"--uri={settings.MONGO_URL}",
                f"--nsInclude={db_name}.*",
                "--drop",
                parent_dir
            ]

            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            stdout, stderr = await process.communicate()

            if process.returncode != 0:
                error_msg = stderr.decode() if stderr else "Unknown mongorestore error"
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Failed to restore database: {error_msg}"
                )

            return found_project_id

        finally:
            if os.path.exists(temp_dir):
                shutil.rmtree(temp_dir, ignore_errors=True)

    async def initialize_project(
        self, 
        payload: ProjectMetadataCreate, 
        device_serial: Optional[str] = None
    ) -> ProjectMetadataModel:
        # 1. Generate unique project ID
        project_id = str(uuid.uuid4())

        metadata_dict = payload.model_dump()
        serial_to_use = device_serial or payload.device_serial
        if serial_to_use is not None:
            metadata_dict["device_serial"] = serial_to_use

        # 2. Forward payload to repository
        created_metadata = await self.repository.create_project_metadata(
            project_id=project_id, 
            metadata_data=metadata_dict
        )

        # 3. Call initialize on all registered plugins
        from src.plugins.registry import PLUGINS
        for plugin in PLUGINS:
            try:
                await plugin.initialize(project_id=project_id)
            except Exception as e:
                print(f"Warning: Plugin {plugin.name} failed to initialize for {project_id}: {e}")

        # 4. Return metadata along with ID
        return created_metadata