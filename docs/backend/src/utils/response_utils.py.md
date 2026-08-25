# response_utils.py
#backend #utils #response

**Path**: `backend/src/utils/response_utils.py`

## Purpose
A static utility class `ResponseUtils` that constructs uniform `JSONResponse` objects for both successful and failed API operations, wrapping everything in the standard [[backend/src/core/api_response.py]] (Docs: [[docs/backend/src/core/api_response.py.md]]) shape.

## Logic
- `ResponseUtils.success(data, message, status_code)`: Builds an `APIResponse` with `success=True`, serializes via `jsonable_encoder`, and returns a `JSONResponse`. Defaults to HTTP 200.
- `ResponseUtils.error(message, errors, status_code)`: Builds an `APIResponse` with `success=False`, populates `errors` if provided, and returns a `JSONResponse`. Defaults to HTTP 400.

Both methods use `jsonable_encoder` to safely handle Pydantic models, ObjectIds, datetimes, etc. before serialization.

## Connections
- **Imported by**:
  - [[backend/src/core/exception_handlers.py]] (Docs: [[docs/backend/src/core/exception_handlers.py.md]]) — all four global error handlers use it.
  - [[backend/src/routes/adb_routes.py]] (Docs: [[docs/backend/src/routes/adb_routes.py.md]])
  - [[backend/src/plugins/device_info/router.py]] (Docs: [[docs/backend/src/plugins/device_info/router.py.md]])
- **Imports from**:
  - [[backend/src/core/api_response.py]] (Docs: [[docs/backend/src/core/api_response.py.md]])
