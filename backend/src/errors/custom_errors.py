from typing import Any, Optional
from fastapi import status


class AppError(Exception):
    """Base application exception."""
    def __init__(
        self,
        message: str = "An application error occurred.",
        status_code: int = status.HTTP_400_BAD_REQUEST,
        errors: Optional[Any] = None
    ):
        self.message = message
        self.status_code = status_code
        self.errors = errors
        super().__init__(self.message)


class BadRequestError(AppError):
    """Exception raised for bad input or bad request scenarios."""
    def __init__(self, message: str = "Invalid request payload or parameters.", errors: Optional[Any] = None):
        super().__init__(message=message, status_code=status.HTTP_400_BAD_REQUEST, errors=errors)


class NotFoundError(AppError):
    """Base exception for resources that are not found."""
    def __init__(self, message: str = "Requested resource not found.", errors: Optional[Any] = None):
        super().__init__(message=message, status_code=status.HTTP_404_NOT_FOUND, errors=errors)


class DeviceNotFoundError(NotFoundError):
    """Exception raised when an ADB device or serial is not found."""
    def __init__(self, message: str = "Device not found.", serial: Optional[str] = None):
        if serial:
            message = f"Device with serial '{serial}' not found."
        super().__init__(message=message)
