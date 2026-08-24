import datetime
from fastapi import HTTPException, status
from models.project_model import ProjectListItem, ProjectMetadataModel
from motor.motor_asyncio import AsyncIOMotorDatabase
from lib.database import db_manager

class ProjectRepository:
    def get_database(self, project_id: str) -> AsyncIOMotorDatabase:
        db_name = f"OpenAF_{project_id}"
        return db_manager.client[db_name]

    async def create_project_metadata(self, project_id: str, metadata_data: dict) -> ProjectMetadataModel:
        db = self.get_database(project_id)
        collection = db["metadata"]

        doc = metadata_data.copy()
        doc["created_at"] = datetime.datetime.now(datetime.timezone.utc)

        result = await collection.insert_one(doc)
        
        # Fetch the inserted document
        inserted_doc = await collection.find_one({"_id": result.inserted_id})
        
        # Null check resolves "None is not subscriptable" and handles missing documents
        if not inserted_doc:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to retrieve project metadata after creation."
            )

        # Convert BSON ObjectId to string
        inserted_doc["_id"] = str(inserted_doc["_id"])
        
        # model_validate safely converts dict data into the Pydantic model
        return ProjectMetadataModel.model_validate(inserted_doc)

    async def list_projects(self) -> list[ProjectListItem]:
        db_names = await db_manager.client.list_database_names()
        projects: list[ProjectListItem] = []
        for name in db_names:
            if name.startswith("OpenAF_"):
                project_id = name.removeprefix("OpenAF_")
                db = db_manager.client[name]
                collection = db["metadata"]
                doc = await collection.find_one({}, {"title": 1, "case_number": 1})
                if doc:
                    projects.append(
                        ProjectListItem(
                            id=project_id,
                            title=doc.get("title", ""),
                            case_number=doc.get("case_number", "")
                        )
                    )
        return projects

    async def get_project_metadata(self, project_id: str) -> ProjectMetadataModel:
        db_name = f"OpenAF_{project_id}"
        db_names = await db_manager.client.list_database_names()
        if db_name not in db_names:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Project '{project_id}' not found."
            )

        db = self.get_database(project_id)
        collection = db["metadata"]
        doc = await collection.find_one({})
        if not doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Project '{project_id}' not found."
            )

        doc["_id"] = str(doc["_id"])
        return ProjectMetadataModel.model_validate(doc)

    async def update_project_metadata(self, project_id: str, update_data: dict) -> ProjectMetadataModel:
        db_name = f"OpenAF_{project_id}"
        db_names = await db_manager.client.list_database_names()
        if db_name not in db_names:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Project '{project_id}' not found."
            )

        db = self.get_database(project_id)
        collection = db["metadata"]

        if update_data:
            await collection.update_one({}, {"$set": update_data})

        doc = await collection.find_one({})
        if not doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Project '{project_id}' not found."
            )

        doc["_id"] = str(doc["_id"])
        return ProjectMetadataModel.model_validate(doc)

    async def delete_project(self, project_id: str) -> None:
        db_name = f"OpenAF_{project_id}"
        db_names = await db_manager.client.list_database_names()
        if db_name in db_names:
            await db_manager.client.drop_database(db_name)