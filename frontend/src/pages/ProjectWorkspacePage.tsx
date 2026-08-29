import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { projectsApi } from '../api/projects';
import type { ProjectMetadata } from '../types/project';
import { FRONTEND_PLUGINS } from '../plugins/registry';
import {
  Shield,
  ArrowLeft,
  User,
  AlertCircle,
  Loader2,
  HardDrive
} from 'lucide-react';

export const ProjectWorkspacePage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<ProjectMetadata | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activePluginId, setActivePluginId] = useState<string>(FRONTEND_PLUGINS[0]?.id || '');

  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (!projectId) return;
      try {
        setLoading(true);
        setError(null);
        const data = await projectsApi.getProject(projectId);
        setProject(data);
      } catch (err: any) {
        console.error('Error fetching project:', err);
        setError(err?.message || 'Failed to load project details.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [projectId]);

  const activePlugin = FRONTEND_PLUGINS.find((p) => p.id === activePluginId) || FRONTEND_PLUGINS[0];
  const ActiveComponent = activePlugin ? activePlugin.component : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-deep flex flex-col items-center justify-center gap-4 text-text-secondary">
        <Loader2 size={40} className="text-yellow-chartreuse animate-spin" />
        <p className="text-[15px]">Loading investigation workspace...</p>
      </div>
    );
  }

  if (error || !project || !projectId) {
    return (
      <div className="min-h-screen bg-bg-deep flex flex-col items-center justify-center p-6">
        <div className="p-7 rounded-xl bg-[#2A1818] border border-red-900 max-w-[500px] text-center">
          <AlertCircle size={36} className="text-red-400 mx-auto mb-3" />
          <h3 className="text-lg text-red-100 m-0 mb-2 font-semibold">Project Not Found</h3>
          <p className="text-sm text-red-300 m-0 mb-5">{error || 'Project data could not be retrieved.'}</p>
          <Link
            to="/"
            className="px-4.5 py-2 bg-forest-dark text-yellow-cream rounded-md border border-forest-sage text-[13px] font-semibold hover:bg-forest-mid transition-colors inline-block"
          >
            ← Return to Projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-bg-deep overflow-hidden">
      {/* Top Navigation Bar */}
      <header className="h-[60px] bg-bg-surface border-b border-border-subtle flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            title="Back to All Projects"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-forest-dark text-yellow-cream text-[13px] font-medium border border-border-subtle hover:bg-forest-mid transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Projects</span>
          </Link>

          <div className="h-5 w-px bg-border-subtle" />

          <div className="flex items-baseline gap-2.5">
            <h1 className="text-[17px] font-bold m-0 text-text-primary">
              {project.title}
            </h1>
            <span className="text-xs font-mono text-yellow-chartreuse bg-forest-dark px-2 py-0.5 rounded border border-forest-mid">
              #{project.case_number}
            </span>
          </div>
        </div>

        {/* Project Metadata Quick Badges */}
        <div className="flex items-center gap-4 text-xs text-text-muted">
          <div className="flex items-center gap-1.5">
            <User size={13} className="text-khaki-soft" />
            <span>Examiner: <strong className="text-text-secondary">{project.examiner_name}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <HardDrive size={13} className="text-khaki-soft" />
            <span className="font-mono">{project.device_serial}</span>
          </div>
        </div>
      </header>

      {/* Main Workspace Split (Left Sidebar + Right Content Area) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Plugins List */}
        <aside className="w-[260px] bg-bg-surface border-r border-border-subtle flex flex-col shrink-0">
          <div className="px-5 py-4 border-b border-border-subtle flex items-center gap-2">
            <Shield size={16} className="text-yellow-chartreuse" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-text-secondary">
              Forensic Modules
            </span>
          </div>

          {/* Plugin Items */}
          <nav className="p-3 flex flex-col gap-1.5 overflow-y-auto">
            {FRONTEND_PLUGINS.map((plugin) => {
              const Icon = plugin.icon;
              const isActive = activePluginId === plugin.id;

              return (
                <button
                  key={plugin.id}
                  onClick={() => setActivePluginId(plugin.id)}
                  className={`flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-150 cursor-pointer relative border ${
                    isActive
                      ? 'bg-forest-dark text-yellow-cream border-forest-sage font-semibold'
                      : 'bg-transparent text-text-secondary border-transparent hover:bg-bg-card hover:text-text-primary'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-md flex items-center justify-center ${
                    isActive ? 'bg-forest-mid text-yellow-chartreuse' : 'bg-bg-deep text-khaki-soft'
                  }`}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <div className={`text-[13px] ${isActive ? 'font-semibold' : 'font-medium'}`}>
                      {plugin.name}
                    </div>
                    {plugin.category && (
                      <div className="text-[10px] text-text-muted uppercase tracking-wider mt-0.5">
                        {plugin.category}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Right Main Content Area: Active Plugin View */}
        <main className="flex-1 bg-bg-deep overflow-y-auto p-8">
          {ActiveComponent ? (
            <ActiveComponent projectId={projectId} />
          ) : (
            <div className="text-center py-15 px-5 text-text-muted">
              Select a forensic module from the left sidebar.
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

