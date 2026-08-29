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
      className="fixed inset-0 bg-[#0A0C0A]/80 backdrop-blur-[5px] flex items-center justify-center z-[110] p-5"
      onClick={() => {
        if (!loading) {
          setConfirmInput('');
          onClose();
        }
      }}
    >
      <div
        className="bg-bg-surface border border-red-900 rounded-xl w-full max-w-[500px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.6)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4.5 bg-[#2A1414] border-b border-[#451A1A] flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-red-400">
            <AlertTriangle size={22} />
            <h3 className="m-0 text-[17px] font-semibold text-red-100">
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
            className="bg-transparent text-red-400 p-1 rounded hover:text-red-200 transition-colors flex items-center justify-center cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-4">
          <p className="text-sm text-text-primary leading-normal m-0">
            This action <strong className="text-red-400">cannot be undone</strong>. This will permanently delete the project <strong className="text-yellow-cream">"{projectName}"</strong> (ID: <code className="text-xs">{projectId.slice(0, 8)}...</code>) and all associated extracted case data.
          </p>

          <div>
            <label className="block text-[13px] text-text-secondary mb-2">
              Type <strong>{projectName}</strong> to confirm deletion:
            </label>
            <input
              type="text"
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              placeholder={projectName}
              className="w-full px-3 py-2.5 bg-bg-deep border border-red-900 rounded-md text-red-100 text-sm outline-none focus:border-red-600 transition-colors"
              autoFocus
            />
          </div>

          {error && (
            <div className="px-3 py-2.5 bg-[#3E1C1C] border border-red-900 rounded-md text-red-300 text-[13px]">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 mt-2">
            <button
              type="button"
              onClick={() => {
                setConfirmInput('');
                onClose();
              }}
              disabled={loading}
              className="px-4 py-2.5 rounded-md bg-transparent border border-forest-mid text-text-secondary text-[13px] font-medium hover:bg-forest-dark hover:text-text-primary transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              disabled={!isConfirmed || loading}
              className={`flex items-center gap-2 px-4.5 py-2.5 rounded-md text-[13px] font-semibold transition-all duration-150 ${
                isConfirmed
                  ? 'bg-red-600 text-white cursor-pointer hover:bg-red-700'
                  : 'bg-[#5C2222] text-gray-400 cursor-not-allowed'
              }`}
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

