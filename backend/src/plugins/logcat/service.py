import asyncio
from typing import AsyncGenerator
from errors import DeviceNotFoundError
from services.adb_service import adb_service

class LogcatService:
    async def stream_logcat(self, device_serial: str) -> AsyncGenerator[str, None]:
        # Verify device is connected
        device = adb_service.client.device(device_serial)
        if not device:
            devices = adb_service.client.devices()
            device = next((d for d in devices if d.serial == device_serial), None)
            if not device:
                raise DeviceNotFoundError(serial=device_serial)

        # Launch adb logcat subprocess with line buffering
        process = await asyncio.create_subprocess_exec(
            "adb", "-s", device_serial, "logcat", "-v", "time",
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )

        try:
            while True:
                if process.stdout is None:
                    break
                line = await process.stdout.readline()
                if not line:
                    break
                decoded_line = line.decode(errors="replace")
                yield decoded_line
        except asyncio.CancelledError:
            pass
        finally:
            if process.returncode is None:
                try:
                    process.terminate()
                    await process.wait()
                except ProcessLookupError:
                    pass
