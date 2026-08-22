from fastapi import FastAPI
from routes.master_router_v1 import master_router_v1

app = FastAPI()

app.include_router(master_router_v1, prefix="/api/v1")

@app.get("/health")
async def root():
    return {"message": "Backend is healthy!"}