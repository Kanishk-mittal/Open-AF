# device_info/router.py
#backend #plugins #device_info #routes

**Path**: `backend/src/plugins/device_info/router.py`

## Purpose
Exposes an endpoint to retrieve stored target device information for a specific project.

## Logic
- **Prefix**: `/device-info`
- **Endpoints**:
  - `GET /{project_id}`: Retrieves the device information document from the project's MongoDB database (`OpenAF_{project_id}`) in the `device_info` collection.
    - If found, converts MongoDB `_id` to string and returns a success response via `ResponseUtils.success`.
    - If not found, returns a 404 error using `ResponseUtils.error`.

## Connections
- **Imported by**: [[backend/src/plugins/device_info/main.py]] (Docs: [[docs/backend/src/plugins/device_info/main.py.md]]) via `DeviceInfoPlugin.getRouter()`.
- **Uses**: `db_manager` from [[backend/src/lib/database.py]] (Docs: [[docs/backend/src/lib/database.py.md]]).
