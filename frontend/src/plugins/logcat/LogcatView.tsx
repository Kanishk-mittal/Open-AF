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

  const getLogLineClass = (line: string): string => {
    if (line.includes(' E ') || line.includes(' E/') || line.startsWith('E/')) {
      return 'text-red-400';
    }
    if (line.includes(' W ') || line.includes(' W/') || line.startsWith('W/')) {
      return 'text-amber-400';
    }
    if (line.includes(' I ') || line.includes(' I/') || line.startsWith('I/')) {
      return 'text-blue-400';
    }
    if (line.includes(' D ') || line.includes(' D/') || line.startsWith('D/')) {
      return 'text-emerald-400';
    }
    if (line.includes(' V ') || line.includes(' V/') || line.startsWith('V/')) {
      return 'text-gray-400';
    }
    return 'text-text-secondary';
  };

  if (loadingDevice) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-5 gap-3 text-text-secondary">
        <Loader2 size={36} className="text-yellow-chartreuse animate-spin" />
        <p className="text-sm">Connecting to device logcat stream...</p>
      </div>
    );
  }

  if (error && !deviceSerial) {
    return (
      <div className="p-6 rounded-xl bg-[#2A1818] border border-red-900 text-red-300 flex items-start gap-3.5">
        <AlertCircle size={24} className="shrink-0 mt-0.5" />
        <div>
          <h4 className="m-0 mb-1.5 text-base font-semibold">Logcat Unavailable</h4>
          <p className="m-0 text-[13px] opacity-90">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Header Banner & Controls */}
      <div className="bg-bg-surface border border-border-subtle rounded-[10px] p-4 md:px-5 flex items-center justify-between flex-wrap gap-4 shadow-[0_4px_14px_rgba(0,0,0,0.25)] shrink-0">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-forest-dark border border-green-accent flex items-center justify-center text-yellow-cream shrink-0">
            <Terminal size={22} className="text-yellow-chartreuse" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-bold m-0 text-text-primary">
                Live Logcat
              </h2>
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold inline-flex items-center gap-1 border ${
                isStreaming
                  ? 'bg-green-emerald/20 border-green-emerald text-yellow-cream'
                  : 'bg-red-500/15 border-red-500 text-red-300'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isStreaming ? 'bg-yellow-chartreuse' : 'bg-red-500'}`} />
                {isStreaming ? 'STREAMING' : 'PAUSED'}
              </span>
            </div>
            <div className="text-xs text-text-secondary mt-0.5 font-mono">
              <span>{filteredLogs.length} / {logs.length} lines</span>
              <span className="mx-2 text-border-subtle">•</span>
              <span>Buffer: {maxQueueSize.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Device Selector Dropdown */}
          <div className="flex items-center gap-1.5 bg-bg-deep border border-border-subtle rounded-md px-2.5 py-1 text-xs text-text-secondary">
            <Smartphone size={14} className="text-yellow-chartreuse" />
            <span className="text-[11px] text-khaki-soft font-medium">Device:</span>
            <select
              value={deviceSerial || ''}
              onChange={(e) => {
                const newSerial = e.target.value;
                setDeviceSerial(newSerial);
                setLogs([]); // Clear logs for newly selected device
              }}
              className="bg-transparent border-none text-yellow-chartreuse text-xs font-mono outline-none cursor-pointer max-w-[180px]"
            >
              {deviceSerial && !connectedDevices.some((d) => d.serial === deviceSerial) && (
                <option value={deviceSerial} className="bg-bg-surface text-text-primary">
                  {deviceSerial} (Project Device)
                </option>
              )}
              {connectedDevices.map((dev) => (
                <option key={dev.serial} value={dev.serial} className="bg-bg-surface text-text-primary">
                  {dev.model ? `${dev.model} (${dev.serial})` : dev.serial}
                </option>
              ))}
            </select>
          </div>

          {/* Search/Filter Bar */}
          <div className="flex items-center bg-bg-deep border border-border-subtle rounded-md px-2.5 py-1 gap-2 w-45">
            <Search size={14} className="text-khaki-soft shrink-0" />
            <input
              type="text"
              placeholder="Filter logs..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="bg-transparent border-none outline-none text-text-primary text-xs w-full font-mono"
            />
          </div>

          {/* Buffer Queue Size Selector */}
          <div className="flex items-center gap-1.5 bg-bg-deep border border-border-subtle rounded-md px-2 py-1 text-xs text-text-secondary">
            <span className="text-[11px] text-khaki-soft">Queue:</span>
            <select
              value={maxQueueSize}
              onChange={(e) => setMaxQueueSize(Number(e.target.value))}
              className="bg-transparent border-none text-yellow-chartreuse text-xs font-mono outline-none cursor-pointer"
            >
              <option value={1000} className="bg-bg-surface text-text-primary">1,000</option>
              <option value={2500} className="bg-bg-surface text-text-primary">2,500</option>
              <option value={5000} className="bg-bg-surface text-text-primary">5,000</option>
              <option value={10000} className="bg-bg-surface text-text-primary">10,000</option>
              <option value={25000} className="bg-bg-surface text-text-primary">25,000</option>
              <option value={50000} className="bg-bg-surface text-text-primary">50,000</option>
            </select>
          </div>

          {/* Toggle Stream Button */}
          <button
            onClick={() => setIsStreaming(!isStreaming)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-colors border ${
              isStreaming
                ? 'bg-red-500/15 border-red-500 text-red-300 hover:bg-red-500/25'
                : 'bg-forest-dark border-forest-sage text-yellow-cream hover:bg-forest-mid'
            }`}
          >
            {isStreaming ? <Square size={13} className="fill-red-400 text-red-400" /> : <Play size={13} className="fill-yellow-chartreuse text-yellow-chartreuse" />}
            <span>{isStreaming ? 'Pause' : 'Resume'}</span>
          </button>

          {/* Auto Scroll Toggle */}
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-medium cursor-pointer transition-colors ${
              autoScroll
                ? 'bg-forest-mid border-border-subtle text-yellow-chartreuse'
                : 'bg-bg-deep border-border-subtle text-text-secondary hover:bg-bg-card hover:text-text-primary'
            }`}
            title="Auto-scroll to latest"
          >
            <ArrowDown size={13} />
            <span>Auto-scroll</span>
          </button>

          {/* Clear Button */}
          <button
            onClick={handleClear}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-bg-deep border border-border-subtle text-text-secondary text-xs font-medium cursor-pointer hover:bg-bg-card hover:text-text-primary transition-colors"
            title="Clear logs"
          >
            <Trash2 size={13} />
            <span>Clear</span>
          </button>

          {/* Export Button */}
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-bg-deep border border-border-subtle text-text-secondary text-xs font-medium cursor-pointer hover:bg-bg-card hover:text-text-primary transition-colors"
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
        className="flex-1 min-h-[400px] bg-[#0A0E0C] border border-border-subtle rounded-lg p-4 overflow-y-auto font-mono text-xs leading-normal whitespace-pre-wrap break-all shadow-[inset_0_2px_8px_rgba(0,0,0,0.4)]"
      >
        {filteredLogs.length === 0 ? (
          <div className="text-text-muted text-center pt-10">
            {filterText ? 'No log lines match current filter.' : 'Waiting for logcat output...'}
          </div>
        ) : (
          filteredLogs.map((line, idx) => (
            <div key={idx} className={getLogLineClass(line)}>
              {line}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

