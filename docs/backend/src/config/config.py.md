# config.py
#backend #config

**Path**: `backend/src/config/config.py`

## Purpose
Manages the environment variables and configuration for the backend.

## Logic
Uses `pydantic_settings` to read environment variables from a `.env` file.

- **Classes**:
  - `Settings(BaseSettings)`: Defines configuration fields like `MONGO_URL` (default: "mongodb://localhost:27017") and `DATABASE_NAME`.
- **Instances**:
  - `settings`: A global instance of `Settings` that other modules can import to access configuration values.

## Connections
- Reads from the local `.env` file in the backend directory.
- Used by modules like database connection managers to get the connection string.
