export interface BackupFileItem {
  name: string;
  path: string;
  is_dir: boolean;
  size: number;
  modified_at?: string | null;
  sha256?: string | null;
  extension?: string | null;
}

export interface FileListResponseData {
  project_id: string;
  current_path: string;
  items: BackupFileItem[];
}

export interface BackupMetadata {
  _id?: string;
  project_id: string;
  device_serial?: string;
  file_path: string;
  extracted_path: string;
  file_size: number;
  storage_location: string;
  command?: string;
  created_at: string;
  status: 'completed' | 'failed' | 'pending';
  error?: string | null;
}

export interface ExportResponseData {
  source_path: string;
  destination_path: string;
  exported_size: number;
}
