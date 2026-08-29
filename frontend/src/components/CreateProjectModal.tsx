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

  const inputClass = "w-full px-3 py-2.5 bg-bg-deep border border-forest-mid rounded-md text-text-primary text-[13px] outline-none focus:border-forest-sage transition-colors";
  const labelClass = "block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-[0.5px]";

  return (
    <div
      className="fixed inset-0 bg-[#0A0C0A]/75 backdrop-blur-[4px] flex items-center justify-center z-[100] p-5"
      onClick={onClose}
    >
      <div
        className="bg-bg-surface border border-forest-sage rounded-xl w-full max-w-[660px] max-h-[90vh] overflow-y-auto shadow-[0_20px_40px_rgba(0,0,0,0.5)] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-border-subtle flex items-center justify-between bg-forest-dark">
          <div className="flex items-center gap-2.5">
            <FolderPlus size={22} className="text-yellow-chartreuse" />
            <h2 className="text-lg font-semibold text-yellow-cream m-0">
              Create New Investigation Project
            </h2>
          </div>
          <button
            onClick={onClose}
            className="bg-transparent text-text-secondary p-1 rounded hover:text-text-primary transition-colors flex items-center justify-center cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          {error && (
            <div className="px-3.5 py-2.5 bg-[#3E1C1C] border border-[#7F1D1D] rounded-md text-[#FCA5A5] text-[13px]">
              {error}
            </div>
          )}

          {/* Project Title */}
          <div>
            <label className={labelClass}>
              Project Title <span className="text-yellow-bright">*</span>
            </label>
            <input
              type="text"
              name="title"
              placeholder="e.g. Operation Falcon Extraction"
              value={formData.title}
              onChange={handleChange}
              className={inputClass}
              required
            />
          </div>

          {/* Case Number & Organization */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                Case Number <span className="text-yellow-bright">*</span>
              </label>
              <input
                type="text"
                name="case_number"
                placeholder="e.g. CASE-2026-088"
                value={formData.case_number}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>
                Organization <span className="text-yellow-bright">*</span>
              </label>
              <input
                type="text"
                name="organization"
                placeholder="e.g. Cyber Crime Unit"
                value={formData.organization}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </div>
          </div>

          {/* Examiner Name & Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                Examiner Name <span className="text-yellow-bright">*</span>
              </label>
              <input
                type="text"
                name="examiner_name"
                placeholder="e.g. Agent Miller"
                value={formData.examiner_name}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>
                Contact Number <span className="text-yellow-bright">*</span>
              </label>
              <input
                type="text"
                name="contact_number"
                placeholder="e.g. +1 555-0199"
                value={formData.contact_number}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </div>
          </div>

          {/* Device Serial (Dropdown from /api/v1/adb) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-[0.5px] flex items-center gap-1.5 mb-0">
                <Smartphone size={14} className="text-yellow-chartreuse" />
                Target Device (ADB Serial) <span className="text-yellow-bright">*</span>
              </label>
              <button
                type="button"
                onClick={loadDevices}
                disabled={loadingDevices}
                className="flex items-center gap-1 bg-transparent text-yellow-cream text-[11px] px-1.5 py-0.5 rounded hover:bg-forest-dark transition-colors cursor-pointer"
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
                className={`${inputClass} cursor-pointer appearance-auto`}
                required
              >
                <option value="" disabled>Select a connected device</option>
                {devices.map((d) => (
                  <option key={d.serial} value={d.serial} className="bg-bg-deep text-text-primary">
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
                  className={inputClass}
                  required
                />
                <span className={`text-[11px] mt-1 block ${deviceFetchError ? 'text-red-300' : 'text-khaki-soft'}`}>
                  {deviceFetchError
                    ? `ADB Note: ${deviceFetchError}. You can enter the serial manually above.`
                    : 'No devices auto-detected. Ensure Genymotion / ADB device is running and click Rescan, or enter serial manually.'}
                </span>
              </div>
            )}
          </div>

          {/* Storage Location with Folder Picker */}
          <div>
            <label className={labelClass}>
              Storage Location <span className="text-yellow-bright">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                name="storage_location"
                placeholder="e.g. /home/user/forensics_data/case_01"
                value={formData.storage_location}
                onChange={handleChange}
                className={`${inputClass} flex-1`}
                required
              />
              <button
                type="button"
                onClick={handleSelectFolder}
                title="Browse folder"
                className="flex items-center gap-1.5 px-3.5 py-2.5 bg-forest-dark border border-forest-moss rounded-md text-yellow-cream text-[13px] font-medium whitespace-nowrap hover:bg-forest-mid transition-colors cursor-pointer"
              >
                <FolderOpen size={16} className="text-yellow-chartreuse" />
                <span>Browse</span>
              </button>
            </div>
            <span className="text-[11px] text-text-muted mt-1 block">
              Click Browse to pick a directory or enter an absolute folder path on your machine.
            </span>
          </div>

          {/* Description */}
          <div>
            <label className={labelClass}>Description (Optional)</label>
            <textarea
              name="description"
              rows={2}
              placeholder="Brief summary of the case or device..."
              value={formData.description}
              onChange={handleChange}
              className={`${inputClass} resize-y`}
            />
          </div>

          {/* Actions */}
          <div className="mt-3 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4.5 py-2.5 rounded-md bg-transparent border border-forest-mid text-text-secondary text-[13px] font-medium hover:bg-forest-dark hover:text-text-primary transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5.5 py-2.5 rounded-md bg-green-emerald text-white text-[13px] font-semibold hover:bg-green-accent disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer transition-all"
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


