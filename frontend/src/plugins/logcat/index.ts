import { Terminal } from 'lucide-react';
import type { IFrontendPlugin } from '../pluginInterface';
import { LogcatView } from './LogcatView';

export const LogcatPlugin: IFrontendPlugin = {
  id: 'logcat',
  name: 'Logcat Stream',
  description: 'Live system, kernel, and app logs streamed directly from the connected device via ADB',
  category: 'System',
  icon: Terminal,
  component: LogcatView,
};
