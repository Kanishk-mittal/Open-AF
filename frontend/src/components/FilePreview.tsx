import React, { useEffect, useState, useMemo } from 'react';
import type { BackupFileItem } from '../types/backup';
import { backupApi } from '../api/backup';
import {
  Music,
  Binary,
  Copy,
  Check,
  Loader2,
  AlertCircle,
  Eye,
  Hash,
  Download,
  FolderOutput,
  Maximize2,
  Minimize2
} from 'lucide-react';

interface FilePreviewProps {
  projectId: string;
  file: BackupFileItem;
  onExportClick?: () => void;
}

type PreviewMode = 'formatted' | 'hex' | 'metadata';

const TEXT_EXTENSIONS = new Set([
  'txt', 'log', 'json', 'xml', 'html', 'htm', 'css', 'js', 'ts', 'jsx', 'tsx',
  'py', 'sh', 'bash', 'prop', 'conf', 'cfg', 'ini', 'md', 'markdown', 'yaml',
  'yml', 'csv', 'tsv', 'env', 'properties', 'rc', 'gradle', 'sql', 'svg'
]);

const IMAGE_EXTENSIONS = new Set([
  'png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'ico', 'svg'
]);

const AUDIO_EXTENSIONS = new Set(['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac']);
const VIDEO_EXTENSIONS = new Set(['mp4', 'webm', 'mkv', 'mov', 'avi']);

function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export const FilePreview: React.FC<FilePreviewProps> = ({
  projectId,
  file,
  onExportClick,
}) => {
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  const downloadUrl = backupApi.getDownloadUrl(projectId, file.path);

  // Default mode selection based on file extension
  const isText = TEXT_EXTENSIONS.has(ext);
  const isImage = IMAGE_EXTENSIONS.has(ext);
  const isAudio = AUDIO_EXTENSIONS.has(ext);
  const isVideo = VIDEO_EXTENSIONS.has(ext);
  const defaultMode: PreviewMode = (isText || isImage || isAudio || isVideo) ? 'formatted' : 'hex';

  const [mode, setMode] = useState<PreviewMode>(defaultMode);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [hexData, setHexData] = useState<Uint8Array | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Copy helpers
  const [copiedText, setCopiedText] = useState<boolean>(false);
  const [copiedHash, setCopiedHash] = useState<boolean>(false);
  const [copiedHex, setCopiedHex] = useState<boolean>(false);
  const [imageZoom, setImageZoom] = useState<boolean>(false);

  // Load preview data when file or mode changes
  useEffect(() => {
    let isCancelled = false;
    setMode((isText || isImage || isAudio || isVideo) ? 'formatted' : 'hex');
    setTextContent(null);
    setHexData(null);
    setError(null);

    const loadData = async () => {
      try {
        setLoading(true);

        if (isText) {
          const res = await fetch(downloadUrl);
          if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
          const text = await res.text();
          if (!isCancelled) setTextContent(text);
        }

        // For hex mode (or binary files), fetch array buffer (up to first 64KB for speed)
        const res = await fetch(downloadUrl);
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        const buffer = await res.arrayBuffer();
        if (!isCancelled) {
          // Limit to first 65,536 bytes for responsive rendering
          const slice = new Uint8Array(buffer.slice(0, 65536));
          setHexData(slice);
        }
      } catch (err: any) {
        if (!isCancelled) {
          setError(err?.message || 'Failed to load preview for this file.');
        }
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    if (!isImage && !isAudio && !isVideo) {
      loadData();
    } else {
      setLoading(false);
    }

    return () => {
      isCancelled = true;
    };
  }, [projectId, file.path]);

  // If switched to Hex mode and hexData not yet loaded
  useEffect(() => {
    if (mode === 'hex' && !hexData && !loading) {
      setLoading(true);
      fetch(downloadUrl)
        .then((res) => res.arrayBuffer())
        .then((buf) => {
          setHexData(new Uint8Array(buf.slice(0, 65536)));
          setLoading(false);
        })
        .catch((err) => {
          setError(err?.message || 'Failed to load binary data.');
          setLoading(false);
        });
    }
  }, [mode, hexData]);

  // Format Hex + ASCII dump lines (16 bytes per row)
  const hexLines = useMemo(() => {
    if (!hexData) return [];
    const lines = [];
    const len = hexData.length;

    for (let i = 0; i < len; i += 16) {
      const offset = i.toString(16).padStart(8, '0').toUpperCase();
      const chunk = hexData.slice(i, i + 16);

      // Format Hex columns (two groups of 8 bytes)
      const hexParts1 = [];
      const hexParts2 = [];
      const asciiParts = [];

      for (let j = 0; j < 16; j++) {
        if (j < chunk.length) {
          const byte = chunk[j];
          const hex = byte.toString(16).padStart(2, '0').toUpperCase();
          if (j < 8) hexParts1.push(hex);
          else hexParts2.push(hex);

          // ASCII printable check (32 to 126)
          if (byte >= 32 && byte <= 126) {
            asciiParts.push(String.fromCharCode(byte));
          } else {
            asciiParts.push('.');
          }
        } else {
          if (j < 8) hexParts1.push('  ');
          else hexParts2.push('  ');
          asciiParts.push(' ');
        }
      }

      lines.push({
        offset,
        hex1: hexParts1.join(' '),
        hex2: hexParts2.join(' '),
        ascii: asciiParts.join(''),
      });
    }
    return lines;
  }, [hexData]);

  // Copy helpers
  const handleCopyText = () => {
    if (!textContent) return;
    navigator.clipboard.writeText(textContent);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleCopyHash = () => {
    if (!file.sha256) return;
    navigator.clipboard.writeText(file.sha256);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleCopyHex = () => {
    if (!hexLines.length) return;
    const dump = hexLines
      .map((l) => `${l.offset}  ${l.hex1}  ${l.hex2}  |${l.ascii}|`)
      .join('\n');
    navigator.clipboard.writeText(dump);
    setCopiedHex(true);
    setTimeout(() => setCopiedHex(false), 2000);
  };

  return (
    <div className="flex flex-col h-full gap-3 overflow-hidden">
      {/* File Top Bar: Details & Mode Selector */}
      <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-border-subtle shrink-0">
        <div className="flex items-center gap-2.5 truncate max-w-md">
          <span className="font-semibold text-sm text-text-primary truncate" title={file.name}>
            {file.name}
          </span>
          <span className="text-[11px] font-mono text-text-muted px-1.5 py-0.5 rounded bg-forest-dark border border-border-subtle shrink-0">
            {formatBytes(file.size)}
          </span>
          <span className="text-[11px] font-mono uppercase text-yellow-chartreuse shrink-0">
            .{ext || 'bin'}
          </span>
        </div>

        {/* View Mode Toggle Buttons & Action Links */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg bg-bg-card border border-border-subtle p-0.5 text-xs">
            {(isText || isImage || isAudio || isVideo) && (
              <button
                type="button"
                onClick={() => setMode('formatted')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                  mode === 'formatted'
                    ? 'bg-forest-dark text-yellow-cream font-semibold'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                <Eye size={13} />
                <span>Preview</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setMode('hex')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                mode === 'hex'
                  ? 'bg-forest-dark text-yellow-cream font-semibold'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              <Binary size={13} />
              <span>Hex / ASCII</span>
            </button>

            <button
              type="button"
              onClick={() => setMode('metadata')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                mode === 'metadata'
                  ? 'bg-forest-dark text-yellow-cream font-semibold'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              <Hash size={13} />
              <span>Metadata</span>
            </button>
          </div>

          <a
            href={downloadUrl}
            download={file.name}
            title="Download file"
            className="p-1.5 rounded-md bg-forest-dark border border-border-subtle text-yellow-cream hover:bg-forest-mid transition-colors flex items-center gap-1"
          >
            <Download size={13} />
          </a>

          {onExportClick && (
            <button
              type="button"
              onClick={onExportClick}
              title="Export file to host"
              className="p-1.5 rounded-md bg-bg-card border border-border-subtle text-text-secondary hover:bg-forest-dark hover:text-text-primary transition-colors flex items-center gap-1 cursor-pointer"
            >
              <FolderOutput size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Main Preview Container */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0 bg-bg-card/40 rounded-lg border border-border-subtle">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 text-text-muted">
            <Loader2 size={24} className="animate-spin text-yellow-chartreuse" />
            <span className="text-xs">Loading file preview...</span>
          </div>
        ) : error ? (
          <div className="p-6 text-red-300 flex items-center gap-2 text-xs">
            <AlertCircle size={16} className="text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        ) : mode === 'formatted' ? (
          /* Formatted Preview Mode (Images, Text, Audio, Video) */
          <div className="flex-1 overflow-auto p-4 flex flex-col">
            {isImage ? (
              <div className="flex-1 flex flex-col items-center justify-center relative min-h-[300px]">
                <button
                  onClick={() => setImageZoom(!imageZoom)}
                  className="absolute top-2 right-2 p-1.5 rounded bg-black/60 text-white hover:bg-black/80 z-10"
                  title={imageZoom ? 'Fit' : 'Zoom'}
                >
                  {imageZoom ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                </button>
                <img
                  src={downloadUrl}
                  alt={file.name}
                  className={`rounded border border-border-subtle max-h-full transition-all ${
                    imageZoom ? 'max-w-none object-none' : 'max-w-full object-contain'
                  }`}
                />
              </div>
            ) : isAudio ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 gap-4">
                <Music size={48} className="text-green-accent animate-pulse" />
                <audio controls src={downloadUrl} className="w-full max-w-md" />
              </div>
            ) : isVideo ? (
              <div className="flex-1 flex flex-col items-center justify-center">
                <video controls src={downloadUrl} className="max-w-full max-h-full rounded border border-border-subtle" />
              </div>
            ) : isText && textContent !== null ? (
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-border-subtle shrink-0">
                  <span className="text-[11px] text-text-muted font-mono">
                    {textContent.split('\n').length} lines • {textContent.length} characters
                  </span>
                  <button
                    onClick={handleCopyText}
                    className="text-xs text-yellow-chartreuse hover:text-yellow-cream flex items-center gap-1 cursor-pointer font-medium"
                  >
                    {copiedText ? <Check size={13} /> : <Copy size={13} />}
                    <span>{copiedText ? 'Copied' : 'Copy Text'}</span>
                  </button>
                </div>
                <div className="flex-1 overflow-auto font-mono text-xs text-text-primary leading-relaxed bg-forest-dark/30 p-3 rounded border border-border-subtle">
                  <pre className="m-0 select-text whitespace-pre-wrap break-all">
                    {textContent}
                  </pre>
                </div>
              </div>
            ) : null}
          </div>
        ) : mode === 'hex' ? (
          /* Hexadecimal + ASCII Viewer Mode */
          <div className="flex-1 flex flex-col overflow-hidden p-3 font-mono text-xs">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-border-subtle shrink-0 text-text-muted">
              <span className="text-[11px]">
                Showing first {formatBytes(hexData?.length || 0)} in 16-byte rows
              </span>
              <button
                onClick={handleCopyHex}
                className="text-xs text-yellow-chartreuse hover:text-yellow-cream flex items-center gap-1 cursor-pointer font-medium"
              >
                {copiedHex ? <Check size={13} /> : <Copy size={13} />}
                <span>{copiedHex ? 'Copied' : 'Copy Hex Dump'}</span>
              </button>
            </div>

            {/* 3-Column Hex Dump Grid */}
            <div className="flex-1 overflow-auto bg-forest-dark/40 p-2.5 rounded border border-border-subtle select-text">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="text-text-muted border-b border-border-subtle/50 text-[10px] uppercase">
                    <th className="text-left pb-1 font-semibold pr-4">Offset</th>
                    <th className="text-left pb-1 font-semibold pr-3">00 01 02 03 04 05 06 07</th>
                    <th className="text-left pb-1 font-semibold pr-4">08 09 0A 0B 0C 0D 0E 0F</th>
                    <th className="text-left pb-1 font-semibold">ASCII Text</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle/20 text-[11px] leading-tight">
                  {hexLines.map((line) => (
                    <tr key={line.offset} className="hover:bg-forest-mid/30">
                      <td className="text-khaki-soft font-semibold pr-4 py-0.5 select-all">
                        {line.offset}
                      </td>
                      <td className="text-yellow-bright pr-3 py-0.5 tracking-wider select-all">
                        {line.hex1}
                      </td>
                      <td className="text-yellow-chartreuse pr-4 py-0.5 tracking-wider select-all">
                        {line.hex2}
                      </td>
                      <td className="text-text-primary py-0.5 font-mono select-all bg-black/20 px-1.5 rounded">
                        {line.ascii}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Metadata Mode */
          <div className="p-5 flex flex-col gap-4 overflow-auto max-w-xl">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-bg-card p-3 rounded border border-border-subtle">
                <span className="text-[10px] text-text-muted uppercase font-medium">Path in Backup</span>
                <p className="text-xs font-mono text-text-primary m-0 mt-0.5 break-all">{file.path}</p>
              </div>

              <div className="bg-bg-card p-3 rounded border border-border-subtle">
                <span className="text-[10px] text-text-muted uppercase font-medium">File Size</span>
                <p className="text-xs font-mono text-text-primary m-0 mt-0.5">{formatBytes(file.size)} ({file.size} bytes)</p>
              </div>

              <div className="bg-bg-card p-3 rounded border border-border-subtle">
                <span className="text-[10px] text-text-muted uppercase font-medium">Last Modified</span>
                <p className="text-xs font-mono text-text-primary m-0 mt-0.5">
                  {file.modified_at ? new Date(file.modified_at).toLocaleString() : 'N/A'}
                </p>
              </div>

              <div className="bg-bg-card p-3 rounded border border-border-subtle">
                <span className="text-[10px] text-text-muted uppercase font-medium">Extension</span>
                <p className="text-xs font-mono text-yellow-chartreuse m-0 mt-0.5 uppercase">.{ext || 'None'}</p>
              </div>
            </div>

            {file.sha256 && (
              <div className="bg-bg-card border border-border-subtle rounded p-3 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-text-muted uppercase font-medium">SHA-256 Hash</span>
                  <button
                    onClick={handleCopyHash}
                    className="text-xs text-yellow-chartreuse hover:text-yellow-cream flex items-center gap-1 cursor-pointer"
                  >
                    {copiedHash ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedHash ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <span className="text-xs font-mono text-text-primary break-all bg-forest-dark p-2 rounded border border-border-subtle">
                  {file.sha256}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
