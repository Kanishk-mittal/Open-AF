import { Smartphone } from 'lucide-react';
import type { IFrontendPlugin } from '../pluginInterface';
import { DeviceInfoView } from './DeviceInfoView';

export const DeviceInfoPlugin: IFrontendPlugin = {
  id: 'device_info',
  name: 'Device Information',
  description: 'Device hardware identifiers, OS version, root state and security build details',
  category: 'System',
  icon: Smartphone,
  component: DeviceInfoView,
};
