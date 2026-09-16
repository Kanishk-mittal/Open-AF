from typing import List, Optional
from pydantic import BaseModel, Field


class FileItem(BaseModel):
    name: str = Field(..., description="File or directory name")
    path: str = Field(..., description="Relative path in backup (e.g. /shared/Download/file.txt)")
    is_dir: bool = Field(..., description="True if item is a directory")
    size: int = Field(default=0, description="File size in bytes")
    modified_at: Optional[str] = Field(default=None, description="Last modified ISO timestamp")
    sha256: Optional[str] = Field(default=None, description="SHA-256 hash of file content if computed")
    extension: Optional[str] = Field(default=None, description="File extension")


class FileListRequest(BaseModel):
    project_id: str = Field(..., description="Project ID to browse backup files for")
    path: str = Field(default="/", description="Relative directory path in backup to list (e.g. / or /shared or /apps)")


class FileListResponse(BaseModel):
    project_id: str = Field(..., description="Project ID")
    current_path: str = Field(..., description="Current normalized relative directory path")
    items: List[FileItem] = Field(default_factory=list, description="List of files and directories")


class FileStatRequest(BaseModel):
    project_id: str = Field(..., description="Project ID")
    path: str = Field(..., description="Relative file or directory path in backup")


class FileDownloadRequest(BaseModel):
    project_id: str = Field(..., description="Project ID")
    path: str = Field(..., description="Relative file path in backup to download")


class FileExportRequest(BaseModel):
    project_id: str = Field(..., description="Project ID")
    path: str = Field(..., description="Relative path of file or directory in backup")
    destination_path: str = Field(..., description="Local host destination directory or file path")


class FileHashSearchRequest(BaseModel):
    project_id: str = Field(..., description="Project ID")
    hash: str = Field(..., description="SHA-256 hash to search for")
