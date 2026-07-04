import { Camera, Smartphone } from "lucide-react";
import type { ScanMode } from "@vrqc/shared";
import { LIDAR_COMPATIBILITY_NOTICE } from "@vrqc/shared";

export function AppStartPage() {
  const params = new URLSearchParams(window.location.search);
  const mode = (params.get("mode") ?? "room") as ScanMode;
  const scanId = params.get("scanId") ?? "";
  const uploadToken = params.get("uploadToken") ?? "";
  const returnUrl = params.get("returnUrl") ?? `/scan/result/${scanId}`;
  const apiUnavailable = params.get("apiUnavailable") === "1";

  return (
    <main className="page narrow">
      <header className="topbar"><a className="brand" href="/">VR.q-c.hk</a></header>
      <section className="section-head">
        <p className="eyebrow">Universal Link 降级页</p>
        <h1>打开 VR QC Scanner</h1>
        <p>如果 iOS App 或 App Clip 没有接管这个链接，请使用下面的备用入口。</p>
      </section>
      <section className="panel">
        <h2><Smartphone size={22} /> 扫描参数</h2>
        <p>模式：{mode === "room" ? "房间扫描" : "物体扫描"}</p>
        <p>scanId：<code>{scanId}</code></p>
        <p>上传令牌：{uploadToken ? "已生成，只在当前启动链接中使用" : "缺失"}</p>
        {apiUnavailable && <p className="error">当前是本地启动会话。请先部署 Cloudflare Worker API，否则 App 扫描完成后无法上传保存。</p>}
        <p className="notice">{LIDAR_COMPATIBILITY_NOTICE}</p>
        <div className="actions">
          <a className="primary-button" href="/scan"><Camera size={20} /> 返回重新开始</a>
          <a className="secondary-button" href={returnUrl}>查看结果页</a>
          <a className="secondary-button" href="/scan/camera">打开网页相机预览</a>
        </div>
      </section>
    </main>
  );
}
