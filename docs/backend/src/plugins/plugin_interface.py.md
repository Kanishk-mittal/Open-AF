# plugin_interface.py
#backend #plugins #interface

**Path**: `backend/src/plugins/plugin_interface.py`

## Purpose
Defines the abstract base class `IPlugin` that all Open AF plugins must implement. This enforces a consistent structure for plugins.
A Forensic software can have a ton of features so to keep the code modular and make it easy to add features we will use this plugin mech where we will add each group of features into a plugin and can rol out features easily

## Logic
- `IPlugin (ABC)`: The base class.
  - `__init__(self, name: str, id: str)`: Sets the plugin's name and unique ID.
  - `@abstractmethod getRouter(self) -> APIRouter`: Must return a FastAPI APIRouter containing the plugin's routes.
  - `@abstractmethod async def initialize(self, project_id: str)`: A hook called when a project is initialized, allowing the plugin to set up its own database tables or run initialization tasks.

## Connections
- **Inherited by**: Every plugin in the system, e.g., `DeviceInfoPlugin` in [[backend/src/plugins/device_info/main.py]] (Docs: [[docs/backend/src/plugins/device_info/main.py.md]]).
- **Used by**: [[backend/src/plugins/registry.py]] (Docs: [[docs/backend/src/plugins/registry.py.md]]) for typing the plugins list.
