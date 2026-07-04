import type { CreateScanResponse, ScanMode } from "@vrqc/shared";
import { createScan } from "../api/client";
import { detectDevice } from "./device";
import { rememberScan } from "./history";

export interface LaunchResult {
  created: CreateScanResponse;
  deviceHint: string;
  isLikelyNativeSupported: boolean;
}

export async function createAndLaunchScan(mode: ScanMode): Promise<LaunchResult> {
  const device = detectDevice();
  const response = await createScan({
    mode,
    source: "web",
    deviceHint: device.deviceHint,
    userId: null
  });

  const created = response.ok ? response.data : createLocalFallbackScan(mode, response.error.message);

  rememberScan({
    scanId: created.scanId,
    mode,
    status: created.status,
    createdAt: new Date().toISOString()
  });

  const fallback = response.ok ? "" : "&apiUnavailable=1";
  window.location.assign(`/scan/start?mode=${encodeURIComponent(mode)}&scanId=${encodeURIComponent(created.scanId)}&uploadToken=${encodeURIComponent(created.uploadToken)}&appStartUrl=${encodeURIComponent(created.appStartUrl)}&returnUrl=${encodeURIComponent(created.returnUrl)}${fallback}`);

  return {
    created,
    deviceHint: device.deviceHint,
    isLikelyNativeSupported: device.isIOS
  };
}

function createLocalFallbackScan(mode: ScanMode, reason: string): CreateScanResponse {
  const random = crypto.getRandomValues(new Uint32Array(2));
  const [scanSeed = Date.now(), tokenSeed = Date.now() + 1] = random;
  const scanId = `scan_local_${Date.now().toString(36)}_${scanSeed.toString(36)}`;
  const uploadToken = `local_token_${tokenSeed.toString(36)}`;
  const returnUrl = `${window.location.origin}/scan/result/${scanId}`;
  const appStartUrl = `${window.location.origin}/scan/app/start?mode=${encodeURIComponent(mode)}&scanId=${encodeURIComponent(scanId)}&uploadToken=${encodeURIComponent(uploadToken)}&returnUrl=${encodeURIComponent(returnUrl)}&apiUnavailable=1&reason=${encodeURIComponent(reason)}`;
  return {
    scanId,
    status: "created",
    uploadToken,
    appStartUrl,
    returnUrl
  };
}
