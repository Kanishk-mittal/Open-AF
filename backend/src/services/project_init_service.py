import datetime
import re
from typing import Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
from lib.database import db_manager
from models.device_model import TargetDeviceInformation
from services.adb_service import adb_service


class ProjectInit:
    @staticmethod
    def get_device_details(device_serial: str) -> TargetDeviceInformation:
        def run_cmd(cmd: str) -> str:
            try:
                res = adb_service.execute_shell(device_serial, cmd)
                return res.strip() if res else ""
            except Exception:
                return ""

        # Hardware & Model
        model = run_cmd("getprop ro.product.model") or "Unknown"
        manufacturer = run_cmd("getprop ro.product.manufacturer") or "Unknown"
        hardware_platform = run_cmd("getprop ro.board.platform") or run_cmd("getprop ro.hardware") or None
        if hardware_platform == "":
            hardware_platform = None

        # OS State
        android_version = run_cmd("getprop ro.build.version.release") or "Unknown"
        sdk_str = run_cmd("getprop ro.build.version.sdk")
        try:
            sdk_level = int(sdk_str)
        except (ValueError, TypeError):
            sdk_level = 0
        build_fingerprint = run_cmd("getprop ro.build.fingerprint") or "Unknown"
        security_patch = run_cmd("getprop ro.build.version.security_patch") or None
        if security_patch == "":
            security_patch = None

        # Identifiers
        android_id = run_cmd("settings get secure android_id") or None
        if android_id in ["null", "", "none"]:
            android_id = None

        # IMEI retrieval attempt
        imei = None
        imei_raw = run_cmd("service call iphonesubinfo 1")
        if not imei_raw or "Error" in imei_raw or "Parcel" not in imei_raw:
            ril_imei = run_cmd("getprop ril.gsm.imei") or run_cmd("getprop ro.ril.oem.imei")
            if ril_imei:
                imei = ril_imei
        else:
            chars = re.findall(r"\'([^\']+)\'", imei_raw)
            parsed = "".join(c.replace(".", "").strip() for c in chars)
            if parsed and len(parsed) >= 14:
                imei = parsed

        # MAC address attempt
        mac_address = run_cmd("cat /sys/class/net/wlan0/address") or None
        if not mac_address or "No such file" in mac_address or "Permission denied" in mac_address:
            mac_address = None

        # Environment
        timezone = run_cmd("getprop persist.sys.timezone") or None
        if timezone == "":
            timezone = None

        # Root detection
        su_path = run_cmd("which su")
        is_rooted = bool(su_path and "not found" not in su_path and not su_path.startswith("/system/bin/sh"))
        if not is_rooted:
            id_output = run_cmd("su 0 id")
            is_rooted = "uid=0" in id_output

        return TargetDeviceInformation(
            adb_serial=device_serial,
            android_id=android_id,
            imei=imei,
            mac_address=mac_address,
            manufacturer=manufacturer,
            model=model,
            hardware_platform=hardware_platform,
            android_version=android_version,
            sdk_level=sdk_level,
            build_fingerprint=build_fingerprint,
            security_patch=security_patch,
            timezone=timezone,
            is_rooted=is_rooted,
        )

    @staticmethod
    async def save_device_info(device_serial: str, project_db: AsyncIOMotorDatabase) -> TargetDeviceInformation:
        # 1. Fetch detailed device specs
        device_info: TargetDeviceInformation = ProjectInit.get_device_details(device_serial)

        # 2. Store in 'device_info' collection
        collection = project_db["device_info"]
        doc = device_info.model_dump()
        doc["created_at"] = datetime.datetime.now(datetime.timezone.utc)

        await collection.insert_one(doc)
        return device_info

    @staticmethod
    async def init_project(project_id: str, device_serial: Optional[str] = None):
        # 1. Get database handle for the project
        project_db = db_manager.client[f"OpenAF_{project_id}"]

        # 2. Save device info if serial provided
        if device_serial:
            await ProjectInit.save_device_info(device_serial, project_db)

        return project_db