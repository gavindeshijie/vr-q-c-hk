import type { ApiFail, ApiOk, PublicScanRecord, ScanHistoryItem, ScanRecord } from "./types";

export function ok<T>(data: T): ApiOk<T> {
  return { ok: true, data };
}

export function fail(code: string, message: string): ApiFail {
  return { ok: false, error: { code, message } };
}

export function toPublicScan(record: ScanRecord): PublicScanRecord {
  return {
    scanId: record.id,
    mode: record.mode,
    status: record.status,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    device: record.device,
    files: record.files ?? {},
    measurements: record.measurements,
    errorMessage: record.errorMessage
  };
}

export function toHistoryItem(record: ScanRecord): ScanHistoryItem {
  return {
    scanId: record.id,
    mode: record.mode,
    status: record.status,
    createdAt: record.createdAt,
    thumbnailUrl: record.files?.thumbnailUrl
  };
}
