import { request, API_BASE_URL } from './client';
import type { ApiResponse } from '../types/project';
import type {
  BackupFileItem,
  FileListResponseData,
  BackupMetadata,
  ExportResponseData,
} from '../types/backup';

export const backupApi = {
  /**
   * Fetch ADB backup metadata for the project
   */
  async getBackupInfo(projectId: string): Promise<BackupMetadata> {
    const res = await request<ApiResponse<BackupMetadata>>(`/backup/${projectId}`);
    return res.data;
  },

  /**
   * List files from the extracted backup for a specific relative directory
   */
  async listFiles(projectId: string, path: string = '/'): Promise<FileListResponseData> {
    const res = await request<ApiResponse<FileListResponseData>>('/backup/files/list', {
      method: 'POST',
      body: JSON.stringify({ project_id: projectId, path }),
    });
    return res.data;
  },

  /**
   * Retrieve metadata & SHA-256 hash for a specific file or folder in the backup
   */
  async statFile(projectId: string, path: string): Promise<BackupFileItem> {
    const res = await request<ApiResponse<BackupFileItem>>('/backup/files/stat', {
      method: 'POST',
      body: JSON.stringify({ project_id: projectId, path }),
    });
    return res.data;
  },

  /**
   * Get direct download URL for a file in the backup
   */
  getDownloadUrl(projectId: string, path: string): string {
    return `${API_BASE_URL}/backup/files/download?project_id=${encodeURIComponent(
      projectId
    )}&path=${encodeURIComponent(path)}`;
  },

  /**
   * Export a file or folder from the backup to a host location
   */
  async exportFile(
    projectId: string,
    path: string,
    destinationPath: string
  ): Promise<ExportResponseData> {
    const res = await request<ApiResponse<ExportResponseData>>('/backup/files/export', {
      method: 'POST',
      body: JSON.stringify({
        project_id: projectId,
        path,
        destination_path: destinationPath,
      }),
    });
    return res.data;
  },

  /**
   * Search for files matching a SHA-256 hash
   */
  async findByHash(projectId: string, hash: string): Promise<BackupFileItem[]> {
    const res = await request<ApiResponse<BackupFileItem[]>>('/backup/files/find-by-hash', {
      method: 'POST',
      body: JSON.stringify({ project_id: projectId, hash }),
    });
    return res.data;
  },
};
