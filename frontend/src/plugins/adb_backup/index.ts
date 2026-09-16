import { FolderTree } from 'lucide-react';
import type { IFrontendPlugin } from '../pluginInterface';
import { FileTreeExplorer } from '../../components/FileTreeExplorer';

export const AdbBackupPlugin: IFrontendPlugin = {
  id: 'adb_backup',
  name: 'Backup File Explorer',
  description: 'Explore extracted device filesystem, inspect files, copy hashes, and export data',
  category: 'Extraction',
  icon: FolderTree,
  component: FileTreeExplorer,
};
