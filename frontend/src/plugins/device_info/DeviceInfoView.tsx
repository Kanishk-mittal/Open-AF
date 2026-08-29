import React, { useEffect, useState } from 'react';
import { request } from '../../api/client';
import type { ApiResponse } from '../../types/project';
import {
  Smartphone,
  ShieldCheck,
  ShieldAlert,
  AlertCircle,
  Loader2,
  RefreshCw
} from 'lucide-react';

export const DeviceInfoView: React.FC<{ projectId: string }> = ({ projectId }) => {
  const [deviceInfo, setDeviceInfo] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDeviceInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await request<ApiResponse<Record<string, any>>>(`/device-info/${projectId}`);
      setDeviceInfo(res.data);
    } catch (err: any) {
      console.error('Error fetching device info:', err);
      setError(err?.message || 'Device info not found or not yet extracted for this project.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchDeviceInfo();
    }
  }, [projectId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-5 gap-3 text-text-secondary">
        <Loader2 size={36} className="text-yellow-chartreuse animate-spin" />
        <p className="text-sm">Loading extracted device parameters...</p>
      </div>
    );
  }

  if (error || !deviceInfo) {
    return (
      <div className="p-6 rounded-xl bg-[#2A1818] border border-red-900 text-red-300 flex items-start gap-3.5">
        <AlertCircle size={24} className="shrink-0 mt-0.5" />
        <div>
          <h4 className="m-0 mb-1.5 text-base font-semibold">Device Information Unavailable</h4>
          <p className="m-0 text-[13px] opacity-90">{error || 'No extraction records found for this case.'}</p>
          <button
            onClick={fetchDeviceInfo}
            className="mt-3 px-3.5 py-1.5 bg-white/10 rounded text-white text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-white/20 transition-colors cursor-pointer"
          >
            <RefreshCw size={13} />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  // Filter out internal MongoDB _id and extract entries
  const entries = Object.entries(deviceInfo).filter(([key]) => key !== '_id' && key !== 'created_at');

  const getArtifactValue = (item: any): any => {
    if (item && typeof item === 'object' && 'value' in item) {
      return item.value;
    }
    return item;
  };

  const getArtifactSource = (item: any): string | null => {
    if (item && typeof item === 'object' && 'source' in item) {
      return item.source;
    }
    return null;
  };

  const formatValue = (val: any): string => {
    if (val === null || val === undefined || val === '') return 'null';
    if (typeof val === 'boolean') return val ? 'true' : 'false';
    return String(val);
  };

  const manufacturer = formatValue(getArtifactValue(deviceInfo.manufacturer)) !== 'null' ? getArtifactValue(deviceInfo.manufacturer) : 'Device';
  const model = formatValue(getArtifactValue(deviceInfo.model)) !== 'null' ? getArtifactValue(deviceInfo.model) : '';
  const androidVersion = formatValue(getArtifactValue(deviceInfo.android_version));
  const adbSerial = formatValue(getArtifactValue(deviceInfo.adb_serial));
  const isRooted = Boolean(getArtifactValue(deviceInfo.is_rooted));

  return (
    <div className="flex flex-col gap-5">
      {/* Header Banner */}
      <div className="bg-bg-surface border border-forest-sage rounded-[10px] p-5 md:px-6 flex items-center justify-between flex-wrap gap-4 shadow-[0_4px_14px_rgba(0,0,0,0.25)]">
        <div className="flex items-center gap-4.5">
          <div className="w-13 h-13 rounded-xl bg-forest-dark border border-green-accent flex items-center justify-center text-yellow-cream shrink-0">
            <Smartphone size={28} className="text-yellow-chartreuse" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-[22px] font-bold m-0 text-text-primary">
                {manufacturer} {model}
              </h2>
            </div>
            <div className="flex items-center gap-3 text-[13px] text-text-secondary mt-1">
              <span>Android {androidVersion}</span>
              <span>•</span>
              <span className="font-mono text-yellow-chartreuse">
                {adbSerial}
              </span>
            </div>
          </div>
        </div>

        {/* Root status badge & Refresh */}
        <div className="flex items-center gap-3">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-semibold ${
            isRooted
              ? 'bg-red-500/15 border border-red-500 text-red-300'
              : 'bg-green-emerald/20 border border-green-emerald text-yellow-cream'
          }`}>
            {isRooted ? <ShieldAlert size={16} className="text-red-500" /> : <ShieldCheck size={16} className="text-green-emerald" />}
            <span>{isRooted ? 'is_rooted: true' : 'is_rooted: false'}</span>
          </div>

          <button
            onClick={fetchDeviceInfo}
            title="Refresh device details"
            className="p-2 rounded-md bg-forest-dark text-text-secondary flex items-center justify-center border border-border-subtle hover:bg-forest-mid hover:text-text-primary transition-colors cursor-pointer"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Dynamic Grid of Extracted Properties using Object.entries */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-4">
        {entries.map(([key, rawItem]) => {
          const val = getArtifactValue(rawItem);
          const source = getArtifactSource(rawItem);
          const formatted = formatValue(val);
          const isNull = val === null || val === undefined || val === '';

          return (
            <div
              key={key}
              className="bg-bg-card border border-border-subtle rounded-lg p-4 flex flex-col gap-2.5 shadow-[0_2px_8px_rgba(0,0,0,0.15)]"
            >
              {/* Artifact Key */}
              <div className="text-xs font-semibold text-khaki-soft font-mono break-all uppercase tracking-[0.5px]">
                {key}
              </div>

              {/* Artifact Value */}
              <div>
                <div className="text-[11px] text-text-secondary mb-0.5 font-medium">
                  Value
                </div>
                <div className={`text-sm font-medium font-mono break-all ${isNull ? 'text-text-muted italic' : 'text-text-primary'}`}>
                  {formatted}
                </div>
              </div>

              {/* Artifact Source / Command */}
              {source && (
                <div className="mt-auto pt-2 border-t border-dashed border-border-subtle">
                  <div className="text-[11px] text-text-secondary mb-0.5 font-medium">
                    Source Command
                  </div>
                  <div className="text-xs text-yellow-chartreuse font-mono break-all bg-forest-dark px-2 py-1 rounded border border-border-subtle">
                    {source}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};




