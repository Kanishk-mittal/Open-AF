
from typing import Any, Generic, TypeVar

from pydantic import BaseModel, Field


T = TypeVar("T")

class APIResponse(BaseModel, Generic[T]):
    """Standardized API response wrapper."""
    
    success: bool = Field(
        ..., 
        description="Indicates if the request was successful."
    )
    message: str = Field(
        ..., 
        description="Human-readable message explaining the outcome."
    )
    data: T | None = Field(
        default=None, 
        description="The response payload data, if applicable."
    )
    errors: Any | None = Field(
        default=None, 
        description="Detailed error list or breakdown, if applicable."
    )