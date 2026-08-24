import uuid
from typing import Optional
from models.project_model import (
    ProjectListItem,
    ProjectMetadataCreate,
    ProjectMetadataModel,
    ProjectMetadataUpdate,
)
from repository.project_repository import ProjectRepository
from services.project_init_service import ProjectInit


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

        # 3. Save target device information in 'device_info' collection if serial provided
        if serial_to_use:
            try:
                db = self.repository.get_database(project_id)
                await ProjectInit.save_device_info(device_serial=serial_to_use, project_db=db)
            except Exception as e:
                print(f"Warning: Failed to capture device info for {serial_to_use}: {e}")

        # 4. Print initialization message to terminal
        print(f"initializing project: OpenAF_{project_id}")

        # 5. Return metadata along with ID
        return created_metadata