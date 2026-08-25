from fastapi import APIRouter
from plugins.plugin_interface import IPlugin
from plugins.device_info.router import router
from plugins.device_info.service import DeviceInfoService

class DeviceInfoPlugin(IPlugin):
    def __init__(self):
        super().__init__(name="DeviceInfo", id="device_info")
        self.service = DeviceInfoService()

    def getRouter(self) -> APIRouter:
        return router

    async def initialize(self, project_id: str):
        await self.service.save_device_info_for_project(project_id)
