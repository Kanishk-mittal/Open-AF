import { request } from './client';
import type { ApiResponse, ProjectListItem, ProjectMetadata, ProjectMetadataCreate } from '../types/project';

export const projectsApi = {
  /**
   * Fetch all projects for the list view
   */
  async listProjects(): Promise<ProjectListItem[]> {
    const res = await request<ApiResponse<ProjectListItem[]>>('/projects');
    return res.data || [];
  },

  /**
   * Fetch details/metadata of a specific project
   */
  async getProject(projectId: string): Promise<ProjectMetadata> {
    const res = await request<ApiResponse<ProjectMetadata>>(`/projects/${projectId}`);
    return res.data;
  },

  /**
   * Create a new forensic project
   */
  async createProject(payload: ProjectMetadataCreate): Promise<ProjectMetadata> {
    const res = await request<ApiResponse<ProjectMetadata>>('/projects', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  /**
   * Update existing project metadata
   */
  async updateProject(projectId: string, payload: Partial<ProjectMetadataCreate>): Promise<ProjectMetadata> {
    const res = await request<ApiResponse<ProjectMetadata>>(`/projects/${projectId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    return res.data;
  },

  /**
   * Delete a project by ID
   */
  async deleteProject(projectId: string): Promise<void> {
    await request<ApiResponse<null>>(`/projects/${projectId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Import project archive
   */
  async importProject(archivePath: string): Promise<{ project_id: string }> {
    const res = await request<ApiResponse<{ project_id: string }>>('/projects/import', {
      method: 'PUT',
      body: JSON.stringify({ archive_path: archivePath }),
    });
    return res.data;
  },

  /**
   * Export a project
   */
  async exportProject(projectId: string, destinationPath: string): Promise<{ export_path: string }> {
    const query = new URLSearchParams({ destination_path: destinationPath }).toString();
    const res = await request<ApiResponse<{ export_path: string }>>(`/projects/${projectId}/export?${query}`);
    return res.data;
  },
};
