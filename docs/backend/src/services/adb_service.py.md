# adb_service.py
#backend #services #adb

**Path**: `backend/src/services/adb_service.py`

## Purpose
Provides a singleton interface to communicate with the local ADB server, enabling device querying and shell command execution.

## Logic
Uses the `ppadb` library to communicate with an ADB server running locally on port 5037.

- `execute_shell(serial, command)`: Executes a shell command on a specific device by its serial number. Raises `DeviceNotFoundError` if the device isn't found.
- `list_genymotion_devices()`: Returns a list of connected devices, executing shell commands to fetch details like `model`, `manufacturer`, and `android_version`.
- **Singleton**: The module instantiates `adb_service = AdbService(...)` at the bottom, which is meant to be used globally to maintain a single ADB connection pool.

## Connections
- **Imported by**: [[backend/src/routes/adb_routes.py]] (Docs: [[docs/backend/src/routes/adb_routes.py.md]]) to list devices.
- Uses custom errors from `errors.DeviceNotFoundError`.
