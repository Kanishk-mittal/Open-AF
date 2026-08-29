import React, { useState } from 'react';
import { AlertTriangle, Trash2, X, Loader2 } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  projectName: string;
  projectId: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  projectName,
  projectId,
  onClose,
  onConfirm,
}) => {
  const [confirmInput, setConfirmInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const isConfirmed = confirmInput.trim() === projectName.trim();

  const handleConfirmDelete = async () => {
    if (!isConfirmed) return;
    try {
      setLoading(true);
      setError(null);
      await onConfirm();
      setConfirmInput('');
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to delete project.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(10, 12, 10, 0.8)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 110,
        padding: '20px',
      }}
      onClick={() => {
        if (!loading) {
          setConfirmInput('');
          onClose();
        }
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid #7F1D1D',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '500px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 24px',
            backgroundColor: '#2A1414',
            borderBottom: '1px solid #451A1A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#F87171' }}>
            <AlertTriangle size={22} />
            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 600, color: '#FEE2E2' }}>
              Delete Project Approval
            </h3>
          </div>
          <button
            onClick={() => {
              if (!loading) {
                setConfirmInput('');
                onClose();
              }
            }}
            style={{
              background: 'transparent',
              color: '#F87171',
              padding: '4px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: 1.5, margin: 0 }}>
            This action <strong style={{ color: '#F87171' }}>cannot be undone</strong>. This will permanently delete the project <strong style={{ color: 'var(--yellow-cream)' }}>"{projectName}"</strong> (ID: <code style={{ fontSize: '12px' }}>{projectId.slice(0, 8)}...</code>) and all associated extracted case data.
          </p>

          <div>
            <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Type <strong>{projectName}</strong> to confirm deletion:
            </label>
            <input
              type="text"
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              placeholder={projectName}
              style={{
                width: '100%',
                padding: '10px 12px',
                backgroundColor: 'var(--bg-deep)',
                border: '1px solid #7F1D1D',
                borderRadius: '6px',
                color: '#FEE2E2',
                fontSize: '14px',
                boxSizing: 'border-box',
                outline: 'none',
              }}
              autoFocus
            />
          </div>

          {error && (
            <div
              style={{
                padding: '10px 12px',
                backgroundColor: '#3E1C1C',
                border: '1px solid #7F1D1D',
                borderRadius: '6px',
                color: '#FCA5A5',
                fontSize: '13px',
              }}
            >
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '12px',
              marginTop: '8px',
            }}
          >
            <button
              type="button"
              onClick={() => {
                setConfirmInput('');
                onClose();
              }}
              disabled={loading}
              style={{
                padding: '9px 16px',
                borderRadius: '6px',
                backgroundColor: 'transparent',
                border: '1px solid var(--forest-mid)',
                color: 'var(--text-secondary)',
                fontSize: '13px',
                fontWeight: 500,
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              disabled={!isConfirmed || loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 18px',
                borderRadius: '6px',
                backgroundColor: isConfirmed ? '#DC2626' : '#5C2222',
                color: isConfirmed ? '#FFFFFF' : '#9CA3AF',
                fontSize: '13px',
                fontWeight: 600,
                cursor: isConfirmed && !loading ? 'pointer' : 'not-allowed',
                transition: 'all 0.15s ease',
              }}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
              <span>{loading ? 'Deleting...' : 'Permanently Delete'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
