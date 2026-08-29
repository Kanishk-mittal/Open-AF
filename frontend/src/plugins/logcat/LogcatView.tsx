import React, { useEffect, useState, useRef } from 'react';
import { projectsApi } from '../../api/projects';
import { adbApi } from '../../api/adb';
import type { DeviceInfo } from '../../types/project';
import {
  Terminal,
  Play,
  Square,
  Trash2,
  Download,
  AlertCircle,
  Loader2,
  Search,
  ArrowDown,
  Smartphone
} from 'lucide-react';

export const LogcatView: React.FC<{ projectId: string }> = ({ projectId }) => {
  const [deviceSerial, setDeviceSerial] = useState<string | null>(null);
  const [connectedDevices, setConnectedDevices] = useState<DeviceInfo[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [loadingDevice, setLoadingDevice] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filterText, setFilterText] = useState<string>('');
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const [maxQueueSize, setMaxQueueSize] = useState<number>(5000);

  const abortControllerRef = useRef<AbortController | null>(null);
  const logContainerRef = useRef<HTMLDivElement | null>(null);
  const maxQueueSizeRef = useRef<number>(maxQueueSize);

  useEffect(() => {
    maxQueueSizeRef.current = maxQueueSize;
    // Trim current logs if new limit is smaller
    setLogs((prev) => (prev.length > maxQueueSize ? prev.slice(prev.length - maxQueueSize) : prev));
  }, [maxQueueSize]);

  // Fetch initial project metadata device serial and all connected devices
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoadingDevice(true);
        setError(null);
        
        // Fetch project metadata & adb devices concurrently
        const [metadata, adbDevices] = await Promise.all([
          projectsApi.getProject(projectId).catch((err) => {
            console.error('Failed to load project metadata:', err);
            return null;
          }),
          adbApi.getDevices().catch((err) => {
            console.error('Failed to load ADB devices:', err);
            return [];
          })
        ]);

        setConnectedDevices(adbDevices || []);

        if (metadata?.device_serial) {
          setDeviceSerial(metadata.device_serial);
        } else if (adbDevices && adbDevices.length > 0) {
          setDeviceSerial(adbDevices[0].serial);
        } else {
          setError('No target device serial associated with this project or connected via ADB.');
        }
      } catch (err: any) {
        console.error('Failed to load initial data:', err);
        setError(err?.message || 'Failed to retrieve device details.');
      } finally {
        setLoadingDevice(false);
      }
    };

    if (projectId) {
      fetchInitialData();
    }
  }, [projectId]);

  // Handle streaming logcat
  useEffect(() => {
    if (!deviceSerial || !isStreaming) {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      return;
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const startStreaming = async () => {
      try {
        const response = await fetch(`/api/v1/logcat?device=${encodeURIComponent(deviceSerial)}`, {
          signal: abortController.signal,
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Failed to stream logcat (${response.status}): ${errText}`);
        }

        if (!response.body) {
          throw new Error('ReadableStream not supported by browser or response has no body.');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          // Keep the remaining part in buffer
          buffer = lines.pop() || '';

          if (lines.length > 0) {
            setLogs((prev) => {
              const limit = maxQueueSizeRef.current;
              const combined = [...prev, ...lines];
              // Sliding window queue: keep only latest 'limit' lines, dropping oldest
              return combined.length > limit ? combined.slice(combined.length - limit) : combined;
            });
          }
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Logcat streaming error:', err);
          setError(err.message || 'Error occurred while streaming logcat.');
          setIsStreaming(false);
        }
      }
    };

    startStreaming();

    return () => {
      abortController.abort();
      abortControllerRef.current = null;
    };
  }, [deviceSerial, isStreaming]);

  // Auto-scroll effect
  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const handleClear = () => {
    setLogs([]);
  };

  const handleExport = () => {
    const blob = new Blob([logs.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logcat_${deviceSerial || 'device'}_${new Date().toISOString().replace(/[:.]/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredLogs = filterText.trim()
    ? logs.filter((line) => line.toLowerCase().includes(filterText.toLowerCase()))
    : logs;

  const getLogLineStyle = (line: string): React.CSSProperties => {
    if (line.includes(' E ') || line.includes(' E/') || line.startsWith('E/')) {
      return { color: '#F87171' }; // Error Red
    }
    if (line.includes(' W ') || line.includes(' W/') || line.startsWith('W/')) {
      return { color: '#FBBF24' }; // Warning Yellow
    }
    if (line.includes(' I ') || line.includes(' I/') || line.startsWith('I/')) {
      return { color: '#60A5FA' }; // Info Blue
    }
    if (line.includes(' D ') || line.includes(' D/') || line.startsWith('D/')) {
      return { color: '#34D399' }; // Debug Green
    }
    if (line.includes(' V ') || line.includes(' V/') || line.startsWith('V/')) {
      return { color: '#9CA3AF' }; // Verbose Gray
    }
    return { color: 'var(--text-secondary)' };
  };

  if (loadingDevice) {
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
        <p style={{ fontSize: '14px' }}>Connecting to device logcat stream...</p>
      </div>
    );
  }

  if (error && !deviceSerial) {
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
          <h4 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: 600 }}>Logcat Unavailable</h4>
          <p style={{ margin: 0, fontSize: '13px', opacity: 0.9 }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
      {/* Header Banner & Controls */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '10px',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            backgroundColor: 'var(--forest-dark)',
            border: '1px solid var(--green-accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--yellow-cream)',
            flexShrink: 0
          }}>
            <Terminal size={22} color="var(--yellow-chartreuse)" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                Live Logcat
              </h2>
              <span style={{
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '12px',
                backgroundColor: isStreaming ? 'rgba(92, 153, 90, 0.2)' : 'rgba(239, 68, 68, 0.15)',
                border: isStreaming ? '1px solid var(--green-emerald)' : '1px solid #EF4444',
                color: isStreaming ? 'var(--yellow-cream)' : '#FCA5A5',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: isStreaming ? 'var(--yellow-chartreuse)' : '#EF4444'
                }} />
                {isStreaming ? 'STREAMING' : 'PAUSED'}
              </span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px', fontFamily: 'var(--mono)' }}>
              <span>{filteredLogs.length} / {logs.length} lines</span>
              <span style={{ margin: '0 8px', color: 'var(--border-subtle)' }}>•</span>
              <span>Buffer: {maxQueueSize.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Action Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Device Selector Dropdown */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'var(--bg-deep)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
            padding: '4px 10px',
            fontSize: '12px',
            color: 'var(--text-secondary)'
          }}>
            <Smartphone size={14} color="var(--yellow-chartreuse)" />
            <span style={{ fontSize: '11px', color: 'var(--khaki-soft)', fontWeight: 500 }}>Device:</span>
            <select
              value={deviceSerial || ''}
              onChange={(e) => {
                const newSerial = e.target.value;
                setDeviceSerial(newSerial);
                setLogs([]); // Clear logs for newly selected device
              }}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: 'var(--yellow-chartreuse)',
                fontSize: '12px',
                fontFamily: 'var(--mono)',
                outline: 'none',
                cursor: 'pointer',
                maxWidth: '180px'
              }}
            >
              {deviceSerial && !connectedDevices.some((d) => d.serial === deviceSerial) && (
                <option value={deviceSerial} style={{ backgroundColor: '#131A17', color: '#FFF' }}>
                  {deviceSerial} (Project Device)
                </option>
              )}
              {connectedDevices.map((dev) => (
                <option key={dev.serial} value={dev.serial} style={{ backgroundColor: '#131A17', color: '#FFF' }}>
                  {dev.model ? `${dev.model} (${dev.serial})` : dev.serial}
                </option>
              ))}
            </select>
          </div>
          {/* Search/Filter Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'var(--bg-deep)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
            padding: '4px 10px',
            gap: '8px',
            width: '180px'
          }}>
            <Search size={14} color="var(--khaki-soft)" />
            <input
              type="text"
              placeholder="Filter logs..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--text-primary)',
                fontSize: '12px',
                width: '100%',
                fontFamily: 'var(--mono)'
              }}
            />
          </div>

          {/* Buffer Queue Size Selector */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'var(--bg-deep)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
            padding: '4px 8px',
            fontSize: '12px',
            color: 'var(--text-secondary)'
          }}>
            <span style={{ fontSize: '11px', color: 'var(--khaki-soft)' }}>Queue:</span>
            <select
              value={maxQueueSize}
              onChange={(e) => setMaxQueueSize(Number(e.target.value))}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: 'var(--yellow-chartreuse)',
                fontSize: '12px',
                fontFamily: 'var(--mono)',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value={1000} style={{ backgroundColor: '#131A17', color: '#FFF' }}>1,000</option>
              <option value={2500} style={{ backgroundColor: '#131A17', color: '#FFF' }}>2,500</option>
              <option value={5000} style={{ backgroundColor: '#131A17', color: '#FFF' }}>5,000</option>
              <option value={10000} style={{ backgroundColor: '#131A17', color: '#FFF' }}>10,000</option>
              <option value={25000} style={{ backgroundColor: '#131A17', color: '#FFF' }}>25,000</option>
              <option value={50000} style={{ backgroundColor: '#131A17', color: '#FFF' }}>50,000</option>
            </select>
          </div>

          {/* Toggle Stream Button */}
          <button
            onClick={() => setIsStreaming(!isStreaming)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '6px',
              backgroundColor: isStreaming ? 'rgba(239, 68, 68, 0.15)' : 'var(--forest-dark)',
              border: isStreaming ? '1px solid #EF4444' : '1px solid var(--forest-sage)',
              color: isStreaming ? '#FCA5A5' : 'var(--yellow-cream)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {isStreaming ? <Square size={13} fill="#EF4444" /> : <Play size={13} fill="var(--yellow-chartreuse)" />}
            <span>{isStreaming ? 'Pause' : 'Resume'}</span>
          </button>

          {/* Auto Scroll Toggle */}
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '6px',
              backgroundColor: autoScroll ? 'var(--forest-mid)' : 'var(--bg-deep)',
              border: '1px solid var(--border-subtle)',
              color: autoScroll ? 'var(--yellow-chartreuse)' : 'var(--text-secondary)',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer'
            }}
            title="Auto-scroll to latest"
          >
            <ArrowDown size={13} />
            <span>Auto-scroll</span>
          </button>

          {/* Clear Button */}
          <button
            onClick={handleClear}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '6px',
              backgroundColor: 'var(--bg-deep)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer'
            }}
            title="Clear logs"
          >
            <Trash2 size={13} />
            <span>Clear</span>
          </button>

          {/* Export Button */}
          <button
            onClick={handleExport}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '6px',
              backgroundColor: 'var(--bg-deep)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer'
            }}
            title="Download logs"
          >
            <Download size={13} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Terminal Display */}
      <div
        ref={logContainerRef}
        style={{
          flex: 1,
          minHeight: '400px',
          backgroundColor: '#0A0E0C',
          border: '1px solid var(--border-subtle)',
          borderRadius: '8px',
          padding: '16px',
          overflowY: 'auto',
          fontFamily: 'var(--mono)',
          fontSize: '12px',
          lineHeight: '1.5',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
          boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.4)'
        }}
      >
        {filteredLogs.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', paddingTop: '40px' }}>
            {filterText ? 'No log lines match current filter.' : 'Waiting for logcat output...'}
          </div>
        ) : (
          filteredLogs.map((line, idx) => (
            <div key={idx} style={getLogLineStyle(line)}>
              {line}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
