import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Plus, RefreshCw, FolderInput } from 'lucide-react';

interface NavbarProps {
  onRefresh?: () => void;
  onNewProject?: () => void;
  onImportProject?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onRefresh, onNewProject, onImportProject }) => {
  return (
    <header className="h-16 bg-bg-surface border-b border-border-subtle flex items-center justify-between px-7 sticky top-0 z-50">
      {/* Brand Logo & Name */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-forest-dark border border-green-accent flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
          <Shield size={20} className="text-yellow-chartreuse" />
        </div>
        <div>
          <Link to="/" className="flex items-baseline gap-1.5">
            <span className="text-lg font-bold tracking-[0.5px] text-text-primary">
              Open <span className="text-yellow-chartreuse">AF</span>
            </span>
            <span className="text-[10px] uppercase tracking-widest bg-forest-dark text-yellow-cream px-1.5 py-0.5 rounded font-semibold">
              Forensics
            </span>
          </Link>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        {onRefresh && (
          <button
            onClick={onRefresh}
            title="Refresh list"
            className="px-3 py-2 rounded-md bg-forest-dark text-text-secondary flex items-center gap-1.5 text-[13px] border border-border-subtle hover:bg-forest-mid transition-colors duration-150 cursor-pointer"
          >
            <RefreshCw size={15} />
            <span>Refresh</span>
          </button>
        )}

        {onImportProject && (
          <button
            onClick={onImportProject}
            title="Import Project Archive (.zip)"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-forest-dark border border-forest-sage text-yellow-cream font-medium text-[13px] hover:bg-forest-mid transition-all duration-150 cursor-pointer"
          >
            <FolderInput size={15} className="text-yellow-chartreuse" />
            <span>Import</span>
          </button>
        )}

        {onNewProject && (
          <button
            onClick={onNewProject}
            className="flex items-center gap-1.5 px-4.5 py-2 rounded-md bg-green-emerald text-white font-semibold text-[13px] shadow-[0_2px_6px_rgba(92,153,90,0.3)] hover:bg-green-accent hover:-translate-y-0.5 transition-all duration-150 cursor-pointer"
          >
            <Plus size={16} />
            <span>New Project</span>
          </button>
        )}
      </div>
    </header>
  );
};

