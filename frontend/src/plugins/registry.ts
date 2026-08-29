import type { IFrontendPlugin } from './pluginInterface';
import { DeviceInfoPlugin } from './device_info';
import { LogcatPlugin } from './logcat';

/**
 * Frontend Plugin Registry
 * Add any new frontend plugins to this array to automatically register them in the workspace sidebar.
 */
export const FRONTEND_PLUGINS: IFrontendPlugin[] = [
  DeviceInfoPlugin,
  LogcatPlugin,
];

export function getPluginById(id: string): IFrontendPlugin | undefined {
  return FRONTEND_PLUGINS.find((p) => p.id === id);
}

