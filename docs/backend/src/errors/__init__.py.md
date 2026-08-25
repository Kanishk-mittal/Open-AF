# errors/__init__.py
#backend #errors

**Path**: `backend/src/errors/__init__.py`

## Purpose
Makes the `errors` directory a Python package and re-exports all custom exception classes for clean imports across the codebase (e.g., `from errors import DeviceNotFoundError`).

## Logic
- Re-exports `AppError`, `BadRequestError`, `NotFoundError`, `DeviceNotFoundError` from [[backend/src/errors/custom_errors.py]] (Docs: [[docs/backend/src/errors/custom_errors.py.md]]).
- Defines `__all__` to control what is available on wildcard imports.

## Connections
- **Exports from**: [[backend/src/errors/custom_errors.py]] (Docs: [[docs/backend/src/errors/custom_errors.py.md]])
- **Imported by**:
  - [[backend/src/core/exception_handlers.py]] (Docs: [[docs/backend/src/core/exception_handlers.py.md]]) — imports `AppError`
  - [[backend/src/services/adb_service.py]] (Docs: [[docs/backend/src/services/adb_service.py.md]]) — imports `DeviceNotFoundError`
