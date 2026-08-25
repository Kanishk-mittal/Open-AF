# project_routes.py
#backend #routes #projects

**Path**: `backend/src/routes/project_routes.py`

## Purpose
Exposes API endpoints for managing projects.

## Logic
Defines REST endpoints for the `/projects` prefix. It heavily depends on `ProjectService` for business logic.

- **Endpoints**:
  - `GET /`: Lists all projects (`service.list_projects()`).
  - `GET /{project_id}`: Retrieves metadata for a specific project.
  - `POST /`: Creates a new project from `ProjectMetadataCreate` payload (`service.initialize_project()`).
  - `PATCH /{project_id}`: Updates existing project metadata.
  - `DELETE /{project_id}`: Deletes a project.
  - `GET /{project_id}/export`: Exports the project to a specified destination directory.

## Connections
- **Imported by**: [[backend/src/routes/master_router_v1.py]] (Docs: [[docs/backend/src/routes/master_router_v1.py.md]])
- **Depends on**: 
  - [[backend/src/services/project_service.py]] (Docs: [[docs/backend/src/services/project_service.py.md]])
  - Models like `ProjectMetadataCreate`, `ProjectMetadataUpdate` from [[backend/src/models/project_model.py]] (Docs: [[docs/backend/src/models/project_model.py.md]]).
