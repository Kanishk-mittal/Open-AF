from fastapi import APIRouter, status
from lib.database import db_manager
from utils.response_utils import ResponseUtils

router = APIRouter(prefix="/device-info", tags=["device-info"])

@router.get("/{project_id}")
async def get_device_info(project_id: str):
    # Retrieve the database for the given project
    project_db = db_manager.client[f"OpenAF_{project_id}"]
    collection = project_db["device_info"]
    
    # Find the device info document
    doc = await collection.find_one({})
    if not doc:
        return ResponseUtils.error(
            message=f"Device info not found for project {project_id}",
            status_code=status.HTTP_404_NOT_FOUND
        )
    
    # Convert ObjectId to string for JSON serialization
    doc["_id"] = str(doc["_id"])
    
    return ResponseUtils.success(
        data=doc,
        message="Device info retrieved successfully."
    )
