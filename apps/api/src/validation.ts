import { SUPPORTED_SCAN_MODES } from "@vrqc/shared";
import type { ScanMode } from "@vrqc/shared";
import type { ApiEnv } from "./env";

export function isScanMode(value: unknown): value is ScanMode {
  return typeof value === "string" && (SUPPORTED_SCAN_MODES as readonly string[]).includes(value);
}

const allowedUploadTypes = new Map<string, string[]>([
  ["modelUsdz", ["model/vnd.usdz+zip", "application/octet-stream", "model/usd", "application/zip", ""]],
  ["measurementsJson", ["application/json", "text/json", ""]],
  ["roomJson", ["application/json", "text/json", ""]],
  ["thumbnail", ["image/jpeg", "image/png", ""]],
  ["imagesZip", ["application/zip", "application/x-zip-compressed", ""]]
]);

function mb(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function maxBytesFor(fieldName: string, env: ApiEnv): number {
  if (fieldName === "modelUsdz") return mb(env.MAX_USDZ_MB, 500) * 1024 * 1024;
  if (fieldName === "imagesZip") return mb(env.MAX_IMAGES_ZIP_MB, 1024) * 1024 * 1024;
  return 20 * 1024 * 1024;
}

export function validateFile(fieldName: string, file: File, env: ApiEnv): string | null {
  const allowed = allowedUploadTypes.get(fieldName);
  if (!allowed) return "不支持的上传字段。";
  if (!allowed.includes(file.type)) return `${fieldName} 文件类型不支持。`;
  if (file.size > maxBytesFor(fieldName, env)) return `${fieldName} 文件超过大小限制。`;
  return null;
}
