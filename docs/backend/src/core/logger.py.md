# logger.py
#backend #core #logging

**Path**: `backend/src/core/logger.py`

## Purpose
Provides a singleton application logger (`logger`) that wraps Python's standard `logging` module, proxying to Uvicorn's logger for consistent output formatting.

## Logic
- `AppLogger`: A proxy class wrapping the underlying logger.
  - `__init__(name: str)`: Internally binds to `logging.getLogger("uvicorn.error")` so log output is formatted alongside Uvicorn's own logs.
  - `info(msg)`, `warning(msg)`, `error(msg)`, `debug(msg)`: Standard log-level methods.
  - `exception(msg)`: Logs at `ERROR` level but also automatically captures and appends the current exception traceback — useful in `except` blocks.
- `logger`: A module-level singleton instance of `AppLogger`. Other modules import and use this directly.

## Connections
- **Imported by**: Any module that needs structured logging — e.g., services or plugins.
- No other internal code dependencies.
