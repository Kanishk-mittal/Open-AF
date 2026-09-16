import os
from typing import Optional
from fastapi import APIRouter, Query, status
from fastapi.responses import FileResponse

from utils.response_utils import ResponseUtils
from .models import (
    FileDownloadRequest,
    FileExportRequest,
    FileHashSearchRequest,
    FileListRequest,
    FileStatRequest,
)
from .service import AdbBackupService

router = APIRouter(prefix="/backup", tags=["ADB Backup & File Explorer"])
service = AdbBackupService()


# --- Backup Information Endpoint ---

@router.get("/{project_id}")
async def get_project_backup(project_id: str):
    """Retrieve the ADB backup metadata record for a given project."""
    doc = await service.get_backup_for_project(project_id)
    if not doc:
        return ResponseUtils.error(
            message=f"Backup record not found for project {project_id}",
            status_code=status.HTTP_404_NOT_FOUND,
        )

    return ResponseUtils.success(
        data=doc,
        message="Backup metadata retrieved successfully.",
        status_code=status.HTTP_200_OK,
    )


# --- Offline Backup File Explorer Endpoints ---

@router.post("/files/list")
async def list_files_post(payload: FileListRequest):
    """List files in the extracted project backup directory (POST method)."""
    result = await service.list_files(project_id=payload.project_id, relative_path=payload.path)
    return ResponseUtils.success(
        data=result.model_dump(),
        message=f"Directory '{result.current_path}' listed successfully from backup.",
        status_code=status.HTTP_200_OK,
    )


@router.get("/files/list")
async def list_files_get(
    project_id: str = Query(..., description="Project ID to browse files for"),
    path: str = Query(default="/", description="Relative directory path in backup"),
):
    """List files in the extracted project backup directory (GET method)."""
    result = await service.list_files(project_id=project_id, relative_path=path)
    return ResponseUtils.success(
        data=result.model_dump(),
        message=f"Directory '{result.current_path}' listed successfully from backup.",
        status_code=status.HTTP_200_OK,
    )


@router.post("/files/stat")
async def stat_file_post(payload: FileStatRequest):
    """Get metadata and hash for a backup file or directory (POST method)."""
    result = await service.stat_file(project_id=payload.project_id, relative_path=payload.path)
    return ResponseUtils.success(
        data=result.model_dump(),
        message=f"Stat for '{payload.path}' retrieved successfully.",
        status_code=status.HTTP_200_OK,
    )


@router.get("/files/stat")
async def stat_file_get(
    project_id: str = Query(..., description="Project ID"),
    path: str = Query(..., description="Relative file or directory path in backup"),
):
    """Get metadata and hash for a backup file or directory (GET method)."""
    result = await service.stat_file(project_id=project_id, relative_path=path)
    return ResponseUtils.success(
        data=result.model_dump(),
        message=f"Stat for '{path}' retrieved successfully.",
        status_code=status.HTTP_200_OK,
    )


@router.post("/files/download")
async def download_file_post(payload: FileDownloadRequest):
    """Download a file directly from the extracted project backup (POST method)."""
    local_path, filename = await service.get_file_for_download(
        project_id=payload.project_id, relative_path=payload.path
    )
    return FileResponse(
        path=local_path,
        filename=filename,
        media_type="application/octet-stream",
    )


@router.get("/files/download")
async def download_file_get(
    project_id: str = Query(..., description="Project ID"),
    path: str = Query(..., description="Relative file path in backup to download"),
):
    """Download a file directly from the extracted project backup (GET method)."""
    local_path, filename = await service.get_file_for_download(
        project_id=project_id, relative_path=path
    )
    return FileResponse(
        path=local_path,
        filename=filename,
        media_type="application/octet-stream",
    )


@router.post("/files/export")
async def export_file(payload: FileExportRequest):
    """Export a file or folder from the backup to a specified location on the host."""
    result = await service.export_file_or_dir(
        project_id=payload.project_id,
        relative_path=payload.path,
        destination_path=payload.destination_path,
    )
    return ResponseUtils.success(
        data=result,
        message=f"Exported '{payload.path}' to '{result['destination_path']}' successfully.",
        status_code=status.HTTP_200_OK,
    )


@router.post("/files/find-by-hash")
async def find_by_hash_post(payload: FileHashSearchRequest):
    """Search for backup files matching a specific SHA-256 hash (POST method)."""
    matches = await service.find_by_hash(project_id=payload.project_id, hash_value=payload.hash)
    return ResponseUtils.success(
        data=matches,
        message=f"Found {len(matches)} matching file(s) for hash '{payload.hash}'.",
        status_code=status.HTTP_200_OK,
    )


@router.get("/files/find-by-hash")
async def find_by_hash_get(
    project_id: str = Query(..., description="Project ID"),
    hash: str = Query(..., description="SHA-256 hash to find"),
):
    """Search for backup files matching a specific SHA-256 hash (GET method)."""
    matches = await service.find_by_hash(project_id=project_id, hash_value=hash)
    return ResponseUtils.success(
        data=matches,
        message=f"Found {len(matches)} matching file(s) for hash '{hash}'.",
        status_code=status.HTTP_200_OK,
    )
