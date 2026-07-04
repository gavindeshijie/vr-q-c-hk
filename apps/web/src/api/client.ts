import type {
  ApiResponse,
  CompleteScanRequest,
  CreateScanRequest,
  CreateScanResponse,
  PublicScanRecord,
  ScanHistoryItem
} from "@vrqc/shared";

const configuredBase = import.meta.env.VITE_API_BASE_URL as string | undefined;
export const apiBaseUrl = (configuredBase && configuredBase !== "/") ? configuredBase.replace(/\/$/, "") : "";

async function parseJson<T>(response: Response): Promise<ApiResponse<T>> {
  const payload = (await response.json()) as ApiResponse<T>;
  return payload;
}

export async function createScan(request: CreateScanRequest): Promise<ApiResponse<CreateScanResponse>> {
  const response = await fetch(`${apiBaseUrl}/api/scans`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(request)
  });
  return parseJson<CreateScanResponse>(response);
}

export async function getScan(scanId: string): Promise<ApiResponse<PublicScanRecord>> {
  const response = await fetch(`${apiBaseUrl}/api/scans/${encodeURIComponent(scanId)}`);
  return parseJson<PublicScanRecord>(response);
}

export async function completeScan(scanId: string, uploadToken: string, request: CompleteScanRequest): Promise<ApiResponse<PublicScanRecord>> {
  const response = await fetch(`${apiBaseUrl}/api/scans/${encodeURIComponent(scanId)}/complete`, {
    method: "POST",
    headers: {
      "authorization": `Bearer ${uploadToken}`,
      "content-type": "application/json"
    },
    body: JSON.stringify(request)
  });
  return parseJson<PublicScanRecord>(response);
}

export async function listScans(): Promise<ApiResponse<ScanHistoryItem[]>> {
  const response = await fetch(`${apiBaseUrl}/api/scans`);
  return parseJson<ScanHistoryItem[]>(response);
}
