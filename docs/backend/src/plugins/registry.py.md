# registry.py
#backend #plugins #registry

**Path**: `backend/src/plugins/registry.py`

## Purpose
Maintains a list of all active plugins in the system.

## Logic
Defines a `PLUGINS` list of type `List[IPlugin]`.
When a new plugin is added to the system, it must be instantiated and appended to this list.

- **Current Plugins**:
  - `DeviceInfoPlugin` from [[backend/src/plugins/device_info/main.py]] (Docs: [[docs/backend/src/plugins/device_info/main.py.md]]).

## Connections
- **Imported by**: [[backend/main.py]] (Docs: [[docs/backend/main.py.md]]) to dynamically mount plugin routers to the application.
- **Imports from**: [[backend/src/plugins/plugin_interface.py]] (Docs: [[docs/backend/src/plugins/plugin_interface.py.md]]) for typing, and individual plugin main files like [[backend/src/plugins/device_info/main.py]] (Docs: [[docs/backend/src/plugins/device_info/main.py.md]]).
