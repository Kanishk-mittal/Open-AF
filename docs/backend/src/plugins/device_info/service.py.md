# device_info/service.py
#backend #plugins #device_info #services

**Path**: `backend/src/plugins/device_info/service.py`

## Purpose
Extracts detailed device metadata from an Android target device via ADB commands and saves it to the project's MongoDB database.

## Logic
- `DeviceInfoService`: Service class containing logic for device data extraction.
- `save_device_info_for_project(project_id: str)`: 
  - Retrieves `device_serial` from project metadata via [[backend/src/repository/project_repository.py]] (Docs: [[docs/backend/src/repository/project_repository.py.md]]).
  - Calls `get_device_details(device_serial)` to query device properties.
  - Inserts the resulting `TargetDeviceInformation` dictionary into the `device_info` collection of `OpenAF_{project_id}` database.
- `get_device_details(device_serial: str) -> TargetDeviceInformation`:
  - Executes shell commands via [[backend/src/services/adb_service.py]] (Docs: [[docs/backend/src/services/adb_service.py.md]]) (`adb_service.execute_shell`).
  - Extracts hardware platform, manufacturer, model, Android OS version, SDK level, fingerprint, security patch level, Android ID, timezone, IMEI, MAC address, and root status (`su` binary check).
  - Returns a populated `TargetDeviceInformation` model from [[backend/src/models/device_model.py]] (Docs: [[docs/backend/src/models/device_model.py.md]]).

## Connections
- **Used by**: [[backend/src/plugins/device_info/main.py]] (Docs: [[docs/backend/src/plugins/device_info/main.py.md]]) in `DeviceInfoPlugin.initialize(project_id)`.
- **Imports/Uses**:
  - `adb_service` from [[backend/src/services/adb_service.py]] (Docs: [[docs/backend/src/services/adb_service.py.md]])
  - `ProjectRepository` from [[backend/src/repository/project_repository.py]] (Docs: [[docs/backend/src/repository/project_repository.py.md]])
  - `db_manager` from [[backend/src/lib/database.py]] (Docs: [[docs/backend/src/lib/database.py.md]])
