import logging
from typing import Any

class AppLogger:
    """Proxy logger interface wrapping the underlying logging provider."""
    
    def __init__(self, name: str = "app"):
        # Currently defaults to Uvicorn's logger for consistent formatting
        self._logger = logging.getLogger("uvicorn.error")

    def info(self, msg: str, *args: Any, **kwargs: Any) -> None:
        self._logger.info(msg, *args, **kwargs)

    def warning(self, msg: str, *args: Any, **kwargs: Any) -> None:
        self._logger.warning(msg, *args, **kwargs)

    def error(self, msg: str, *args: Any, **kwargs: Any) -> None:
        self._logger.error(msg, *args, **kwargs)

    def debug(self, msg: str, *args: Any, **kwargs: Any) -> None:
        self._logger.debug(msg, *args, **kwargs)

    def exception(self, msg: str, *args: Any, **kwargs: Any) -> None:
        # Automatically includes exception stack trace in the log output
        self._logger.exception(msg, *args, **kwargs)

# Singleton instance for simple imports across your application
logger = AppLogger()
