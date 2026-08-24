from pydantic import BaseModel
from typing import Optional

class DeviceInfo(BaseModel):
    serial: str
    model: str
    manufacturer: str
    android_version: str

class TargetDeviceInformation(BaseModel):
    # Identifiers
    adb_serial: str                  # e.g., "127.0.0.1:5555" or "emulator-5554"
    android_id: Optional[str] = None # 64-bit secure ID
    imei: Optional[str] = None       # Primary cellular identifier
    mac_address: Optional[str] = None# Wi-Fi interface MAC
    
    # Hardware & Model
    manufacturer: str                # e.g., "Google"
    model: str                       # e.g., "Pixel 8"
    hardware_platform: Optional[str] = None # e.g., "tensor" / "qcom"
    
    # OS State
    android_version: str             # e.g., "14"
    sdk_level: int                   # e.g., 34
    build_fingerprint: str           # Complete build identifier
    security_patch: Optional[str] = None    # e.g., "2026-05-01"
    
    # Environment
    timezone: Optional[str] = None          # e.g., "Asia/Kolkata" or "UTC"
    is_rooted: bool                  # Bootloader/SU detection status

