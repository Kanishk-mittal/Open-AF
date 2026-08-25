# project_service.py
#backend #services #projects

**Path**: `backend/src/services/project_service.py`

## Purpose
Contains the core business logic for project management. It acts as the bridge between the API routes and the data repository.

## Logic
- `initialize_project`: Handles project creation. It generates a unique UUID for the new project, saves metadata via the repository, and importantly, **iterates through all loaded plugins in the registry and calls their `initialize(project_id)` method**. This allows plugins to configure themselves when a new project is created.
- `list_projects`, `get_project_metadata`, `update_project_metadata`, `delete_project`: Standard CRUD operations that delegate to the `ProjectRepository`.
- `export_project`: Orchestrates exporting the project data (likely a database dump or zip, though details reside in its implementation).

## Connections
- **Called by**: [[backend/src/routes/project_routes.py]] (Docs: [[docs/backend/src/routes/project_routes.py.md]])
- **Depends on**: 
  - [[backend/src/repository/project_repository.py]] (Docs: [[docs/backend/src/repository/project_repository.py.md]]) for database interaction.
  - [[backend/src/plugins/registry.py]] (Docs: [[docs/backend/src/plugins/registry.py.md]]) (`PLUGINS`) for triggering plugin initialization.
