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

async function requestJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(input, init);
    return parseJson<T>(response);
  } catch {
    return {
      ok: false,
      error: {
        code: "API_UNREACHABLE",
        message: "扫描 API 当前无法连接。请先部署 Cloudflare Worker API，或检查 api.vr.q-c.hk 域名。"
      }
    };
  }
}

async function parseJson<T>(response: Response): Promise<ApiResponse<T>> {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return {
      ok: false,
      error: {
        code: response.status === 404 || response.status === 405 ? "API_NOT_DEPLOYED" : "BAD_RESPONSE",
        message: "扫描 API 当前不可用。GitHub Pages 不能运行 /api/scans，请先部署 Cloudflare Worker API。"
      }
    };
  }

  try {
    const payload = (await response.json()) as ApiResponse<T>;
    return payload;
  } catch {
    return {
      ok: false,
      error: {
        code: "BAD_RESPONSE",
        message: "扫描 API 返回格式不正确，请检查后端部署。"
      }
    };
  }
}

export async function createScan(request: CreateScanRequest): Promise<ApiResponse<CreateScanResponse>> {
  return requestJson<CreateScanResponse>(`${apiBaseUrl}/api/scans`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(request)
  });
}

export async function getScan(scanId: string): Promise<ApiResponse<PublicScanRecord>> {
  return requestJson<PublicScanRecord>(`${apiBaseUrl}/api/scans/${encodeURIComponent(scanId)}`);
}

export async function completeScan(scanId: string, uploadToken: string, request: CompleteScanRequest): Promise<ApiResponse<PublicScanRecord>> {
  return requestJson<PublicScanRecord>(`${apiBaseUrl}/api/scans/${encodeURIComponent(scanId)}/complete`, {
    method: "POST",
    headers: {
      "authorization": `Bearer ${uploadToken}`,
      "content-type": "application/json"
    },
    body: JSON.stringify(request)
  });
}

export async function listScans(): Promise<ApiResponse<ScanHistoryItem[]>> {
  return requestJson<ScanHistoryItem[]>(`${apiBaseUrl}/api/scans`);
}
