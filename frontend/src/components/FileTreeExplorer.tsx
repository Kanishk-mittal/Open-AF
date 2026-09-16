import React, { useEffect, useState, useMemo } from 'react';
import { backupApi } from '../api/backup';
import type { BackupFileItem, BackupMetadata } from '../types/backup';
import { FilePreview } from './FilePreview';
import {
  Folder,
  FolderOpen,
  File,
  FileText,
  FileCode,
  FileArchive,
  Database,
  Image as ImageIcon,
  Music,
  Video,
  ChevronRight,
  ChevronDown,
  Download,
  Search,
  Hash,
  Check,
  RefreshCw,
  Loader2,
  AlertCircle,
  FolderTree,
  FolderOutput,
  X
} from 'lucide-react';

interface FileTreeExplorerProps {
  projectId: string;
}

interface TreeNode {
  name: string;
  path: string;
  is_dir: boolean;
  size: number;
  modified_at?: string | null;
  sha256?: string | null;
  extension?: string | null;
  children?: TreeNode[];
  isLoaded?: boolean;
  isLoading?: boolean;
  isOpen?: boolean;
}

function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function getFileIcon(isDir: boolean, name: string, isOpen: boolean = false) {
  if (isDir) {
    return isOpen ? (
      <FolderOpen size={15} className="text-yellow-chartreuse shrink-0" />
    ) : (
      <Folder size={15} className="text-khaki-soft shrink-0" />
    );
  }

  const ext = name.split('.').pop()?.toLowerCase() || '';
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp'].includes(ext)) {
    return <ImageIcon size={14} className="text-green-emerald shrink-0" />;
  }
  if (['json', 'xml', 'js', 'ts', 'html', 'css', 'py', 'sh', 'yaml', 'yml'].includes(ext)) {
    return <FileCode size={14} className="text-yellow-bright shrink-0" />;
  }
  if (['db', 'sqlite', 'sqlite3', 'bson', 'realm', 'sql'].includes(ext)) {
    return <Database size={14} className="text-yellow-chartreuse shrink-0" />;
  }
  if (['zip', 'tar', 'gz', 'ab', 'apk', 'jar', '7z', 'rar'].includes(ext)) {
    return <FileArchive size={14} className="text-earth-brown shrink-0" />;
  }
  if (['txt', 'log', 'md', 'csv', 'prop', 'conf'].includes(ext)) {
    return <FileText size={14} className="text-text-secondary shrink-0" />;
  }
  if (['mp3', 'wav', 'ogg', 'm4a', 'flac'].includes(ext)) {
    return <Music size={14} className="text-green-accent shrink-0" />;
  }
  if (['mp4', 'mkv', 'avi', 'mov', 'webm'].includes(ext)) {
    return <Video size={14} className="text-green-lime shrink-0" />;
  }
  return <File size={14} className="text-text-muted shrink-0" />;
}

export const FileTreeExplorer: React.FC<FileTreeExplorerProps> = ({ projectId }) => {
  const [backupInfo, setBackupInfo] = useState<BackupMetadata | null>(null);

  // Tree state
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set(['/']));
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
  const [selectedDirItems, setSelectedDirItems] = useState<BackupFileItem[]>([]);
  const [loadingDir, setLoadingDir] = useState<boolean>(false);

  // Search & Filter
  const [filterQuery, setFilterQuery] = useState<string>('');
  const [hashSearchQuery, setHashSearchQuery] = useState<string>('');
  const [hashSearchResults, setHashSearchResults] = useState<BackupFileItem[] | null>(null);
  const [isSearchingHash, setIsSearchingHash] = useState<boolean>(false);

  // Export Modal
  const [exportModalOpen, setExportModalOpen] = useState<boolean>(false);
  const [exportTarget, setExportTarget] = useState<BackupFileItem | null>(null);
  const [exportDestPath, setExportDestPath] = useState<string>('/tmp/forensics_export');
  const [exporting, setExporting] = useState<boolean>(false);
  const [exportMessage, setExportMessage] = useState<{ text: string; success: boolean } | null>(null);

  // Load project backup metadata
  const loadBackupInfo = async () => {
    try {
      const info = await backupApi.getBackupInfo(projectId);
      setBackupInfo(info);
    } catch {
      // Backup metadata optional
    }
  };

  // Load root files and initialize tree
  const loadRoot = async () => {
    try {
      setLoadingDir(true);
      const data = await backupApi.listFiles(projectId, '/');
      const rootNodes: TreeNode[] = data.items.map((item) => ({
        ...item,
        children: item.is_dir ? [] : undefined,
        isLoaded: false,
        isLoading: false,
        isOpen: false,
      }));
      setTreeData(rootNodes);
      setSelectedDirItems(data.items);
      setSelectedNode({
        name: 'Root',
        path: '/',
        is_dir: true,
        size: 0,
      });
    } catch (err: any) {
      console.error('Error loading root directory:', err);
    } finally {
      setLoadingDir(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      loadBackupInfo();
      loadRoot();
    }
  }, [projectId]);

  // Load children for a directory node in the tree
  const loadChildren = async (node: TreeNode) => {
    if (!node.is_dir) return;

    if (expandedPaths.has(node.path)) {
      setExpandedPaths((prev) => {
        const next = new Set(prev);
        next.delete(node.path);
        return next;
      });
      return;
    }

    try {
      setTreeData((prev) => updateNodeInTree(prev, node.path, { isLoading: true }));
      const data = await backupApi.listFiles(projectId, node.path);
      const childNodes: TreeNode[] = data.items.map((item) => ({
        ...item,
        children: item.is_dir ? [] : undefined,
        isLoaded: false,
        isLoading: false,
        isOpen: false,
      }));

      setTreeData((prev) =>
        updateNodeInTree(prev, node.path, {
          children: childNodes,
          isLoaded: true,
          isLoading: false,
        })
      );

      setExpandedPaths((prev) => new Set(prev).add(node.path));
    } catch (err) {
      console.error('Failed to load child directory:', err);
      setTreeData((prev) => updateNodeInTree(prev, node.path, { isLoading: false }));
    }
  };

  const updateNodeInTree = (
    nodes: TreeNode[],
    targetPath: string,
    updates: Partial<TreeNode>
  ): TreeNode[] => {
    return nodes.map((node) => {
      if (node.path === targetPath) {
        return { ...node, ...updates };
      }
      if (node.children && node.children.length > 0) {
        return {
          ...node,
          children: updateNodeInTree(node.children, targetPath, updates),
        };
      }
      return node;
    });
  };

  const handleSelectNode = async (node: TreeNode) => {
    setSelectedNode(node);
    if (node.is_dir) {
      try {
        setLoadingDir(true);
        const data = await backupApi.listFiles(projectId, node.path);
        setSelectedDirItems(data.items);
      } catch (err) {
        console.error('Error fetching directory items:', err);
      } finally {
        setLoadingDir(false);
      }
    }
  };

  // Minimal Hash Search
  const handleHashSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hashSearchQuery.trim()) {
      setHashSearchResults(null);
      return;
    }
    try {
      setIsSearchingHash(true);
      const results = await backupApi.findByHash(projectId, hashSearchQuery.trim());
      setHashSearchResults(results);
    } catch (err) {
      console.error('Hash search error:', err);
      setHashSearchResults([]);
    } finally {
      setIsSearchingHash(false);
    }
  };

  const handleExecuteExport = async () => {
    if (!exportTarget || !exportDestPath.trim()) return;
    try {
      setExporting(true);
      setExportMessage(null);
      const res = await backupApi.exportFile(projectId, exportTarget.path, exportDestPath.trim());
      setExportMessage({
        text: `Exported to ${res.destination_path} (${formatBytes(res.exported_size)})`,
        success: true,
      });
    } catch (err: any) {
      setExportMessage({
        text: err?.message || 'Export failed',
        success: false,
      });
    } finally {
      setExporting(false);
    }
  };

  const filteredDirItems = useMemo(() => {
    if (!filterQuery.trim()) return selectedDirItems;
    const q = filterQuery.toLowerCase();
    return selectedDirItems.filter((item) => item.name.toLowerCase().includes(q));
  }, [selectedDirItems, filterQuery]);

  const renderTreeNodes = (nodes: TreeNode[], depth = 0) => {
    return nodes.map((node) => {
      const isExpanded = expandedPaths.has(node.path);
      const isSelected = selectedNode?.path === node.path;

      return (
        <div key={node.path} className="flex flex-col select-none">
          <div
            onClick={() => {
              if (node.is_dir) {
                loadChildren(node);
              }
              handleSelectNode(node);
            }}
            style={{ paddingLeft: `${depth * 12 + 6}px` }}
            className={`flex items-center gap-1.5 py-1 px-1.5 rounded text-[12.5px] cursor-pointer transition-colors duration-100 ${
              isSelected
                ? 'bg-forest-dark text-yellow-cream font-medium border-l-2 border-yellow-chartreuse'
                : 'text-text-secondary hover:bg-bg-card hover:text-text-primary'
            }`}
          >
            {node.is_dir ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  loadChildren(node);
                }}
                className="p-0.5 text-text-muted hover:text-text-primary"
              >
                {node.isLoading ? (
                  <Loader2 size={12} className="animate-spin text-yellow-chartreuse" />
                ) : isExpanded ? (
                  <ChevronDown size={13} />
                ) : (
                  <ChevronRight size={13} />
                )}
              </button>
            ) : (
              <span className="w-3 inline-block" />
            )}

            {getFileIcon(node.is_dir, node.name, isExpanded)}

            <span className="truncate flex-1" title={node.name}>
              {node.name}
            </span>

            {!node.is_dir && node.size > 0 && (
              <span className="text-[10px] font-mono text-text-muted shrink-0">
                {formatBytes(node.size, 0)}
              </span>
            )}
          </div>

          {node.is_dir && isExpanded && node.children && node.children.length > 0 && (
            <div>{renderTreeNodes(node.children, depth + 1)}</div>
          )}
        </div>
      );
    });
  };

  const breadcrumbs = useMemo(() => {
    if (!selectedNode) return ['/'];
    const parts = selectedNode.path.split('/').filter(Boolean);
    return ['/', ...parts];
  }, [selectedNode]);

  return (
    <div className="flex flex-col gap-3 h-[calc(100vh-140px)] min-h-[550px]">
      {/* Sleek, Minimal Top Bar */}
      <div className="bg-bg-surface border border-border-subtle rounded-lg px-4 py-2.5 flex items-center justify-between flex-wrap gap-3 shrink-0 shadow-sm">
        {/* Left: Quick Module Info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <FolderTree size={16} className="text-yellow-chartreuse" />
            <span className="text-xs font-bold uppercase tracking-wider text-text-primary">
              Backup Explorer
            </span>
          </div>

          {backupInfo?.file_size ? (
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-forest-dark border border-border-subtle text-yellow-cream">
              {formatBytes(backupInfo.file_size)}
            </span>
          ) : null}

          <button
            type="button"
            onClick={() => {
              loadBackupInfo();
              loadRoot();
            }}
            title="Refresh Explorer"
            className="p-1.5 rounded bg-bg-card text-text-secondary hover:text-text-primary hover:bg-forest-dark transition-colors cursor-pointer"
          >
            <RefreshCw size={13} />
          </button>
        </div>

        {/* Right: Minimal Compact Hash Search */}
        <div className="relative">
          <form onSubmit={handleHashSearch} className="flex items-center gap-1.5">
            <div className="relative">
              <Hash size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="text"
                placeholder="Enter SHA-256 here..."
                value={hashSearchQuery}
                onChange={(e) => setHashSearchQuery(e.target.value)}
                className="pl-7 pr-7 py-1 text-xs rounded-md bg-forest-dark border border-border-subtle text-text-primary placeholder:text-text-muted focus:outline-none focus:border-yellow-chartreuse w-[210px] sm:w-[260px] font-mono"
              />
              {hashSearchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setHashSearchQuery('');
                    setHashSearchResults(null);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                >
                  <X size={12} />
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={isSearchingHash || !hashSearchQuery.trim()}
              className="p-1.5 rounded-md bg-forest-mid border border-border-subtle text-yellow-cream hover:bg-forest-sage transition-colors cursor-pointer disabled:opacity-40"
              title="Search hash"
            >
              {isSearchingHash ? <Loader2 size={13} className="animate-spin" /> : <Search size={13} />}
            </button>
          </form>

          {/* Compact Hash Results Popover / Dropdown */}
          {hashSearchResults !== null && (
            <div className="absolute right-0 top-full mt-2 w-[340px] sm:w-[400px] bg-bg-surface border border-forest-sage rounded-lg p-3 shadow-2xl z-30 flex flex-col gap-2">
              <div className="flex items-center justify-between border-b border-border-subtle pb-1.5">
                <span className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
                  <Hash size={13} className="text-yellow-chartreuse" />
                  <span>Matches ({hashSearchResults.length})</span>
                </span>
                <button
                  onClick={() => setHashSearchResults(null)}
                  className="text-[11px] text-text-muted hover:text-text-primary flex items-center gap-0.5"
                >
                  <X size={12} /> Close
                </button>
              </div>

              {hashSearchResults.length === 0 ? (
                <p className="text-xs text-text-muted italic m-0 py-2">No matching files found.</p>
              ) : (
                <div className="max-h-48 overflow-y-auto divide-y divide-border-subtle">
                  {hashSearchResults.map((file) => (
                    <div
                      key={file.path}
                      onClick={() => {
                        setSelectedNode(file);
                        setHashSearchResults(null);
                      }}
                      className="py-1.5 px-1 flex items-center justify-between gap-2 text-xs hover:bg-bg-card rounded cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        {getFileIcon(false, file.name)}
                        <span className="font-mono text-text-primary truncate">{file.path}</span>
                      </div>
                      <span className="text-text-muted font-mono text-[10px] shrink-0">
                        {formatBytes(file.size)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Maximized Main Split Pane: Left Tree + Right Preview/Directory */}
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] lg:grid-cols-[300px_1fr] gap-3 flex-1 min-h-0 overflow-hidden">
        {/* Left Tree Panel */}
        <div className="bg-bg-surface border border-border-subtle rounded-lg flex flex-col overflow-hidden shadow-sm min-h-0">
          <div className="p-2.5 border-b border-border-subtle flex items-center justify-between bg-bg-card/40">
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">
              File Hierarchy
            </span>
            <button
              onClick={loadRoot}
              title="Reload Root"
              className="text-text-muted hover:text-text-primary transition-colors"
            >
              <RefreshCw size={12} />
            </button>
          </div>

          <div className="p-1.5 overflow-y-auto flex-1 font-sans">
            {treeData.length === 0 ? (
              <div className="p-6 text-center text-xs text-text-muted">
                {loadingDir ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 size={14} className="animate-spin text-yellow-chartreuse" />
                    <span>Loading hierarchy...</span>
                  </div>
                ) : (
                  'No files found.'
                )}
              </div>
            ) : (
              renderTreeNodes(treeData)
            )}
          </div>
        </div>

        {/* Right Content / Preview Panel */}
        <div className="bg-bg-surface border border-border-subtle rounded-lg flex flex-col overflow-hidden shadow-sm min-h-0">
          {/* Breadcrumbs & Filter Bar */}
          <div className="px-3.5 py-2 border-b border-border-subtle bg-bg-card/40 flex items-center justify-between flex-wrap gap-2 shrink-0">
            <div className="flex items-center gap-1 text-xs text-text-secondary overflow-x-auto">
              {breadcrumbs.map((segment, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <span className="text-text-muted">/</span>}
                  <button
                    onClick={() => {
                      const fullPath = '/' + breadcrumbs.slice(1, idx + 1).join('/');
                      handleSelectNode({
                        name: segment,
                        path: fullPath === '//' ? '/' : fullPath,
                        is_dir: true,
                        size: 0,
                      });
                    }}
                    className="hover:text-yellow-cream font-mono hover:underline truncate max-w-[120px]"
                  >
                    {segment === '/' ? 'root' : segment}
                  </button>
                </React.Fragment>
              ))}
            </div>

            {selectedNode?.is_dir && (
              <div className="relative">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  placeholder="Filter directory..."
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  className="pl-7 pr-2 py-0.5 text-xs rounded bg-forest-dark border border-border-subtle text-text-primary placeholder:text-text-muted focus:outline-none focus:border-yellow-chartreuse w-36"
                />
              </div>
            )}
          </div>

          {/* Right Panel Body: Either File Preview or Directory Table */}
          <div className="p-3.5 overflow-hidden flex-1 flex flex-col min-h-0">
            {selectedNode && !selectedNode.is_dir ? (
              /* In-App File Previewer Component */
              <FilePreview
                projectId={projectId}
                file={selectedNode}
                onExportClick={() => {
                  setExportTarget(selectedNode);
                  setExportModalOpen(true);
                  setExportMessage(null);
                }}
              />
            ) : (
              /* Directory View Mode */
              <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
                <div className="flex items-center justify-between mb-2 shrink-0">
                  <span className="text-xs font-semibold text-text-secondary">
                    {filteredDirItems.length} item{filteredDirItems.length === 1 ? '' : 's'}
                  </span>
                  {selectedNode && (
                    <button
                      onClick={() => {
                        setExportTarget({
                          name: selectedNode.name,
                          path: selectedNode.path,
                          is_dir: true,
                          size: 0,
                        });
                        setExportModalOpen(true);
                        setExportMessage(null);
                      }}
                      className="px-2.5 py-1 rounded bg-forest-dark text-yellow-cream text-xs font-semibold border border-border-subtle hover:bg-forest-mid flex items-center gap-1.5 cursor-pointer"
                    >
                      <FolderOutput size={12} /> Export Folder
                    </button>
                  )}
                </div>

                {loadingDir ? (
                  <div className="py-20 flex flex-col items-center justify-center gap-2 text-text-muted">
                    <Loader2 size={20} className="animate-spin text-yellow-chartreuse" />
                    <span className="text-xs">Loading contents...</span>
                  </div>
                ) : filteredDirItems.length === 0 ? (
                  <div className="py-16 text-center text-xs text-text-muted italic">
                    This directory is empty or contains no matching items.
                  </div>
                ) : (
                  <div className="border border-border-subtle rounded-lg overflow-auto flex-1">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="sticky top-0 bg-bg-card z-10">
                        <tr className="border-b border-border-subtle text-text-muted uppercase text-[10px] tracking-wider">
                          <th className="p-2.5 font-semibold">Name</th>
                          <th className="p-2.5 font-semibold">Size</th>
                          <th className="p-2.5 font-semibold">Modified</th>
                          <th className="p-2.5 font-semibold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-subtle">
                        {filteredDirItems.map((item) => (
                          <tr
                            key={item.path}
                            onClick={() => handleSelectNode(item)}
                            className="hover:bg-bg-card/70 transition-colors cursor-pointer"
                          >
                            <td className="p-2.5 flex items-center gap-2 font-medium text-text-primary">
                              {getFileIcon(item.is_dir, item.name)}
                              <span className="truncate max-w-[220px] sm:max-w-xs">{item.name}</span>
                            </td>
                            <td className="p-2.5 font-mono text-text-muted">
                              {item.is_dir ? '—' : formatBytes(item.size)}
                            </td>
                            <td className="p-2.5 text-text-muted truncate max-w-[140px]">
                              {item.modified_at ? new Date(item.modified_at).toLocaleDateString() : '—'}
                            </td>
                            <td className="p-2.5 text-right">
                              {!item.is_dir && (
                                <a
                                  href={backupApi.getDownloadUrl(projectId, item.path)}
                                  download={item.name}
                                  onClick={(e) => e.stopPropagation()}
                                  title="Download"
                                  className="p-1 rounded text-text-muted hover:text-yellow-chartreuse transition-colors inline-block"
                                >
                                  <Download size={13} />
                                </a>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Export to Host Modal */}
      {exportModalOpen && exportTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-bg-surface border border-forest-sage rounded-xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-base font-bold text-text-primary">
                <FolderOutput size={18} className="text-yellow-chartreuse" />
                <span>Export to Host</span>
              </div>
              <button
                onClick={() => setExportModalOpen(false)}
                className="text-text-muted hover:text-text-primary cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="text-xs text-text-secondary">
              Exporting: <strong className="text-yellow-cream font-mono">{exportTarget.path}</strong>
            </div>

            <div>
              <label className="text-xs text-text-muted mb-1 block font-medium">
                Host Destination Path:
              </label>
              <input
                type="text"
                value={exportDestPath}
                onChange={(e) => setExportDestPath(e.target.value)}
                placeholder="/path/to/host/folder"
                className="w-full px-3 py-2 text-xs rounded bg-forest-dark border border-border-subtle text-text-primary focus:outline-none focus:border-yellow-chartreuse font-mono"
              />
            </div>

            {exportMessage && (
              <div
                className={`p-3 rounded text-xs flex items-center gap-2 ${
                  exportMessage.success
                    ? 'bg-green-emerald/20 text-yellow-cream border border-green-emerald'
                    : 'bg-red-500/20 text-red-300 border border-red-500'
                }`}
              >
                {exportMessage.success ? <Check size={14} /> : <AlertCircle size={14} />}
                <span>{exportMessage.text}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setExportModalOpen(false)}
                className="px-4 py-2 rounded text-xs font-semibold text-text-muted hover:text-text-primary cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleExecuteExport}
                disabled={exporting || !exportDestPath.trim()}
                className="px-4 py-2 rounded bg-forest-dark text-yellow-cream font-semibold text-xs border border-forest-sage hover:bg-forest-mid transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {exporting ? <Loader2 size={13} className="animate-spin" /> : <FolderOutput size={13} />}
                <span>{exporting ? 'Exporting...' : 'Export'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
