import React, { useEffect, useState, useMemo } from 'react';
import { Search, FolderKanban, Plus, AlertCircle, Loader2 } from 'lucide-react';
import { projectsApi } from '../api/projects';
import type { ProjectListItem, ProjectMetadataCreate } from '../types/project';
import { Navbar } from '../components/Navbar';
import { ProjectCard } from '../components/ProjectCard';
import { CreateProjectModal } from '../components/CreateProjectModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';

export const HomePage: React.FC = () => {
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await projectsApi.listProjects();
      setProjects(data);
    } catch (err: any) {
      console.error('Failed to load projects:', err);
      setError(err?.message || 'Failed to connect to backend server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (data: ProjectMetadataCreate) => {
    await projectsApi.createProject(data);
    await fetchProjects();
  };

  const handleDeleteRequest = (projectId: string, title: string) => {
    setDeleteTarget({ id: projectId, title });
  };

  const handleExecuteDelete = async () => {
    if (!deleteTarget) return;
    await projectsApi.deleteProject(deleteTarget.id);
    setProjects((prev) => prev.filter((p) => p.id !== deleteTarget.id));
  };

  const handleExportProject = async (projectId: string) => {
    try {
      const { open } = await import('@tauri-apps/plugin-dialog');
      const selectedDir = await open({
        directory: true,
        multiple: false,
        title: 'Select Destination Folder for Exported Project',
      });

      if (!selectedDir || typeof selectedDir !== 'string') return;

      const res = await projectsApi.exportProject(projectId, selectedDir);
      alert(`Project successfully exported to:\n${res.export_path}`);
    } catch (err: any) {
      console.error('Export error:', err);
      alert(`Failed to export project: ${err?.message || 'Unknown error'}`);
    }
  };

  const handleImportProject = async () => {
    try {
      const { open } = await import('@tauri-apps/plugin-dialog');
      const selectedFile = await open({
        multiple: false,
        directory: false,
        title: 'Select Project Archive (.zip) to Import',
        filters: [
          {
            name: 'Project Archive',
            extensions: ['zip', 'tar', 'gz'],
          },
        ],
      });

      if (!selectedFile || typeof selectedFile !== 'string') return;

      const res = await projectsApi.importProject(selectedFile);
      alert(`Project successfully imported with ID: ${res.project_id}`);
      await fetchProjects();
    } catch (err: any) {
      console.error('Import error:', err);
      alert(`Failed to import project: ${err?.message || 'Unknown error'}`);
    }
  };

  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects;
    const q = searchQuery.toLowerCase();
    return projects.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.case_number.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q)
    );
  }, [projects, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col bg-bg-deep">
      <Navbar
        onRefresh={fetchProjects}
        onNewProject={() => setIsModalOpen(true)}
        onImportProject={handleImportProject}
      />

      <main className="flex-1 max-w-[1200px] w-full mx-auto px-6 py-9">
        {/* Hero Section */}
        <div className="mb-8 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-yellow-chartreuse">
              Forensics Workspace
            </span>
          </div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">
            Investigation Projects
          </h1>
          <p className="text-text-secondary text-[15px] max-w-[650px]">
            Manage case extractions, analyze connected Android devices, and inspect forensic artifacts.
          </p>
        </div>

        {/* Toolbar: Search and Filter */}
        <div className="flex items-center justify-between gap-4 mb-7 flex-wrap">
          {/* Search Input */}
          <div className="relative flex-1 max-w-[450px] min-w-[260px]">
            <Search
              size={18}
              className="text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search by project title, case number, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9.5 pr-3 py-2.5 bg-bg-surface border border-border-subtle rounded-lg text-text-primary outline-none focus:border-forest-sage transition-colors"
            />
          </div>

          {/* Quick Count Stats */}
          <div className="flex items-center gap-3 text-[13px] text-text-secondary">
            <span>
              Total Projects: <strong className="text-yellow-cream">{projects.length}</strong>
            </span>
            {searchQuery && (
              <span>
                • Matching: <strong className="text-yellow-bright">{filteredProjects.length}</strong>
              </span>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 px-5 gap-3 text-text-secondary">
            <Loader2 size={36} className="text-yellow-chartreuse animate-spin" />
            <p className="text-sm">Loading projects...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="p-6 rounded-xl bg-[#2A1818] border border-red-900 text-red-300 flex items-start gap-3.5 mb-6">
            <AlertCircle size={24} className="shrink-0 mt-0.5" />
            <div>
              <h4 className="m-0 mb-1.5 text-[15px] font-semibold">Failed to load projects</h4>
              <p className="m-0 text-[13px] opacity-90">{error}</p>
              <button
                onClick={fetchProjects}
                className="mt-3 px-3.5 py-1.5 bg-white/10 rounded text-white text-xs font-semibold hover:bg-white/20 transition-colors cursor-pointer"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredProjects.length === 0 && (
          <div className="py-15 px-6 rounded-xl bg-bg-surface border border-dashed border-border-subtle text-center flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-forest-dark flex items-center justify-center text-khaki-soft">
              <FolderKanban size={28} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-text-primary m-0 mb-1.5">
                {searchQuery ? 'No matching projects found' : 'No investigation projects yet'}
              </h3>
              <p className="text-sm text-text-secondary max-w-[400px] mx-auto">
                {searchQuery
                  ? `No project matched the filter "${searchQuery}". Try a different search term.`
                  : 'Start by creating your first forensic project to extract data from an Android device.'}
              </p>
            </div>
            {!searchQuery && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-md bg-green-emerald text-white text-[13px] font-semibold mt-2 hover:bg-green-accent transition-colors cursor-pointer"
              >
                <Plus size={16} />
                <span>Create New Project</span>
              </button>
            )}
          </div>
        )}

        {/* Project Grid */}
        {!loading && !error && filteredProjects.length > 0 && (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-5">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onDelete={handleDeleteRequest}
                onExport={handleExportProject}
              />
            ))}
          </div>
        )}
      </main>

      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateProject}
      />

      <DeleteConfirmModal
        isOpen={deleteTarget !== null}
        projectId={deleteTarget?.id || ''}
        projectName={deleteTarget?.title || ''}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleExecuteDelete}
      />
    </div>
  );
};

