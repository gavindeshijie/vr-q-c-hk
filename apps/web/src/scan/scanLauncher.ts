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

  if (!response.ok) {
    throw new Error(response.error.message);
  }

  rememberScan({
    scanId: response.data.scanId,
    mode,
    status: response.data.status,
    createdAt: new Date().toISOString()
  });

  window.location.assign(`/scan/start?mode=${encodeURIComponent(mode)}&scanId=${encodeURIComponent(response.data.scanId)}&uploadToken=${encodeURIComponent(response.data.uploadToken)}&appStartUrl=${encodeURIComponent(response.data.appStartUrl)}&returnUrl=${encodeURIComponent(response.data.returnUrl)}`);

  return {
    created: response.data,
    deviceHint: device.deviceHint,
    isLikelyNativeSupported: device.isIOS
  };
}
