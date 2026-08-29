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
    <div className="bg-bg-card border border-border-subtle rounded-[10px] p-5 flex flex-col justify-between transition-all duration-200 relative shadow-[0_4px_12px_rgba(0,0,0,0.2)] hover:-translate-y-0.5 hover:border-forest-sage hover:bg-bg-card-hover group">
      <div>
        {/* Top Header info */}
        <div className="flex items-start justify-between gap-3">
          <div className="w-10 h-10 rounded-lg bg-forest-dark border border-forest-mid flex items-center justify-center text-yellow-chartreuse shrink-0">
            <Folder size={20} />
          </div>

          {/* Quick Actions (Export / Delete) */}
          <div className="flex items-center gap-1.5">
            {onExport && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onExport(project.id);
                }}
                title="Export Project Archive"
                className="p-1.5 rounded bg-transparent text-khaki-soft flex items-center justify-center transition-colors duration-150 hover:bg-forest-dark hover:text-yellow-cream cursor-pointer"
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
                className="p-1.5 rounded bg-transparent text-text-muted flex items-center justify-center transition-colors duration-150 hover:bg-[#422020] hover:text-red-300 cursor-pointer"
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Project Title */}
        <h3 className="mt-4 text-[17px] font-semibold text-text-primary break-words leading-snug">
          {project.title}
        </h3>

        {/* Case Number Badge */}
        <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-forest-dark border border-forest-mid text-yellow-cream text-xs font-medium font-mono">
          <Hash size={12} className="text-yellow-chartreuse" />
          <span>{project.case_number}</span>
        </div>
      </div>

      {/* Footer / Open Project Action */}
      <div className="mt-6 pt-4 border-t border-forest-dark flex items-center justify-between">
        <span className="text-[11px] text-text-muted font-mono">
          ID: {project.id.slice(0, 8)}...
        </span>

        <Link
          to={`/projects/${project.id}`}
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-yellow-chartreuse transition-all duration-150 hover:text-yellow-bright hover:gap-2"
        >
          <span>Open</span>
          <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
};

