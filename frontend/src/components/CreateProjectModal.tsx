import React, { useState, useEffect } from 'react';
import { X, FolderPlus, Loader2, RefreshCw, FolderOpen, Smartphone } from 'lucide-react';
import { adbApi } from '../api/adb';
import type { DeviceInfo, ProjectMetadataCreate } from '../types/project';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProjectMetadataCreate) => Promise<void>;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<ProjectMetadataCreate>({
    title: '',
    examiner_name: '',
    case_number: '',
    contact_number: '',
    organization: '',
    storage_location: '',
    device_serial: '',
    description: '',
    notes: '',
  });

  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [loadingDevices, setLoadingDevices] = useState(false);
  const [deviceFetchError, setDeviceFetchError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDevices = async () => {
    try {
      setLoadingDevices(true);
      setDeviceFetchError(null);
      const list = await adbApi.getDevices();
      setDevices(list);
      if (list.length > 0 && !formData.device_serial) {
        setFormData((prev) => ({ ...prev, device_serial: list[0].serial }));
      }
    } catch (err: any) {
      console.error('Error fetching ADB devices:', err);
      setDeviceFetchError(err?.message || 'Could not reach ADB server.');
    } finally {
      setLoadingDevices(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadDevices();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Open the native OS directory picker
   */
  const handleSelectFolder = async () => {
    try {
      const { open } = await import('@tauri-apps/plugin-dialog');
      const selected = await open({
        directory: true,
        multiple: false,
        title: 'Select Case Storage Directory',
      });

      if (selected && typeof selected === 'string') {
        setFormData((prev) => ({
          ...prev,
          storage_location: selected,
        }));
      }
    } catch (err: any) {
      console.error('Error opening native directory picker:', err);
    }
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (
      !formData.title ||
      !formData.examiner_name ||
      !formData.case_number ||
      !formData.contact_number ||
      !formData.organization ||
      !formData.storage_location ||
      !formData.device_serial
    ) {
      setError('Please fill in all required fields and select an active device.');
      return;
    }

    try {
      setLoading(true);
      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to create project.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    backgroundColor: 'var(--bg-deep)',
    border: '1px solid var(--forest-mid)',
    borderRadius: '6px',
    color: 'var(--text-primary)',
    fontSize: '13px',
    boxSizing: 'border-box',
    outline: 'none',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    marginBottom: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(10, 12, 10, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--forest-sage)',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '660px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--forest-dark)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FolderPlus size={22} color="var(--yellow-chartreuse)" />
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--yellow-cream)', margin: 0 }}>
              Create New Investigation Project
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              color: 'var(--text-secondary)',
              padding: '4px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {error && (
            <div
              style={{
                padding: '10px 14px',
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

          {/* Project Title */}
          <div>
            <label style={labelStyle}>
              Project Title <span style={{ color: 'var(--yellow-bright)' }}>*</span>
            </label>
            <input
              type="text"
              name="title"
              placeholder="e.g. Operation Falcon Extraction"
              value={formData.title}
              onChange={handleChange}
              style={inputStyle}
              required
            />
          </div>

          {/* Case Number & Organization */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>
                Case Number <span style={{ color: 'var(--yellow-bright)' }}>*</span>
              </label>
              <input
                type="text"
                name="case_number"
                placeholder="e.g. CASE-2026-088"
                value={formData.case_number}
                onChange={handleChange}
                style={inputStyle}
                required
              />
            </div>
            <div>
              <label style={labelStyle}>
                Organization <span style={{ color: 'var(--yellow-bright)' }}>*</span>
              </label>
              <input
                type="text"
                name="organization"
                placeholder="e.g. Cyber Crime Unit"
                value={formData.organization}
                onChange={handleChange}
                style={inputStyle}
                required
              />
            </div>
          </div>

          {/* Examiner Name & Contact */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>
                Examiner Name <span style={{ color: 'var(--yellow-bright)' }}>*</span>
              </label>
              <input
                type="text"
                name="examiner_name"
                placeholder="e.g. Agent Miller"
                value={formData.examiner_name}
                onChange={handleChange}
                style={inputStyle}
                required
              />
            </div>
            <div>
              <label style={labelStyle}>
                Contact Number <span style={{ color: 'var(--yellow-bright)' }}>*</span>
              </label>
              <input
                type="text"
                name="contact_number"
                placeholder="e.g. +1 555-0199"
                value={formData.contact_number}
                onChange={handleChange}
                style={inputStyle}
                required
              />
            </div>
          </div>

          {/* Device Serial (Dropdown from /api/v1/adb) */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ ...labelStyle, marginBottom: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Smartphone size={14} color="var(--yellow-chartreuse)" />
                Target Device (ADB Serial) <span style={{ color: 'var(--yellow-bright)' }}>*</span>
              </label>
              <button
                type="button"
                onClick={loadDevices}
                disabled={loadingDevices}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: 'transparent',
                  color: 'var(--yellow-cream)',
                  fontSize: '11px',
                  padding: '2px 6px',
                  borderRadius: '4px',
                }}
              >
                <RefreshCw size={12} className={loadingDevices ? 'animate-spin' : ''} />
                <span>{loadingDevices ? 'Scanning...' : 'Rescan Devices'}</span>
              </button>
            </div>

            {devices.length > 0 ? (
              <select
                name="device_serial"
                value={formData.device_serial}
                onChange={handleChange}
                style={{
                  ...inputStyle,
                  cursor: 'pointer',
                  appearance: 'auto',
                }}
                required
              >
                <option value="" disabled>Select a connected device</option>
                {devices.map((d) => (
                  <option key={d.serial} value={d.serial}>
                    {d.manufacturer} {d.model} (Serial: {d.serial} - Android {d.android_version})
                  </option>
                ))}
              </select>
            ) : (
              <div>
                <input
                  type="text"
                  name="device_serial"
                  placeholder={loadingDevices ? 'Detecting devices...' : 'Enter device serial (e.g. 192.168.56.101:5555)'}
                  value={formData.device_serial}
                  onChange={handleChange}
                  style={inputStyle}
                  required
                />
                <span style={{ fontSize: '11px', color: deviceFetchError ? '#FCA5A5' : 'var(--khaki-soft)', marginTop: '4px', display: 'block' }}>
                  {deviceFetchError
                    ? `ADB Note: ${deviceFetchError}. You can enter the serial manually above.`
                    : 'No devices auto-detected. Ensure Genymotion / ADB device is running and click Rescan, or enter serial manually.'}
                </span>
              </div>
            )}
          </div>

          {/* Storage Location with Folder Picker */}
          <div>
            <label style={labelStyle}>
              Storage Location <span style={{ color: 'var(--yellow-bright)' }}>*</span>
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                name="storage_location"
                placeholder="e.g. /home/user/forensics_data/case_01"
                value={formData.storage_location}
                onChange={handleChange}
                style={{ ...inputStyle, flex: 1 }}
                required
              />
              <button
                type="button"
                onClick={handleSelectFolder}
                title="Browse folder"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 14px',
                  backgroundColor: 'var(--forest-dark)',
                  border: '1px solid var(--forest-moss)',
                  borderRadius: '6px',
                  color: 'var(--yellow-cream)',
                  fontSize: '13px',
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--forest-mid)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--forest-dark)')}
              >
                <FolderOpen size={16} color="var(--yellow-chartreuse)" />
                <span>Browse</span>
              </button>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
              Click Browse to pick a directory or enter an absolute folder path on your machine.
            </span>
          </div>

          {/* Description */}
          <div>
            <label style={labelStyle}>Description (Optional)</label>
            <textarea
              name="description"
              rows={2}
              placeholder="Brief summary of the case or device..."
              value={formData.description}
              onChange={handleChange}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          {/* Actions */}
          <div
            style={{
              marginTop: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '12px',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 18px',
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
              type="submit"
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 22px',
                borderRadius: '6px',
                backgroundColor: 'var(--green-emerald)',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              <span>{loading ? 'Creating...' : 'Create Project'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

