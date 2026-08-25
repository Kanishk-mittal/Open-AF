# adb_routes.py
#backend #routes #adb

**Path**: `backend/src/routes/adb_routes.py`

## Purpose
Exposes API endpoints for interacting with Android Debug Bridge (ADB), useful for interacting with connected devices or emulators.

## Logic
- **Endpoints**:
  - `GET /devices` (and `GET /`): Lists all connected devices by querying the ADB server via `AdbService`. Returns a list of `DeviceInfo` models.

## Connections
- **Imported by**: [[backend/src/routes/master_router_v1.py]] (Docs: [[docs/backend/src/routes/master_router_v1.py.md]])
- **Depends on**: [[backend/src/services/adb_service.py]] (Docs: [[docs/backend/src/services/adb_service.py.md]]) for communicating with the ADB server.
