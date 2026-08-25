from typing import List

from plugins.device_info.main import DeviceInfoPlugin
from plugins.plugin_interface import IPlugin


PLUGINS: List[IPlugin] = [
    DeviceInfoPlugin()
]
