# master_router_v1.py
#backend #routes #router

**Path**: `backend/src/routes/master_router_v1.py`

## Purpose
Acts as the central registry for all core V1 API routes.

## Logic
Creates an `APIRouter` instance (`master_router_v1`) and includes individual domain routers under specific prefixes.

- **Included Routers**:
  - `project_router` from [[backend/src/routes/project_routes.py]] (Docs: [[docs/backend/src/routes/project_routes.py.md]]) is mounted at `/projects` with the "Projects" tag.
  - `adb_router` from [[backend/src/routes/adb_routes.py]] (Docs: [[docs/backend/src/routes/adb_routes.py.md]]) is mounted at `/adb` with the "ADB" tag.

## Connections
- **Imported by**: [[backend/main.py]] (Docs: [[docs/backend/main.py.md]]) which mounts it to the FastAPI app under `/api/v1`.
- **Imports from**: [[backend/src/routes/project_routes.py]] (Docs: [[docs/backend/src/routes/project_routes.py.md]]), [[backend/src/routes/adb_routes.py]] (Docs: [[docs/backend/src/routes/adb_routes.py.md]]).
