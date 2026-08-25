from abc import ABC, abstractmethod

from fastapi import APIRouter


class IPlugin(ABC):
    """
    Abstract base class for plugins. All plugins must inherit from this class and implement the execute method.
    """

    def __init__(self, name: str, id: str):
        self.name = name
        self.id = id

    @abstractmethod
    def getRouter(self) -> APIRouter:
        """
        Returns the router for the plugin. This method must be implemented by all plugins.
        """
        raise NotImplementedError("Plugins must implement the execute method.")
    
    @abstractmethod
    async def initialize(self, project_id: str):
        """
        This method will be called when the project is initialized. 
        here if needed the pluign can build its own database tables or perform any other initialization tasks.
        """
        raise NotImplementedError("Plugins must implement the execute method.")