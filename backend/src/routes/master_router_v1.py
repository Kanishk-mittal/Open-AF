from fastapi import APIRouter
from .project_routes import project_router

master_router_v1 = APIRouter()

master_router_v1.include_router(
    project_router,
    prefix="/project",
    tags=["Project"]
)
