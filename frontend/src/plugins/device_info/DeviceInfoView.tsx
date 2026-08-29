import React, { useEffect, useState } from 'react';
import { request } from '../../api/client';
import type { ApiResponse } from '../../types/project';
import {
  Smartphone,
  ShieldCheck,
  ShieldAlert,
  Cpu,
  Fingerprint,
  Radio,
  Clock,
  Key,
  AlertCircle,
  Loader2,
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';

interface DeviceInfoData {
  _id?: string;
  adb_serial: string;
  android_id?: string | null;
  imei?: string | null;
  mac_address?: string | null;
  manufacturer: string;
  model: string;
  hardware_platform?: string | null;
  android_version: string;
  sdk_level: number;
  build_fingerprint: string;
  security_patch?: string | null;
  timezone?: string | null;
  is_rooted: boolean;
  created_at?: string;
}

export const DeviceInfoView: React.FC<{ projectId: string }> = ({ projectId }) => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfoData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const fetchDeviceInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await request<ApiResponse<DeviceInfoData>>(`/device-info/${projectId}`);
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

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 20px',
        gap: '12px',
        color: 'var(--text-secondary)'
      }}>
        <Loader2 size={36} color="var(--yellow-chartreuse)" className="animate-spin" />
        <p style={{ fontSize: '14px' }}>Loading extracted device parameters...</p>
      </div>
    );
  }

  if (error || !deviceInfo) {
    return (
      <div style={{
        padding: '24px',
        borderRadius: '10px',
        backgroundColor: '#2A1818',
        border: '1px solid #7F1D1D',
        color: '#FCA5A5',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '14px'
      }}>
        <AlertCircle size={24} style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <h4 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: 600 }}>Device Information Unavailable</h4>
          <p style={{ margin: 0, fontSize: '13px', opacity: 0.9 }}>{error || 'No extraction records found.'}</p>
          <button
            onClick={fetchDeviceInfo}
            style={{
              marginTop: '12px',
              padding: '6px 14px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '4px',
              color: '#FFFFFF',
              fontSize: '12px',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <RefreshCw size={13} />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  const InfoCard = ({
    icon: Icon,
    label,
    value,
    copyable = false,
    copyKey = '',
    highlight = false
  }: {
    icon: any;
    label: string;
    value?: string | number | null;
    copyable?: boolean;
    copyKey?: string;
    highlight?: boolean;
  }) => {
    const displayVal = value ? String(value) : 'Not Available';
    const isAvail = !!value;

    return (
      <div style={{
        backgroundColor: 'var(--bg-card)',
        border: highlight ? '1px solid var(--forest-sage)' : '1px solid var(--border-subtle)',
        borderRadius: '8px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
            <Icon size={16} color="var(--yellow-chartreuse)" />
            <span style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {label}
            </span>
          </div>
          {copyable && isAvail && (
            <button
              onClick={() => copyToClipboard(displayVal, copyKey)}
              title="Copy value"
              style={{
                background: 'transparent',
                color: copiedKey === copyKey ? 'var(--yellow-bright)' : 'var(--khaki-soft)',
                padding: '2px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              {copiedKey === copyKey ? <Check size={14} /> : <Copy size={14} />}
            </button>
          )}
        </div>
        <div style={{
          fontSize: '15px',
          fontWeight: 600,
          color: isAvail ? 'var(--text-primary)' : 'var(--text-muted)',
          wordBreak: 'break-all',
          fontFamily: copyable ? 'var(--mono)' : 'inherit'
        }}>
          {displayVal}
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '10px',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '10px',
            backgroundColor: 'var(--forest-dark)',
            border: '1px solid var(--green-accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--yellow-cream)'
          }}>
            <Smartphone size={26} color="var(--yellow-chartreuse)" />
          </div>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 4px', color: 'var(--text-primary)' }}>
              {deviceInfo.manufacturer} {deviceInfo.model}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              <span>Android {deviceInfo.android_version} (API {deviceInfo.sdk_level})</span>
              <span>•</span>
              <span style={{ fontFamily: 'var(--mono)' }}>Serial: {deviceInfo.adb_serial}</span>
            </div>
          </div>
        </div>

        {/* Root status badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          borderRadius: '20px',
          backgroundColor: deviceInfo.is_rooted ? 'rgba(239, 68, 68, 0.15)' : 'rgba(92, 153, 90, 0.2)',
          border: deviceInfo.is_rooted ? '1px solid #EF4444' : '1px solid var(--green-emerald)',
          color: deviceInfo.is_rooted ? '#FCA5A5' : 'var(--yellow-cream)',
          fontSize: '13px',
          fontWeight: 600
        }}>
          {deviceInfo.is_rooted ? <ShieldAlert size={16} color="#EF4444" /> : <ShieldCheck size={16} color="var(--green-emerald)" />}
          <span>{deviceInfo.is_rooted ? 'Root Access Detected (SU Present)' : 'Standard Non-Rooted Device'}</span>
        </div>
      </div>

      {/* Grid of Extracted Parameters */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '16px'
      }}>
        <InfoCard icon={Key} label="Android ID" value={deviceInfo.android_id} copyable copyKey="android_id" />
        <InfoCard icon={Radio} label="Cellular IMEI" value={deviceInfo.imei} copyable copyKey="imei" />
        <InfoCard icon={Radio} label="Wi-Fi MAC Address" value={deviceInfo.mac_address} copyable copyKey="mac" />
        <InfoCard icon={Cpu} label="Hardware Platform" value={deviceInfo.hardware_platform} />
        <InfoCard icon={ShieldCheck} label="Security Patch" value={deviceInfo.security_patch} />
        <InfoCard icon={Clock} label="System Timezone" value={deviceInfo.timezone} />
      </div>

      {/* Build Fingerprint Details */}
      <div style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '8px',
        padding: '18px 20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
            <Fingerprint size={16} color="var(--yellow-chartreuse)" />
            <span style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Full Build Fingerprint
            </span>
          </div>
          <button
            onClick={() => copyToClipboard(deviceInfo.build_fingerprint, 'fingerprint')}
            title="Copy fingerprint"
            style={{
              background: 'transparent',
              color: copiedKey === 'fingerprint' ? 'var(--yellow-bright)' : 'var(--khaki-soft)',
              padding: '2px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            {copiedKey === 'fingerprint' ? <Check size={14} /> : <Copy size={14} />}
          </button>
        </div>
        <code style={{
          fontSize: '13px',
          lineHeight: '1.5',
          wordBreak: 'break-all',
          color: 'var(--yellow-cream)',
          backgroundColor: 'var(--bg-deep)',
          padding: '8px 12px',
          borderRadius: '6px',
          display: 'block',
          border: '1px solid var(--forest-dark)'
        }}>
          {deviceInfo.build_fingerprint}
        </code>
      </div>
    </div>
  );
};
