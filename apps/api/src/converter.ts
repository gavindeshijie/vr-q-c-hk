import type { ApiEnv } from "./env";

export interface ConversionResult {
  glbUrl: string | null;
  skippedReason?: string;
}

export interface ModelConverter {
  convertUsdzToGlb(scanId: string, usdzUrl: string): Promise<ConversionResult>;
}

export class NoopModelConverter implements ModelConverter {
  async convertUsdzToGlb(): Promise<ConversionResult> {
    return { glbUrl: null, skippedReason: "未配置 USDZ_CONVERTER_ENDPOINT，已跳过 GLB 转换。" };
  }
}

export class HttpModelConverter implements ModelConverter {
  constructor(private readonly endpoint: string) {}

  async convertUsdzToGlb(scanId: string, usdzUrl: string): Promise<ConversionResult> {
    const response = await fetch(this.endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ scanId, usdzUrl })
    });
    if (!response.ok) throw new Error("USDZ 转 GLB 服务调用失败。");
    const payload = (await response.json()) as { glbUrl?: string | null };
    return { glbUrl: payload.glbUrl ?? null };
  }
}

export function createModelConverter(env: ApiEnv): ModelConverter {
  return env.USDZ_CONVERTER_ENDPOINT ? new HttpModelConverter(env.USDZ_CONVERTER_ENDPOINT) : new NoopModelConverter();
}
