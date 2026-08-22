from core.api_response import APIResponse
from fastapi import APIRouter

project_router = APIRouter()

@project_router.get("/")
async def get_projects():
    return APIResponse(
        success=True,
        message="Projects retrieved successfully.",
        data={"projects": []},
        errors=None
    )