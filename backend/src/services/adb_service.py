from ppadb.client import Client as AdbClient
from errors import DeviceNotFoundError

# NOTE: do not user this service directly, use the adb_service instance at the bottom of this file instead to keep it singleton and avoid multiple connections to the ADB server.
class AdbService:
    def __init__(self, client: AdbClient):
        self.client = client

    def execute_shell(self, serial: str, command: str) -> str:
        device = self.client.device(serial)
        if not device:
            devices = self.client.devices()
            device = next((d for d in devices if d.serial == serial), None)
            if not device:
                raise DeviceNotFoundError(serial=serial)
        return device.shell(command)

    def list_genymotion_devices(self):
        # Fetch all connected devices
        devices = self.client.devices()
        
        device_list = []
        for device in devices:
            model = self.execute_shell(device.serial, "getprop ro.product.model").strip()
            manufacturer = self.execute_shell(device.serial, "getprop ro.product.manufacturer").strip()
            android_version = self.execute_shell(device.serial, "getprop ro.build.version.release").strip()
            
            device_list.append({
                "serial": device.serial,
                "model": model,
                "manufacturer": manufacturer,
                "android_version": android_version
            })
        return device_list


adb_service = AdbService(AdbClient(host="127.0.0.1", port=5037))