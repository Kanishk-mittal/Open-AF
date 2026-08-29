import React from 'react';
import { Link } from 'react-router-dom';
import { Folder, Hash, ArrowRight, Trash2, Upload } from 'lucide-react';
import type { ProjectListItem } from '../types/project';

interface ProjectCardProps {
  project: ProjectListItem;
  onDelete?: (id: string, title: string) => void;
  onExport?: (id: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onDelete, onExport }) => {
  return (
    <div
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '10px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'all 0.2s ease',
        position: 'relative',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.borderColor = 'var(--forest-sage)';
        e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'var(--border-subtle)';
        e.currentTarget.style.backgroundColor = 'var(--bg-card)';
      }}
    >
      <div>
        {/* Top Header info */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            backgroundColor: 'var(--forest-dark)',
            border: '1px solid var(--forest-mid)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--yellow-chartreuse)',
            flexShrink: 0
          }}>
            <Folder size={20} />
          </div>

          {/* Quick Actions (Export / Delete) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {onExport && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onExport(project.id);
                }}
                title="Export Project Archive"
                style={{
                  padding: '6px',
                  borderRadius: '4px',
                  backgroundColor: 'transparent',
                  color: 'var(--khaki-soft)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.15s ease, color 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--forest-dark)';
                  e.currentTarget.style.color = 'var(--yellow-cream)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--khaki-soft)';
                }}
              >
                <Upload size={15} />
              </button>
            )}

            {onDelete && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete(project.id, project.title);
                }}
                title="Delete Project"
                style={{
                  padding: '6px',
                  borderRadius: '4px',
                  backgroundColor: 'transparent',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.15s ease, color 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#422020';
                  e.currentTarget.style.color = '#FCA5A5';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--text-muted)';
                }}
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Project Title */}
        <h3 style={{
          marginTop: '16px',
          fontSize: '17px',
          fontWeight: 600,
          color: 'var(--text-primary)',
          wordBreak: 'break-word',
          lineHeight: 1.3
        }}>
          {project.title}
        </h3>

        {/* Case Number Badge */}
        <div style={{
          marginTop: '12px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          padding: '4px 10px',
          borderRadius: '6px',
          backgroundColor: 'var(--forest-dark)',
          border: '1px solid var(--forest-mid)',
          color: 'var(--yellow-cream)',
          fontSize: '12px',
          fontWeight: 500,
          fontFamily: 'var(--mono)'
        }}>
          <Hash size={12} color="var(--yellow-chartreuse)" />
          <span>{project.case_number}</span>
        </div>
      </div>

      {/* Footer / Open Project Action */}
      <div style={{
        marginTop: '24px',
        paddingTop: '16px',
        borderTop: '1px solid var(--forest-dark)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--mono)' }}>
          ID: {project.id.slice(0, 8)}...
        </span>

        <Link
          to={`/projects/${project.id}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--yellow-chartreuse)',
            transition: 'gap 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--yellow-bright)';
            e.currentTarget.style.gap = '8px';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--yellow-chartreuse)';
            e.currentTarget.style.gap = '6px';
          }}
        >
          <span>Open</span>
          <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
};
