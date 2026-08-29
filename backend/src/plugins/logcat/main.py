from fastapi import APIRouter
from plugins.plugin_interface import IPlugin
from plugins.logcat.router import router

class LogcatPlugin(IPlugin):
    def __init__(self):
        super().__init__(name="Logcat", id="logcat")

    def getRouter(self) -> APIRouter:
        return router

    async def initialize(self, project_id: str):
        # Logcat does not require any initial setup or database tables
        pass
