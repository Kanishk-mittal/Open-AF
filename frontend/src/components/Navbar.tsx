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
    <header style={{
      height: '64px',
      backgroundColor: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 28px',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      {/* Brand Logo & Name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          backgroundColor: 'var(--forest-dark)',
          border: '1px solid var(--green-accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
        }}>
          <Shield size={20} color="var(--yellow-chartreuse)" />
        </div>
        <div>
          <Link to="/" style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '0.5px', color: 'var(--text-primary)' }}>
              Open <span style={{ color: 'var(--yellow-chartreuse)' }}>AF</span>
            </span>
            <span style={{
              fontSize: '10px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              backgroundColor: 'var(--forest-dark)',
              color: 'var(--yellow-cream)',
              padding: '2px 6px',
              borderRadius: '4px',
              fontWeight: 600
            }}>
              Forensics
            </span>
          </Link>
        </div>
      </div>


      {/* Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {onRefresh && (
          <button
            onClick={onRefresh}
            title="Refresh list"
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              backgroundColor: 'var(--forest-dark)',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              border: '1px solid var(--border-subtle)',
              transition: 'background 0.15s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--forest-mid)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--forest-dark)')}
          >
            <RefreshCw size={15} />
            <span>Refresh</span>
          </button>
        )}

        {onImportProject && (
          <button
            onClick={onImportProject}
            title="Import Project Archive (.zip)"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '6px',
              backgroundColor: 'var(--forest-dark)',
              border: '1px solid var(--forest-sage)',
              color: 'var(--yellow-cream)',
              fontWeight: 500,
              fontSize: '13px',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--forest-mid)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--forest-dark)')}
          >
            <FolderInput size={15} color="var(--yellow-chartreuse)" />
            <span>Import</span>
          </button>
        )}

        {onNewProject && (
          <button
            onClick={onNewProject}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 18px',
              borderRadius: '6px',
              backgroundColor: 'var(--green-emerald)',
              color: '#FFFFFF',
              fontWeight: 600,
              fontSize: '13px',
              boxShadow: '0 2px 6px rgba(92, 153, 90, 0.3)',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--green-accent)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--green-emerald)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <Plus size={16} />
            <span>New Project</span>
          </button>
        )}
      </div>
    </header>
  );
};
