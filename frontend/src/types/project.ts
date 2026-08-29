export interface ProjectListItem {
  id: string;
  title: string;
  case_number: string;
}

export interface ProjectMetadata {
  id?: string;
  _id?: string;
  title: string;
  examiner_name: string;
  case_number: string;
  contact_number: string;
  organization: string;
  storage_location: string;
  device_serial: string;
  description?: string;
  notes?: string;
  created_at?: string;
}

export interface ProjectMetadataCreate {
  title: string;
  examiner_name: string;
  case_number: string;
  contact_number: string;
  organization: string;
  storage_location: string;
  device_serial: string;
  description?: string;
  notes?: string;
}

export interface DeviceInfo {
  serial: string;
  model: string;
  manufacturer: string;
  android_version: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

