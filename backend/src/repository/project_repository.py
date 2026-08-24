import datetime
from fastapi import HTTPException, status
from models.project_model import ProjectMetadataModel
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