import { Suspense, lazy, useEffect, useState } from "react";
import type { PublicScanRecord } from "@vrqc/shared";
import { Download, RefreshCw, RotateCcw } from "lucide-react";
import { getScan } from "../api/client";
import { MeasurementPanel } from "../components/MeasurementPanel";
import { StatusBadge } from "../components/StatusBadge";
import { rememberScan } from "../scan/history";

const ModelViewer = lazy(() =>
  import("../components/ModelViewer").then((module) => ({ default: module.ModelViewer }))
);

export function ResultPage({ scanId }: { scanId: string }) {
  const [scan, setScan] = useState<PublicScanRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;

    async function load() {
      const response = await getScan(scanId);
      if (cancelled) return;
      if (response.ok) {
        setScan(response.data);
        rememberScan({
          scanId: response.data.scanId,
          mode: response.data.mode,
          status: response.data.status,
          createdAt: response.data.createdAt,
          thumbnailUrl: response.data.files.thumbnailUrl
        });
        if (!["ready", "failed"].includes(response.data.status)) {
          timer = window.setTimeout(load, 3000);
        }
      } else {
        setError(response.error.message);
      }
    }

    void load();
    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [scanId]);

  return (
    <main className="page">
      <header className="topbar">
        <a className="brand" href="/">VR.q-c.hk</a>
        <nav><a href="/scan/history">扫描历史</a></nav>
      </header>

      <section className="section-head">
        <p className="eyebrow">扫描结果</p>
        <h1>扫描结果</h1>
        <p>scanId：<code>{scanId}</code></p>
      </section>

      {error && <p className="error">{error}</p>}
      {scanId.startsWith("scan_local_") && (
        <p className="error">这是 API 未部署时创建的本地启动会话，服务器没有扫描记录。请部署 Cloudflare Worker API 后重新扫描上传。</p>
      )}
      {!scan && !error && <p className="muted">正在读取扫描任务</p>}

      {scan && (
        <>
          <section className="result-layout">
            <div className="panel model-panel">
              <div className="result-title-row">
                <div>
                  <h2>{scan.mode === "room" ? "房间模型" : "物体模型"}</h2>
                  <StatusBadge status={scan.status} />
                </div>
                <button className="icon-button" onClick={() => window.location.reload()} type="button" title="刷新状态">
                  <RefreshCw size={18} />
                </button>
              </div>
              {scan.files.thumbnailUrl && <img className="thumb-large" src={scan.files.thumbnailUrl} alt="扫描缩略图" />}
              {scan.status !== "ready" ? (
                <div className="model-empty"><p>{scan.status === "processing" ? "正在生成 3D 模型" : "等待 iPhone 上传扫描结果"}</p></div>
              ) : (
                <Suspense fallback={<div className="model-empty"><p>正在加载 3D 预览组件</p></div>}>
                  <ModelViewer glbUrl={scan.files.glbUrl} />
                </Suspense>
              )}
              <div className="actions">
                {scan.files.usdzUrl && <a className="primary-button" href={scan.files.usdzUrl} rel="ar"><Download size={18} /> 用 AR Quick Look 打开 / 下载 USDZ</a>}
                {scan.files.glbUrl && <a className="secondary-button" href={scan.files.glbUrl} download><Download size={18} /> 下载 GLB</a>}
                <a className="secondary-button" href="/scan"><RotateCcw size={18} /> 重新扫描</a>
              </div>
              {!scan.files.glbUrl && scan.status === "ready" && <p className="notice">只有 USDZ：iPhone/iPad 可用 AR Quick Look 打开；桌面端请下载 USDZ 或等待 GLB 转换。</p>}
            </div>
            <MeasurementPanel mode={scan.mode} measurements={scan.measurements} />
          </section>
        </>
      )}
    </main>
  );
}
