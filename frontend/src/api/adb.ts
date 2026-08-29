import { request } from './client';
import type { ApiResponse, DeviceInfo } from '../types/project';

export const adbApi = {
  /**
   * Fetch connected ADB/Genymotion devices from backend
   */
  async getDevices(): Promise<DeviceInfo[]> {
    const res = await request<ApiResponse<DeviceInfo[]>>('/adb');
    return res.data || [];
  },
};
