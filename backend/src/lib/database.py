from motor.motor_asyncio import AsyncIOMotorClient
import os

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")

class MongoManager:
    client: AsyncIOMotorClient

db_manager = MongoManager()

async def connect_to_mongo():
    db_manager.client = AsyncIOMotorClient(MONGODB_URL)

async def close_mongo_connection():
    if db_manager.client:
        db_manager.client.close()

# Dependency to get a specific project's database
def get_project_db(case_id: str):
    # Returns handle directly to 'case_<case_id>' database
    return db_manager.client[f"case_{case_id}"]