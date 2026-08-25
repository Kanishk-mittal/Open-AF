# custom_errors.py
#backend #errors #exceptions

**Path**: `backend/src/errors/custom_errors.py`

## Purpose
Defines the custom exception hierarchy for the entire application, enabling structured error responses with HTTP status codes.

## Logic
- `AppError(Exception)`: Base application exception. All custom errors inherit from this.
  - `message: str` — Human-readable error message.
  - `status_code: int` — HTTP status code to return (defaults to 400).
  - `errors: Any | None` — Optional detailed breakdown (e.g., list of field errors).
- `BadRequestError(AppError)`: For invalid input/request payloads. Status 400.
- `NotFoundError(AppError)`: For missing resources. Status 404.
- `DeviceNotFoundError(NotFoundError)`: Specialized not-found error for ADB device look-ups. Accepts an optional `serial` to include in the message.

## Connections
- **Exported via**: [[backend/src/errors/__init__.py]] (Docs: [[docs/backend/src/errors/__init__.py.md]]) using `__all__`.
- **Caught by**: [[backend/src/core/exception_handlers.py]] (Docs: [[docs/backend/src/core/exception_handlers.py.md]]) — the `AppError` handler.
- **Raised by**: [[backend/src/services/adb_service.py]] (Docs: [[docs/backend/src/services/adb_service.py.md]]) — raises `DeviceNotFoundError`.
