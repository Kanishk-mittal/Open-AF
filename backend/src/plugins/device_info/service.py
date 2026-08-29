import datetime
import re
from typing import Any, Dict
from services.adb_service import adb_service
from repository.project_repository import ProjectRepository
from lib.database import db_manager

class DeviceInfoService:
    def __init__(self):
        self.repository = ProjectRepository()

    async def save_device_info_for_project(self, project_id: str):
        # Fetch project metadata to get the device_serial
        metadata = await self.repository.get_project_metadata(project_id)
        device_serial = metadata.device_serial
        
        if not device_serial:
            return
            
        project_db = db_manager.client[f"OpenAF_{project_id}"]
        device_info = self.get_device_details(device_serial)
        
        collection = project_db["device_info"]
        doc = dict(device_info)
        doc["created_at"] = datetime.datetime.now(datetime.timezone.utc)
        await collection.insert_one(doc)

    def get_device_details(self, device_serial: str) -> Dict[str, Any]:
        def run_cmd(cmd: str) -> str:
            try:
                res = adb_service.execute_shell(device_serial, cmd)
                return res.strip() if res else ""
            except Exception:
                return ""

        # Hardware & Model
        model_cmd = "getprop ro.product.model"
        model_val = run_cmd(model_cmd) or "Unknown"

        manufacturer_cmd = "getprop ro.product.manufacturer"
        manufacturer_val = run_cmd(manufacturer_cmd) or "Unknown"

        platform_val = run_cmd("getprop ro.board.platform")
        if platform_val:
            hardware_platform_cmd = "getprop ro.board.platform"
            hardware_platform_val = platform_val
        else:
            hardware_platform_cmd = "getprop ro.hardware"
            hardware_platform_val = run_cmd(hardware_platform_cmd) or None
            if hardware_platform_val == "":
                hardware_platform_val = None

        # OS State
        android_version_cmd = "getprop ro.build.version.release"
        android_version_val = run_cmd(android_version_cmd) or "Unknown"

        sdk_cmd = "getprop ro.build.version.sdk"
        sdk_str = run_cmd(sdk_cmd)
        try:
            sdk_level_val = int(sdk_str)
        except (ValueError, TypeError):
            sdk_level_val = 0

        build_fingerprint_cmd = "getprop ro.build.fingerprint"
        build_fingerprint_val = run_cmd(build_fingerprint_cmd) or "Unknown"

        security_patch_cmd = "getprop ro.build.version.security_patch"
        security_patch_val = run_cmd(security_patch_cmd) or None
        if security_patch_val == "":
            security_patch_val = None

        # Identifiers
        android_id_cmd = "settings get secure android_id"
        android_id_val = run_cmd(android_id_cmd) or None
        if android_id_val in ["null", "", "none"]:
            android_id_val = None

        # IMEI retrieval attempt
        imei_cmd = "service call iphonesubinfo 1"
        imei_val = None
        imei_raw = run_cmd(imei_cmd)
        if not imei_raw or "Error" in imei_raw or "Parcel" not in imei_raw:
            ril_imei_1 = run_cmd("getprop ril.gsm.imei")
            if ril_imei_1:
                imei_cmd = "getprop ril.gsm.imei"
                imei_val = ril_imei_1
            else:
                imei_cmd = "getprop ro.ril.oem.imei"
                imei_val = run_cmd("getprop ro.ril.oem.imei") or None
        else:
            chars = re.findall(r"\'([^\']+)\'", imei_raw)
            parsed = "".join(c.replace(".", "").strip() for c in chars)
            if parsed and len(parsed) >= 14:
                imei_val = parsed

        # MAC address attempt
        mac_cmd = "cat /sys/class/net/wlan0/address"
        mac_val = run_cmd(mac_cmd) or None
        if not mac_val or "No such file" in mac_val or "Permission denied" in mac_val:
            mac_val = None

        # Environment
        timezone_cmd = "getprop persist.sys.timezone"
        timezone_val = run_cmd(timezone_cmd) or None
        if timezone_val == "":
            timezone_val = None

        # Root detection
        root_cmd = "which su"
        su_path = run_cmd(root_cmd)
        is_rooted = bool(su_path and "not found" not in su_path and not su_path.startswith("/system/bin/sh"))
        if not is_rooted:
            root_cmd = "su 0 id"
            id_output = run_cmd(root_cmd)
            is_rooted = "uid=0" in id_output

        return {
            "adb_serial": {
                "source": "adb devices / project metadata",
                "value": device_serial,
            },
            "android_id": {
                "source": android_id_cmd,
                "value": android_id_val,
            },
            "imei": {
                "source": imei_cmd,
                "value": imei_val,
            },
            "mac_address": {
                "source": mac_cmd,
                "value": mac_val,
            },
            "manufacturer": {
                "source": manufacturer_cmd,
                "value": manufacturer_val,
            },
            "model": {
                "source": model_cmd,
                "value": model_val,
            },
            "hardware_platform": {
                "source": hardware_platform_cmd,
                "value": hardware_platform_val,
            },
            "android_version": {
                "source": android_version_cmd,
                "value": android_version_val,
            },
            "sdk_level": {
                "source": sdk_cmd,
                "value": sdk_level_val,
            },
            "build_fingerprint": {
                "source": build_fingerprint_cmd,
                "value": build_fingerprint_val,
            },
            "security_patch": {
                "source": security_patch_cmd,
                "value": security_patch_val,
            },
            "timezone": {
                "source": timezone_cmd,
                "value": timezone_val,
            },
            "is_rooted": {
                "source": root_cmd,
                "value": is_rooted,
            },
        }
