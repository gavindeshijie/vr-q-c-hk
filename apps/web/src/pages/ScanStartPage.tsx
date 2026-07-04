import { useEffect, useMemo, useState } from "react";
import { Camera, ExternalLink, Smartphone } from "lucide-react";
import type { ScanMode } from "@vrqc/shared";
import { LIDAR_COMPATIBILITY_NOTICE } from "@vrqc/shared";
import { detectDevice } from "../scan/device";

export function ScanStartPage() {
  const params = new URLSearchParams(window.location.search);
  const mode = (params.get("mode") ?? "room") as ScanMode;
  const scanId = params.get("scanId") ?? "";
  const appStartUrl = params.get("appStartUrl") ?? "";
  const returnUrl = params.get("returnUrl") ?? (scanId ? `/scan/result/${scanId}` : "/scan");
  const [attempted, setAttempted] = useState(false);
  const device = useMemo(() => detectDevice(), []);

  useEffect(() => {
    if (!appStartUrl) return;
    const timer = window.setTimeout(() => {
      setAttempted(true);
      window.location.href = appStartUrl;
    }, 600);
    return () => window.clearTimeout(timer);
  }, [appStartUrl]);

  return (
    <main className="page narrow">
      <header className="topbar">
        <a className="brand" href="/">VR.q-c.hk</a>
      </header>
      <section className="section-head">
        <p className="eyebrow">{mode === "room" ? "房间扫描" : "物体扫描"}</p>
        <h1>正在打开 iPhone 扫描模块</h1>
        <p>scanId：<code>{scanId}</code></p>
      </section>
      <section className="panel">
        <h2><Smartphone size={22} /> 启动状态</h2>
        <p>{attempted ? "已经尝试通过 Universal Link 打开 VR QC Scanner。" : "即将通过 Universal Link 打开 VR QC Scanner。"}</p>
        {!device.isIOS && <p className="notice">{LIDAR_COMPATIBILITY_NOTICE}</p>}
        <div className="actions">
          <a className="primary-button" href={appStartUrl || "#"}>
            <ExternalLink size={20} />
            再次打开 iOS App / App Clip
          </a>
          <a className="secondary-button" href="/scan/camera"><Camera size={18} /> 打开网页相机备用模式</a>
          <a className="secondary-button" href={returnUrl}>查看结果页</a>
        </div>
      </section>
      <section className="panel">
        <h2>如果没有自动打开</h2>
        <p>请安装 TestFlight 版本或使用 App Clip。App Store ID 和 App Clip Invocation URL 需要在 Apple Developer / App Store Connect 配置后填写。</p>
      </section>
    </main>
  );
}
