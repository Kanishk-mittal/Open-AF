from fastapi import APIRouter
from .project_routes import router as project_router
from .adb_routes import router as adb_router

master_router_v1 = APIRouter()

master_router_v1.include_router(
    project_router,
    prefix="/projects",
    tags=["Projects"]
)

master_router_v1.include_router(
    adb_router,
    prefix="/adb",
    tags=["ADB"]
)

