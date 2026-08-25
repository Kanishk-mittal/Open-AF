# main.py
#backend #entry-point #fastapi

**Path**: `backend/main.py`

This is the main entry point for the FastAPI backend application.

## Purpose
It initializes the FastAPI app, manages application lifespan (startup and shutdown), registers global exception handlers, and dynamically loads all defined routers and plugins.

## Functions & Logic
- `lifespan(app: FastAPI)`: An async context manager that establishes the MongoDB connection (`connect_to_mongo`) on startup and closes it (`close_mongo_connection`) on shutdown. Relies on [[backend/src/lib/database.py]] (Docs: [[docs/backend/src/lib/database.py.md]]).
- **App Initialization**: Creates the `FastAPI` instance with the custom lifespan.
- **Exception Handlers**: Calls `register_exception_handlers(app)` to set up global error handling from [[backend/src/core/exception_handlers.py]] (Docs: [[docs/backend/src/core/exception_handlers.py.md]]).
- **Routing**: 
  - Mounts `master_router_v1` from [[backend/src/routes/master_router_v1.py]] (Docs: [[docs/backend/src/routes/master_router_v1.py.md]]) under `/api/v1`.
  - Iterates through `PLUGINS` imported from [[backend/src/plugins/registry.py]] (Docs: [[docs/backend/src/plugins/registry.py.md]]) and mounts each plugin's router under `/api/v1`.
- `root()`: A simple `/health` GET endpoint returning a status message.

## Connections
- **Imports from**:
  - [[backend/src/lib/database.py]] (Docs: [[docs/backend/src/lib/database.py.md]])
  - [[backend/src/routes/master_router_v1.py]] (Docs: [[docs/backend/src/routes/master_router_v1.py.md]])
  - [[backend/src/core/exception_handlers.py]] (Docs: [[docs/backend/src/core/exception_handlers.py.md]])
  - [[backend/src/plugins/registry.py]] (Docs: [[docs/backend/src/plugins/registry.py.md]])

