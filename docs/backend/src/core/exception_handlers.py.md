# exception_handlers.py
#backend #core #errors #exception-handling

**Path**: `backend/src/core/exception_handlers.py`

## Purpose
Registers all global exception handlers on the FastAPI application so every error type returns a uniform, structured JSON response.

## Logic
- `register_exception_handlers(app: FastAPI)`: Attaches four handlers to the app:
  - **`RequestValidationError`**: Triggered on Pydantic input validation failures (e.g., missing required fields). Formats each field-level error into a list `[{field, message, type}]` and returns HTTP 400.
  - **`AppError`**: Handles all custom application errors (see [[backend/src/errors/custom_errors.py]] (Docs: [[docs/backend/src/errors/custom_errors.py.md]])). Passes through the error's `message`, `errors`, and `status_code`.
  - **`StarletteHTTPException`**: Handles standard HTTP exceptions (e.g., 404, 403). Returns `exc.detail` as the message.
  - **`Exception`**: A catch-all fallback for unhandled exceptions returning HTTP 500 with a generic message.

All handlers produce responses via [[backend/src/utils/response_utils.py]] (Docs: [[docs/backend/src/utils/response_utils.py.md]]).

## Connections
- **Imported by**: [[backend/main.py]] (Docs: [[docs/backend/main.py.md]]) via `register_exception_handlers(app)`.
- **Imports from**:
  - [[backend/src/utils/response_utils.py]] (Docs: [[docs/backend/src/utils/response_utils.py.md]])
  - [[backend/src/errors/custom_errors.py]] (Docs: [[docs/backend/src/errors/custom_errors.py.md]]) — `AppError`
