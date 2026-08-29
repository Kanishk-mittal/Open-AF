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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-deep)' }}>
      <Navbar
        onRefresh={fetchProjects}
        onNewProject={() => setIsModalOpen(true)}
        onImportProject={handleImportProject}
      />

      <main style={{ flex: 1, maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '36px 24px' }}>
        {/* Hero Section */}
        <div style={{
          marginBottom: '32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontSize: '12px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: 'var(--yellow-chartreuse)'
            }}>
              Forensics Workspace
            </span>
          </div>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '-0.5px'
          }}>
            Investigation Projects
          </h1>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '15px',
            maxWidth: '650px'
          }}>
            Manage case extractions, analyze connected Android devices, and inspect forensic artifacts.
          </p>
        </div>

        {/* Toolbar: Search and Filter */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '28px',
          flexWrap: 'wrap'
        }}>
          {/* Search Input */}
          <div style={{
            position: 'relative',
            flex: '1',
            maxWidth: '450px',
            minWidth: '260px'
          }}>
            <Search
              size={18}
              color="var(--text-muted)"
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              placeholder="Search by project title, case number, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px 10px 38px',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                outline: 'none',
                transition: 'border-color 0.15s ease'
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--forest-sage)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border-subtle)')}
            />
          </div>

          {/* Quick Count Stats */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '13px',
            color: 'var(--text-secondary)'
          }}>
            <span>
              Total Projects: <strong style={{ color: 'var(--yellow-cream)' }}>{projects.length}</strong>
            </span>
            {searchQuery && (
              <span>
                • Matching: <strong style={{ color: 'var(--yellow-bright)' }}>{filteredProjects.length}</strong>
              </span>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '80px 20px',
            gap: '12px',
            color: 'var(--text-secondary)'
          }}>
            <Loader2 size={36} color="var(--yellow-chartreuse)" className="animate-spin" />
            <p style={{ fontSize: '14px' }}>Loading projects...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div style={{
            padding: '24px',
            borderRadius: '10px',
            backgroundColor: '#2A1818',
            border: '1px solid #7F1D1D',
            color: '#FCA5A5',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '14px',
            marginBottom: '24px'
          }}>
            <AlertCircle size={24} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h4 style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: 600 }}>Failed to load projects</h4>
              <p style={{ margin: 0, fontSize: '13px', opacity: 0.9 }}>{error}</p>
              <button
                onClick={fetchProjects}
                style={{
                  marginTop: '12px',
                  padding: '6px 14px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '4px',
                  color: '#FFFFFF',
                  fontSize: '12px',
                  fontWeight: 600
                }}
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredProjects.length === 0 && (
          <div style={{
            padding: '60px 24px',
            borderRadius: '12px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px dashed var(--border-subtle)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '12px',
              backgroundColor: 'var(--forest-dark)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--khaki-soft)'
            }}>
              <FolderKanban size={28} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 6px' }}>
                {searchQuery ? 'No matching projects found' : 'No investigation projects yet'}
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto' }}>
                {searchQuery
                  ? `No project matched the filter "${searchQuery}". Try a different search term.`
                  : 'Start by creating your first forensic project to extract data from an Android device.'}
              </p>
            </div>
            {!searchQuery && (
              <button
                onClick={() => setIsModalOpen(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  backgroundColor: 'var(--green-emerald)',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 600,
                  marginTop: '8px'
                }}
              >
                <Plus size={16} />
                <span>Create New Project</span>
              </button>
            )}
          </div>
        )}

        {/* Project Grid */}
        {!loading && !error && filteredProjects.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '20px'
          }}>
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
