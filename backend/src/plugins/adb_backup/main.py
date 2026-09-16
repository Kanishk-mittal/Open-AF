from fastapi import APIRouter
from plugins.adb_backup.router import router
from plugins.adb_backup.service import AdbBackupService
from plugins.plugin_interface import IPlugin


class AdbBackupPlugin(IPlugin):
    def __init__(self):
        super().__init__(name="AdbBackup", id="adb_backup")
        self.service = AdbBackupService()

    def getRouter(self) -> APIRouter:
        return router

    async def initialize(self, project_id: str):
        """
        Executes ADB backup on project initialization and saves the backup
        to <storage_location>/backup/backup_<project_id>.ab.
        """
        await self.service.perform_initial_backup(project_id)

    async def on_delete(self, project_id: str):
        """
        Cleans up and removes the backup file (.ab) and extracted data on project deletion.
        """
        await self.service.delete_backup_for_project(project_id)
