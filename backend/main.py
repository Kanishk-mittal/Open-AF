from fastapi import FastAPI
from fastapi.concurrency import asynccontextmanager
from lib.database import close_mongo_connection, connect_to_mongo
from routes.master_router_v1 import master_router_v1
from core.exception_handlers import register_exception_handlers

@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_mongo()
    yield
    await close_mongo_connection()

app = FastAPI(lifespan=lifespan)

# Register global exception handlers
register_exception_handlers(app)

app.include_router(master_router_v1, prefix="/api/v1")

@app.get("/health")
async def root():
    return {"message": "Backend is healthy!"}