import { ACCURACY_NOTICE, toHistoryItem, toPublicScan } from "@vrqc/shared";
import type { CompleteScanRequest, CreateScanRequest, ScanFiles, ScanMeasurements, ScanMode } from "@vrqc/shared";
import { createModelConverter } from "./converter";
import type { ApiEnv } from "./env";
import { corsHeaders, errorJson, json, noStore } from "./http";
import { createRepository } from "./repository";
import { generateId, getBearerToken, sha256Hex, verifyUploadToken } from "./security";
import { createStorage } from "./storage";
import { isScanMode, validateFile } from "./validation";

const SITE_FALLBACK = "https://vr.q-c.hk";

function siteUrl(env: ApiEnv): string {
  return (env.PUBLIC_SITE_URL || SITE_FALLBACK).replace(/\/$/, "");
}

function parsePath(request: Request) {
  const url = new URL(request.url);
  const parts = url.pathname.split("/").filter(Boolean);
  return { url, parts };
}

async function readJson<T>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}

function defaultMeasurements(mode: ScanMode): ScanMeasurements {
  return {
    unit: "m",
    accuracyNotice: ACCURACY_NOTICE,
    room: mode === "room" ? {} : null,
    object: mode === "object" ? {} : null,
    surfaces: [],
    openings: [],
    objects: []
  };
}

export default {
  async fetch(request: Request, env: ApiEnv): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(request) });
    }

    try {
      const { url, parts } = parsePath(request);
      if (parts[0] !== "api" || parts[1] !== "scans") {
        return errorJson(request, 404, "NOT_FOUND", "接口不存在。");
      }

      const repository = createRepository(env);
      const storage = createStorage(env);
      const converter = createModelConverter(env);

      if (request.method === "GET" && parts.length === 2) {
        const scans = await repository.list(50);
        return noStore(json(request, scans.map(toHistoryItem)));
      }

      if (request.method === "POST" && parts.length === 2) {
        const body = await readJson<CreateScanRequest>(request);
        if (!body || !isScanMode(body.mode)) return errorJson(request, 400, "BAD_REQUEST", "扫描模式不正确。");
        const scanId = generateId("scan");
        const uploadToken = generateId("token");
        const returnUrl = `${siteUrl(env)}/scan/result/${scanId}`;
        const appStartUrl = `${siteUrl(env)}/scan/app/start?mode=${encodeURIComponent(body.mode)}&scanId=${encodeURIComponent(scanId)}&uploadToken=${encodeURIComponent(uploadToken)}&returnUrl=${encodeURIComponent(returnUrl)}`;
        const now = new Date().toISOString();
        await repository.create({
          id: scanId,
          mode: body.mode,
          status: "created",
          createdAt: now,
          updatedAt: now,
          uploadTokenHash: await sha256Hex(uploadToken),
          returnUrl,
          device: {
            platform: body.deviceHint?.includes("iPhone") ? "iOS" : body.deviceHint?.includes("iPad") ? "iPadOS" : "Web",
            model: body.deviceHint,
            hasLiDAR: body.deviceHint?.includes("iPhone") || body.deviceHint?.includes("iPad")
          },
          files: {},
          measurements: defaultMeasurements(body.mode)
        });
        return json(request, { scanId, status: "created", uploadToken, appStartUrl, returnUrl }, { status: 201 });
      }

      const scanId = parts[2];
      if (!scanId) return errorJson(request, 404, "NOT_FOUND", "扫描任务不存在。");
      const existing = await repository.get(scanId);
      if (!existing) return errorJson(request, 404, "NOT_FOUND", "扫描任务不存在。");

      if (request.method === "GET" && parts.length === 3) {
        return noStore(json(request, toPublicScan(existing)));
      }

      if (request.method === "POST" && parts[3] === "upload") {
        if (!(await verifyUploadToken(getBearerToken(request), existing.uploadTokenHash))) {
          return errorJson(request, 401, "UNAUTHORIZED", "上传令牌无效。");
        }
        const form = await request.formData();
        const mode = form.get("mode");
        if (!isScanMode(mode)) return errorJson(request, 400, "BAD_REQUEST", "上传的扫描模式不正确。");
        const modelUsdz = form.get("modelUsdz");
        if (!(modelUsdz instanceof File)) return errorJson(request, 400, "BAD_REQUEST", "必须上传 USDZ 模型文件。");

        const fileFields = ["modelUsdz", "measurementsJson", "roomJson", "thumbnail", "imagesZip"] as const;
        const files: ScanFiles = { ...existing.files };
        for (const field of fileFields) {
          const value = form.get(field);
          if (!(value instanceof File)) continue;
          const fileError = validateFile(field, value, env);
          if (fileError) return errorJson(request, fileError.includes("大小") ? 413 : 415, fileError.includes("大小") ? "PAYLOAD_TOO_LARGE" : "UNSUPPORTED_MEDIA_TYPE", fileError);
          const stored = await storage.put(`${scanId}/${field}/${value.name || field}`, value);
          if (field === "modelUsdz") files.usdzUrl = stored.url;
          if (field === "thumbnail") files.thumbnailUrl = stored.url;
          if (field === "roomJson" || field === "measurementsJson") files.rawJsonUrl = stored.url;
          if (field === "imagesZip") files.imagesZipUrl = stored.url;
        }

        let measurements = existing.measurements;
        const measurementsJson = form.get("measurementsJson");
        if (measurementsJson instanceof File) {
          try {
            measurements = JSON.parse(await measurementsJson.text()) as ScanMeasurements;
          } catch {
            return errorJson(request, 400, "BAD_REQUEST", "measurementsJson 格式不正确。");
          }
        }

        const deviceInfo = form.get("deviceInfo");
        const updated = await repository.update(scanId, {
          status: "processing",
          files,
          measurements,
          device: typeof deviceInfo === "string" ? { ...existing.device, model: deviceInfo, platform: existing.device?.platform ?? "iOS" } : existing.device
        });
        return json(request, { scanId, status: updated?.status ?? "processing" });
      }

      if (request.method === "POST" && parts[3] === "complete") {
        if (!(await verifyUploadToken(getBearerToken(request), existing.uploadTokenHash))) {
          return errorJson(request, 401, "UNAUTHORIZED", "上传令牌无效。");
        }
        const body = await readJson<CompleteScanRequest>(request);
        if (!body || !["ready", "failed", "processing"].includes(body.status)) {
          return errorJson(request, 400, "BAD_REQUEST", "完成状态不正确。");
        }
        const updated = await repository.update(scanId, {
          status: body.status,
          files: { ...existing.files, ...body.files },
          measurements: body.measurements ?? existing.measurements,
          device: body.device ?? existing.device,
          errorMessage: body.errorMessage
        });
        return json(request, toPublicScan(updated!));
      }

      if (request.method === "POST" && parts[3] === "convert") {
        if (!existing.files?.usdzUrl) return errorJson(request, 400, "BAD_REQUEST", "没有可转换的 USDZ 文件。");
        const result = await converter.convertUsdzToGlb(scanId, existing.files.usdzUrl);
        const updated = await repository.update(scanId, {
          files: { ...existing.files, glbUrl: result.glbUrl },
          status: result.glbUrl ? "ready" : existing.status
        });
        return json(request, { scanId, glbUrl: result.glbUrl, skippedReason: result.skippedReason, record: toPublicScan(updated!) });
      }

      return errorJson(request, 405, "METHOD_NOT_ALLOWED", "请求方法不支持。");
    } catch (error) {
      console.error("scan api error", error instanceof Error ? error.message : "unknown");
      return errorJson(request, 500, "INTERNAL_ERROR", "服务器处理失败。");
    }
  }
};
