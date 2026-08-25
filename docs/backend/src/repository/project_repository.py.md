# project_repository.py
#backend #repository #database #projects

**Path**: `backend/src/repository/project_repository.py`

## Purpose
Handles all direct interactions with the MongoDB database for project-related data.

## Logic
- **Database Architecture**: Implements a database-per-project architecture. `get_database(project_id)` returns a database instance named `OpenAF_{project_id}`.
- `create_project_metadata`: Inserts a new project metadata document into the `metadata` collection of the specific project's database. Adds a `created_at` timestamp.
- `list_projects`: Queries the MongoDB server for all database names, filters for `OpenAF_`, and retrieves the title and case number from the `metadata` collection in each database to construct a summary list.
- `get_project_metadata`, `update_project_metadata`: Queries/updates the `metadata` collection for a given project ID.
- `delete_project`: Completely drops the `OpenAF_{project_id}` database from the MongoDB server.

## Connections
- **Called by**: [[backend/src/services/project_service.py]] (Docs: [[docs/backend/src/services/project_service.py.md]])
- **Depends on**: `db_manager` from [[backend/src/lib/database.py]] (Docs: [[docs/backend/src/lib/database.py.md]]) to execute queries via `AsyncIOMotorDatabase`.
- **Returns**: Models defined in [[backend/src/models/project_model.py]] (Docs: [[docs/backend/src/models/project_model.py.md]]).
