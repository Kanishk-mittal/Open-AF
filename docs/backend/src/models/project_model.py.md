# project_model.py
#backend #models #projects

**Path**: `backend/src/models/project_model.py`

## Purpose
Defines the Pydantic models for data validation and serialization concerning projects.

## Logic
- `NonEmptyStr`: A reusable string type constraint ensuring whitespace stripping and a minimum length of 1.
- `ProjectMetadataCreate`: Validates the payload for creating a new project (requires fields like `title`, `examiner_name`, `case_number`, etc.).
- `ProjectMetadataModel`: Inherits from `ProjectMetadataCreate`, adds `_id` and `created_at`. This represents the data exactly as it's stored in MongoDB.
- `ProjectMetadataUpdate`: Makes all fields optional for PATCH requests.
- `ProjectListItem`: A simplified model used for listing projects (`id`, `title`, `case_number`).

## Connections
- **Imported by**: 
  - [[backend/src/routes/project_routes.py]] (Docs: [[docs/backend/src/routes/project_routes.py.md]]) for request/response typing.
  - [[backend/src/repository/project_repository.py]] (Docs: [[docs/backend/src/repository/project_repository.py.md]]) for data validation and parsing BSON responses.
