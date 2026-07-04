export type ScanMode = "room" | "object";
export type ScanStatus = "created" | "scanning" | "uploading" | "processing" | "ready" | "failed";
export type ScanSource = "web" | "ios" | "app_clip";

export type ApiErrorCode =
  | "BAD_REQUEST"
  | "NOT_FOUND"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "METHOD_NOT_ALLOWED"
  | "PAYLOAD_TOO_LARGE"
  | "UNSUPPORTED_MEDIA_TYPE"
  | "CONVERSION_SKIPPED"
  | "INTERNAL_ERROR";

export interface ApiError {
  code: ApiErrorCode | string;
  message: string;
}

export interface ApiOk<T> {
  ok: true;
  data: T;
}

export interface ApiFail {
  ok: false;
  error: ApiError;
}

export type ApiResponse<T> = ApiOk<T> | ApiFail;

export interface ScanDeviceInfo {
  platform: "iOS" | "iPadOS" | "Web" | "Unknown";
  model?: string;
  osVersion?: string;
  hasLiDAR?: boolean;
}

export interface ScanFiles {
  usdzUrl?: string;
  glbUrl?: string | null;
  thumbnailUrl?: string;
  rawJsonUrl?: string;
  imagesZipUrl?: string;
}

export interface ScanMeasurements {
  unit: "m";
  accuracyNotice: string;
  room?: {
    approxAreaSqm?: number;
    approxPerimeterM?: number;
    approxCeilingHeightM?: number;
    widthM?: number;
    depthM?: number;
    heightM?: number;
  } | null;
  object?: {
    widthM?: number;
    heightM?: number;
    depthM?: number;
    volumeCbm?: number;
  } | null;
  surfaces?: Array<{
    id: string;
    type: "wall" | "floor" | "ceiling";
    widthM?: number;
    heightM?: number;
    areaSqm?: number;
    confidence?: "low" | "medium" | "high";
    transform?: number[];
  }>;
  openings?: Array<{
    id: string;
    type: "door" | "window" | "opening";
    widthM?: number;
    heightM?: number;
    confidence?: "low" | "medium" | "high";
    transform?: number[];
  }>;
  objects?: Array<{
    id: string;
    category: string;
    widthM?: number;
    heightM?: number;
    depthM?: number;
    confidence?: "low" | "medium" | "high";
    transform?: number[];
  }>;
}

export interface ScanRecord {
  id: string;
  mode: ScanMode;
  status: ScanStatus;
  createdAt: string;
  updatedAt: string;
  uploadTokenHash: string;
  returnUrl: string;
  device?: ScanDeviceInfo;
  files?: ScanFiles;
  measurements?: ScanMeasurements;
  errorMessage?: string;
}

export interface CreateScanRequest {
  mode: ScanMode;
  source: ScanSource;
  deviceHint?: string;
  userId?: string | null;
}

export interface CreateScanResponse {
  scanId: string;
  status: ScanStatus;
  uploadToken: string;
  appStartUrl: string;
  returnUrl: string;
}

export interface PublicScanRecord {
  scanId: string;
  mode: ScanMode;
  status: ScanStatus;
  createdAt: string;
  updatedAt: string;
  device?: ScanDeviceInfo;
  files: ScanFiles;
  measurements?: ScanMeasurements;
  errorMessage?: string;
}

export interface CompleteScanRequest {
  status: Extract<ScanStatus, "ready" | "failed" | "processing">;
  files?: ScanFiles;
  measurements?: ScanMeasurements;
  device?: ScanDeviceInfo;
  errorMessage?: string;
}

export interface ScanHistoryItem {
  scanId: string;
  mode: ScanMode;
  status: ScanStatus;
  createdAt: string;
  thumbnailUrl?: string;
}
