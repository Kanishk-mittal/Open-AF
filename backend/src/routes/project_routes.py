from fastapi import APIRouter, Depends, status
from core.api_response import APIResponse
from models.project_model import (
    ProjectListItem,
    ProjectMetadataCreate,
    ProjectMetadataModel,
    ProjectMetadataUpdate,
)
from repository.project_repository import ProjectRepository
from services.project_service import ProjectService


router = APIRouter()

# Dependency Providers
def get_repository() -> ProjectRepository:
    return ProjectRepository()

def get_service(repo: ProjectRepository = Depends(get_repository)) -> ProjectService:
    return ProjectService(repository=repo)

@router.get("", response_model=APIResponse[list[ProjectListItem]], status_code=status.HTTP_200_OK)
async def list_projects(
    service: ProjectService = Depends(get_service)
):
    projects = await service.list_projects()
    return APIResponse(
        success=True,
        message="Projects retrieved successfully.",
        data=projects
    )

@router.get("/{project_id}", response_model=APIResponse[ProjectMetadataModel], status_code=status.HTTP_200_OK)
async def get_project_metadata(
    project_id: str,
    service: ProjectService = Depends(get_service)
):
    metadata = await service.get_project_metadata(project_id)
    return APIResponse(
        success=True,
        message="Project metadata retrieved successfully.",
        data=metadata
    )

@router.post("", response_model=APIResponse[ProjectMetadataModel], status_code=status.HTTP_201_CREATED)
async def create_project(
    payload: ProjectMetadataCreate,
    service: ProjectService = Depends(get_service)
):
    project = await service.initialize_project(payload)
    return APIResponse(
        success=True,
        message="Project created successfully.",
        data=project
    )

@router.patch("/{project_id}", response_model=APIResponse[ProjectMetadataModel], status_code=status.HTTP_200_OK)
async def update_project(
    project_id: str,
    payload: ProjectMetadataUpdate,
    service: ProjectService = Depends(get_service)
):
    updated = await service.update_project_metadata(project_id, payload)
    return APIResponse(
        success=True,
        message="Project metadata updated successfully.",
        data=updated
    )

@router.delete("/{project_id}", response_model=APIResponse[None], status_code=status.HTTP_200_OK)
async def delete_project(
    project_id: str,
    service: ProjectService = Depends(get_service)
):
    await service.delete_project(project_id)
    return APIResponse(
        success=True,
        message=f"Project '{project_id}' deleted successfully.",
        data=None
    )