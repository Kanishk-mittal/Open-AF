# database.py
#backend #database #mongodb

**Path**: `backend/src/lib/database.py`

## Purpose
Manages the global async MongoDB client connection using `motor`.

## Logic
- `MongoManager`: A simple class holding a reference to the `AsyncIOMotorClient`.
- `db_manager`: A global instance of `MongoManager`.
- `connect_to_mongo()`: Initializes the client using the `MONGODB_URL` env variable.
- `close_mongo_connection()`: Safely closes the client.
- `get_project_db(case_id)`: A utility to return a handle to a database named `case_<case_id>`. (Note: [[backend/src/repository/project_repository.py]] (Docs: [[docs/backend/src/repository/project_repository.py.md]]) uses its own naming convention `OpenAF_{project_id}`).

## Connections
- **Imported by**: 
  - [[backend/main.py]] (Docs: [[docs/backend/main.py.md]]) for application lifespan management.
  - [[backend/src/repository/project_repository.py]] (Docs: [[docs/backend/src/repository/project_repository.py.md]]) to execute queries via `db_manager.client`.
