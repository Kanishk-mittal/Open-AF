# Open AF Codebase Overview
#architecture #overview #python #fastapi

The Open AF project currently consists of a Python FastAPI backend. The frontend is not yet initialized.

## Backend Architecture
The backend is structured using a domain-driven, modular approach. It relies on a plugin-based architecture for extendability and MongoDB for storage.

- **Entry Point**: [[backend/main.py]] (Docs: [[docs/backend/main.py.md]])
- **Configuration**: [[backend/src/config/config.py]] (Docs: [[docs/backend/src/config/config.py.md]])
- **Core Components**: Exception handlers, loggers, standard API responses.
- **Routes**: API endpoints. The main entry is [[backend/src/routes/master_router_v1.py]] (Docs: [[docs/backend/src/routes/master_router_v1.py.md]])
- **Plugins**: A registry of plugins that dynamically extend the backend. [[backend/src/plugins/registry.py]] (Docs: [[docs/backend/src/plugins/registry.py.md]]) and [[backend/src/plugins/plugin_interface.py]] (Docs: [[docs/backend/src/plugins/plugin_interface.py.md]])
- **Services & Repositories**: The core business logic and database access layer for projects.

### Key Workflows
1. **App Initialization**: When [[backend/main.py]] (Docs: [[docs/backend/main.py.md]]) starts, it establishes a MongoDB connection via `lifespan`, registers global exceptions, sets up standard routes via `master_router_v1`, and dynamically loads all plugins from the `PLUGINS` registry.
2. **Projects Management**: Handled via [[backend/src/routes/project_routes.py]] (Docs: [[docs/backend/src/routes/project_routes.py.md]]), leveraging [[backend/src/services/project_service.py]] (Docs: [[docs/backend/src/services/project_service.py.md]]) and [[backend/src/repository/project_repository.py]] (Docs: [[docs/backend/src/repository/project_repository.py.md]]).
3. **Database**: Managed by Motor (async MongoDB client). Each project seems to have its own database (`OpenAF_<project_id>`).

## Explore Backend Modules

- **Core Application**
  - [[backend/main.py]] (Docs: [[docs/backend/main.py.md]]) - Application entry point
  - [[backend/src/config/config.py]] (Docs: [[docs/backend/src/config/config.py.md]]) - Configuration and Env Vars
  - [[backend/src/lib/database.py]] (Docs: [[docs/backend/src/lib/database.py.md]]) - MongoDB Connection Manager
- **Routing**
  - [[backend/src/routes/master_router_v1.py]] (Docs: [[docs/backend/src/routes/master_router_v1.py.md]]) - Main V1 Router
  - [[backend/src/routes/project_routes.py]] (Docs: [[docs/backend/src/routes/project_routes.py.md]]) - Project API Routes
  - [[backend/src/routes/adb_routes.py]] (Docs: [[docs/backend/src/routes/adb_routes.py.md]]) - ADB API Routes
- **Core**
  - [[backend/src/core/api_response.py]] (Docs: [[docs/backend/src/core/api_response.py.md]]) - Generic `APIResponse[T]` Pydantic wrapper
  - [[backend/src/core/exception_handlers.py]] (Docs: [[docs/backend/src/core/exception_handlers.py.md]]) - Global FastAPI exception handlers
  - [[backend/src/core/logger.py]] (Docs: [[docs/backend/src/core/logger.py.md]]) - Singleton application logger
- **Services (Business Logic)**
  - [[backend/src/services/project_service.py]] (Docs: [[docs/backend/src/services/project_service.py.md]]) - Project management logic
  - [[backend/src/services/adb_service.py]] (Docs: [[docs/backend/src/services/adb_service.py.md]]) - ADB command execution
- **Repositories (Data Access)**
  - [[backend/src/repository/project_repository.py]] (Docs: [[docs/backend/src/repository/project_repository.py.md]]) - MongoDB project data access
- **Utils**
  - [[backend/src/utils/response_utils.py]] (Docs: [[docs/backend/src/utils/response_utils.py.md]]) - Success/error `JSONResponse` builder
- **Errors**
  - [[backend/src/errors/custom_errors.py]] (Docs: [[docs/backend/src/errors/custom_errors.py.md]]) - Custom exception hierarchy
  - [[backend/src/errors/__init__.py]] (Docs: [[docs/backend/src/errors/__init__.py.md]]) - Package re-exports
- **Models (Schemas)**
  - [[backend/src/models/project_model.py]] (Docs: [[docs/backend/src/models/project_model.py.md]]) - Pydantic models for projects
  - [[backend/src/models/device_model.py]] (Docs: [[docs/backend/src/models/device_model.py.md]]) - Pydantic models for target device info
- **Plugins System**
  - [[backend/src/plugins/registry.py]] (Docs: [[docs/backend/src/plugins/registry.py.md]]) - Registry of active plugins
  - [[backend/src/plugins/plugin_interface.py]] (Docs: [[docs/backend/src/plugins/plugin_interface.py.md]]) - Interface all plugins must follow
  - [[backend/src/plugins/device_info/main.py]] (Docs: [[docs/backend/src/plugins/device_info/main.py.md]]) - Device Info plugin entry point
  - [[backend/src/plugins/device_info/router.py]] (Docs: [[docs/backend/src/plugins/device_info/router.py.md]]) - Device Info plugin API router
  - [[backend/src/plugins/device_info/service.py]] (Docs: [[docs/backend/src/plugins/device_info/service.py.md]]) - Device Info plugin ADB extraction service
