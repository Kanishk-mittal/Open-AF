from typing import Generic, TypeVar, Any
from core.api_response import APIResponse
from pydantic import BaseModel, Field
from fastapi import status
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse





class ResponseUtils:
    """Utility class to construct uniform FastAPI JSON responses."""

    @staticmethod
    def success(
        data: Any = None,
        message: str = "Operation completed successfully.",
        status_code: int = status.HTTP_200_OK,
    ) -> JSONResponse:
        """Returns a standardized success JSON response."""
        
        payload = APIResponse(
            success=True,
            message=message,
            data=data,
            errors=None
        )
        return JSONResponse(
            status_code=status_code,
            content=jsonable_encoder(payload)
        )

    @staticmethod
    def error(
        message: str = "An error occurred during the operation.",
        errors: Any = None,
        status_code: int = status.HTTP_400_BAD_REQUEST,
    ) -> JSONResponse:
        """Returns a standardized error JSON response."""
        
        payload = APIResponse(
            success=False,
            message=message,
            data=None,
            errors=errors
        )
        return JSONResponse(
            status_code=status_code,
            content=jsonable_encoder(payload)
        )