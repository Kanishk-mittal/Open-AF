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
          <p style={{ margin: 0, fontSize: '13px', opacity: 0.9 }}>{error || 'No extraction records found for this case.'}</p>
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Banner */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--forest-sage)',
        borderRadius: '10px',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '12px',
            backgroundColor: 'var(--forest-dark)',
            border: '1px solid var(--green-accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--yellow-cream)',
            flexShrink: 0
          }}>
            <Smartphone size={28} color="var(--yellow-chartreuse)" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                {manufacturer} {model}
              </h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              <span>Android {androidVersion}</span>
              <span>•</span>
              <span style={{ fontFamily: 'var(--mono)', color: 'var(--yellow-chartreuse)' }}>
                {adbSerial}
              </span>
            </div>
          </div>
        </div>

        {/* Root status badge & Refresh */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '20px',
            backgroundColor: isRooted ? 'rgba(239, 68, 68, 0.15)' : 'rgba(92, 153, 90, 0.2)',
            border: isRooted ? '1px solid #EF4444' : '1px solid var(--green-emerald)',
            color: isRooted ? '#FCA5A5' : 'var(--yellow-cream)',
            fontSize: '13px',
            fontWeight: 600
          }}>
            {isRooted ? <ShieldAlert size={16} color="#EF4444" /> : <ShieldCheck size={16} color="var(--green-emerald)" />}
            <span>{isRooted ? 'is_rooted: true' : 'is_rooted: false'}</span>
          </div>

          <button
            onClick={fetchDeviceInfo}
            title="Refresh device details"
            style={{
              padding: '8px',
              borderRadius: '6px',
              backgroundColor: 'var(--forest-dark)',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--border-subtle)',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Dynamic Grid of Extracted Properties using Object.entries */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '16px'
      }}>
        {entries.map(([key, rawItem]) => {
          const val = getArtifactValue(rawItem);
          const source = getArtifactSource(rawItem);
          const formatted = formatValue(val);
          const isNull = val === null || val === undefined || val === '';

          return (
            <div
              key={key}
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
              }}
            >
              {/* Artifact Key */}
              <div style={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--khaki-soft)',
                fontFamily: 'var(--mono)',
                wordBreak: 'break-all',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {key}
              </div>

              {/* Artifact Value */}
              <div>
                <div style={{
                  fontSize: '11px',
                  color: 'var(--text-secondary)',
                  marginBottom: '2px',
                  fontWeight: 500
                }}>
                  Value
                </div>
                <div style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: isNull ? 'var(--text-muted)' : 'var(--text-primary)',
                  fontFamily: 'var(--mono)',
                  wordBreak: 'break-all',
                  fontStyle: isNull ? 'italic' : 'normal'
                }}>
                  {formatted}
                </div>
              </div>

              {/* Artifact Source / Command */}
              {source && (
                <div style={{
                  marginTop: 'auto',
                  paddingTop: '8px',
                  borderTop: '1px dashed var(--border-subtle)'
                }}>
                  <div style={{
                    fontSize: '11px',
                    color: 'var(--text-secondary)',
                    marginBottom: '2px',
                    fontWeight: 500
                  }}>
                    Source Command
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: 'var(--yellow-chartreuse)',
                    fontFamily: 'var(--mono)',
                    wordBreak: 'break-all',
                    backgroundColor: 'var(--forest-dark)',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    border: '1px solid var(--border-subtle)'
                  }}>
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



