# device_info/main.py
#backend #plugins #device_info

**Path**: `backend/src/plugins/device_info/main.py`

## Purpose
The entry point class `DeviceInfoPlugin` for the `DeviceInfo` plugin.

## Logic
Implements the `IPlugin` interface from [[backend/src/plugins/plugin_interface.py]] (Docs: [[docs/backend/src/plugins/plugin_interface.py.md]]).

- **Class**: `DeviceInfoPlugin(IPlugin)`
  - Initializes with name="DeviceInfo" and id="device_info".
  - Instantiates `DeviceInfoService` from [[backend/src/plugins/device_info/service.py]] (Docs: [[docs/backend/src/plugins/device_info/service.py.md]]).
  - `getRouter()`: Returns the plugin router from [[backend/src/plugins/device_info/router.py]] (Docs: [[docs/backend/src/plugins/device_info/router.py.md]]).
  - `initialize(project_id: str)`: Calls `self.service.save_device_info_for_project(project_id)` to extract and store target device metadata into the project database upon project initialization.

## Components & Structure
- **Router**: [[backend/src/plugins/device_info/router.py]] (Docs: [[docs/backend/src/plugins/device_info/router.py.md]]) - Exposes `/device-info/{project_id}` endpoint.
- **Service**: [[backend/src/plugins/device_info/service.py]] (Docs: [[docs/backend/src/plugins/device_info/service.py.md]]) - Performs ADB shell commands to extract hardware, OS, IMEI, MAC, and root details.

## Connections
- **Imports from**: 
  - [[backend/src/plugins/plugin_interface.py]] (Docs: [[docs/backend/src/plugins/plugin_interface.py.md]])
  - [[backend/src/plugins/device_info/router.py]] (Docs: [[docs/backend/src/plugins/device_info/router.py.md]])
  - [[backend/src/plugins/device_info/service.py]] (Docs: [[docs/backend/src/plugins/device_info/service.py.md]])
- **Imported by**: [[backend/src/plugins/registry.py]] (Docs: [[docs/backend/src/plugins/registry.py.md]]) where it is added to the active plugin list.
