# device_model.py
#backend #models #device #adb

**Path**: `backend/src/models/device_model.py`

## Purpose
Defines Pydantic models for connected device information and detailed target device metadata.

## Logic
- `DeviceInfo`: Simple model (`serial`, `model`, `manufacturer`, `android_version`) used for listing connected ADB devices.
- `TargetDeviceInformation`: Detailed forensic metadata model for a target device:
  - Identifiers: `adb_serial`, `android_id`, `imei`, `mac_address`
  - Hardware: `manufacturer`, `model`, `hardware_platform`
  - OS State: `android_version`, `sdk_level`, `build_fingerprint`, `security_patch`
  - Environment: `timezone`, `is_rooted`

## Connections
- **Used by**:
  - [[backend/src/routes/adb_routes.py]] (Docs: [[docs/backend/src/routes/adb_routes.py.md]])
  - [[backend/src/plugins/device_info/service.py]] (Docs: [[docs/backend/src/plugins/device_info/service.py.md]])
