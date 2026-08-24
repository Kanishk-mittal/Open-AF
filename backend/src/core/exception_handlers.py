from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from utils.response_utils import ResponseUtils
from errors import AppError


def register_exception_handlers(app: FastAPI) -> None:
    """Registers all global exception handlers on the FastAPI application."""

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        error_details = []
        for err in exc.errors():
            field = " -> ".join(str(loc) for loc in err.get("loc", []) if loc != "body")
            msg = err.get("msg", "Invalid value")
            error_details.append({
                "field": field,
                "message": msg,
                "type": err.get("type")
            })
        return ResponseUtils.error(
            message="Validation failed. Please check the provided input.",
            errors=error_details,
            status_code=status.HTTP_400_BAD_REQUEST
        )

    @app.exception_handler(AppError)
    async def app_error_handler(request: Request, exc: AppError):
        return ResponseUtils.error(
            message=exc.message,
            errors=exc.errors,
            status_code=exc.status_code
        )

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException):
        return ResponseUtils.error(
            message=str(exc.detail),
            status_code=exc.status_code
        )

    @app.exception_handler(Exception)
    async def generic_exception_handler(request: Request, exc: Exception):
        return ResponseUtils.error(
            message="An unexpected internal server error occurred.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
