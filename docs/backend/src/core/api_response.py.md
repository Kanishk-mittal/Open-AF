# api_response.py
#backend #core #models #response

**Path**: `backend/src/core/api_response.py`

## Purpose
Defines the standardized Pydantic response wrapper `APIResponse[T]` used across all API endpoints to ensure a consistent response shape.

## Logic
- `APIResponse(BaseModel, Generic[T])`: A generic Pydantic model that wraps all API responses.
  - `success: bool` — Indicates if the request succeeded.
  - `message: str` — Human-readable explanation of the outcome.
  - `data: T | None` — The response payload, typed generically (can be any model, list, etc.).
  - `errors: Any | None` — Detailed error breakdown for failed requests (e.g., validation errors per field).

## Connections
- **Imported by**:
  - [[backend/src/utils/response_utils.py]] (Docs: [[docs/backend/src/utils/response_utils.py.md]]) — Uses `APIResponse` to build `JSONResponse` objects.
  - Various route files that use it directly as the `response_model` type annotation.
