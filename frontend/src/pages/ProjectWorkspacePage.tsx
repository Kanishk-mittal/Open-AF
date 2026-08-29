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
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-deep)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        color: 'var(--text-secondary)'
      }}>
        <Loader2 size={40} color="var(--yellow-chartreuse)" className="animate-spin" />
        <p style={{ fontSize: '15px' }}>Loading investigation workspace...</p>
      </div>
    );
  }

  if (error || !project || !projectId) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-deep)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}>
        <div style={{
          padding: '28px',
          borderRadius: '12px',
          backgroundColor: '#2A1818',
          border: '1px solid #7F1D1D',
          maxWidth: '500px',
          textAlign: 'center'
        }}>
          <AlertCircle size={36} color="#F87171" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '18px', color: '#FEE2E2', margin: '0 0 8px' }}>Project Not Found</h3>
          <p style={{ fontSize: '14px', color: '#FCA5A5', margin: '0 0 20px' }}>{error || 'Project data could not be retrieved.'}</p>
          <Link
            to="/"
            style={{
              padding: '8px 18px',
              backgroundColor: 'var(--forest-dark)',
              color: 'var(--yellow-cream)',
              borderRadius: '6px',
              border: '1px solid var(--forest-sage)',
              fontSize: '13px',
              fontWeight: 600
            }}
          >
            ← Return to Projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-deep)', overflow: 'hidden' }}>
      {/* Top Navigation Bar */}
      <header style={{
        height: '60px',
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link
            to="/"
            title="Back to All Projects"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '6px',
              backgroundColor: 'var(--forest-dark)',
              color: 'var(--yellow-cream)',
              fontSize: '13px',
              fontWeight: 500,
              border: '1px solid var(--border-subtle)',
              transition: 'background 0.15s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--forest-mid)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--forest-dark)')}
          >
            <ArrowLeft size={16} />
            <span>Projects</span>
          </Link>

          <div style={{ height: '20px', width: '1px', backgroundColor: 'var(--border-subtle)' }} />

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
            <h1 style={{ fontSize: '17px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              {project.title}
            </h1>
            <span style={{
              fontSize: '12px',
              fontFamily: 'var(--mono)',
              color: 'var(--yellow-chartreuse)',
              backgroundColor: 'var(--forest-dark)',
              padding: '2px 8px',
              borderRadius: '4px',
              border: '1px solid var(--forest-mid)'
            }}>
              #{project.case_number}
            </span>
          </div>
        </div>

        {/* Project Metadata Quick Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <User size={13} color="var(--khaki-soft)" />
            <span>Examiner: <strong style={{ color: 'var(--text-secondary)' }}>{project.examiner_name}</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <HardDrive size={13} color="var(--khaki-soft)" />
            <span style={{ fontFamily: 'var(--mono)' }}>{project.device_serial}</span>
          </div>
        </div>
      </header>

      {/* Main Workspace Split (Left Sidebar + Right Content Area) */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left Sidebar: Plugins List */}
        <aside style={{
          width: '260px',
          backgroundColor: 'var(--bg-surface)',
          borderRight: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0
        }}>
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Shield size={16} color="var(--yellow-chartreuse)" />
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: 'var(--text-secondary)'
            }}>
              Forensic Modules
            </span>
          </div>

          {/* Plugin Items */}
          <nav style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto' }}>
            {FRONTEND_PLUGINS.map((plugin) => {
              const Icon = plugin.icon;
              const isActive = activePluginId === plugin.id;

              return (
                <button
                  key={plugin.id}
                  onClick={() => setActivePluginId(plugin.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    backgroundColor: isActive ? 'var(--forest-dark)' : 'transparent',
                    color: isActive ? 'var(--yellow-cream)' : 'var(--text-secondary)',
                    border: isActive ? '1px solid var(--forest-sage)' : '1px solid transparent',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'var(--bg-card)';
                      e.currentTarget.style.color = 'var(--text-primary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }
                  }}
                >
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                    backgroundColor: isActive ? 'var(--forest-mid)' : 'var(--bg-deep)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isActive ? 'var(--yellow-chartreuse)' : 'var(--khaki-soft)'
                  }}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: isActive ? 600 : 500 }}>
                      {plugin.name}
                    </div>
                    {plugin.category && (
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '2px' }}>
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
        <main style={{
          flex: 1,
          backgroundColor: 'var(--bg-deep)',
          overflowY: 'auto',
          padding: '32px',
        }}>
          {ActiveComponent ? (
            <ActiveComponent projectId={projectId} />
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              Select a forensic module from the left sidebar.
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
