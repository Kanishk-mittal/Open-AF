from fastapi import APIRouter, Depends, HTTPException, status
from core.api_response import APIResponse
from utils.response_utils import ResponseUtils
from models.device_model import DeviceInfo
from services.adb_service import AdbService, adb_service

router = APIRouter()

def get_adb_service() -> AdbService:
    return adb_service

@router.get("/devices", response_model=APIResponse[list[DeviceInfo]], status_code=status.HTTP_200_OK)
@router.get("", response_model=APIResponse[list[DeviceInfo]], status_code=status.HTTP_200_OK)
def list_devices(service: AdbService = Depends(get_adb_service)):
    try:
        devices = service.list_genymotion_devices()
        return ResponseUtils.success(
            data=devices,
            message="Devices retrieved successfully.",
            status_code=status.HTTP_200_OK
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Failed to communicate with ADB server: {str(e)}"
        )
