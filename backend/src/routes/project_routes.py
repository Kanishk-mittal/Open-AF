from fastapi import APIRouter, Depends, status
from models.project_model import ProjectListItem, ProjectMetadataCreate, ProjectMetadataModel
from repository.project_repository import ProjectRepository
from services.project_service import ProjectService


router = APIRouter()

# Dependency Providers
def get_repository() -> ProjectRepository:
    return ProjectRepository()

def get_service(repo: ProjectRepository = Depends(get_repository)) -> ProjectService:
    return ProjectService(repository=repo)

@router.get("", response_model=list[ProjectListItem], status_code=status.HTTP_200_OK)
async def list_projects(
    service: ProjectService = Depends(get_service)
):
    return await service.list_projects()

@router.post("", response_model=ProjectMetadataModel, status_code=status.HTTP_201_CREATED)
async def create_project(
    payload: ProjectMetadataCreate,
    service: ProjectService = Depends(get_service)
):
    # Receive request and redirect to project service
    return await service.initialize_project(payload)