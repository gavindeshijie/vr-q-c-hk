import { useState } from "react";
import type { ScanMode } from "@vrqc/shared";
import { LIDAR_COMPATIBILITY_NOTICE, PRE_SCAN_GUIDANCE, PRIVACY_NOTICE } from "@vrqc/shared";
import { Camera, CheckCircle2, Cuboid, Home, Smartphone } from "lucide-react";
import { createAndLaunchScan } from "../scan/scanLauncher";
import { detectDevice } from "../scan/device";

export function ScanPage() {
  const [mode, setMode] = useState<ScanMode>("room");
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const device = detectDevice();

  async function start() {
    if (!accepted) {
      setError("请先确认扫描隐私提示。");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await createAndLaunchScan(mode);
    } catch (launchError) {
      setError(launchError instanceof Error ? launchError.message : "创建扫描任务失败。");
      setIsSubmitting(false);
    }
  }

  return (
    <main className="page narrow">
      <header className="topbar">
        <a className="brand" href="/">VR.q-c.hk</a>
        <nav><a href="/scan/history">扫描历史</a></nav>
      </header>

      <section className="section-head">
        <p className="eyebrow">iPhone 原生扫描</p>
        <h1>三维扫描</h1>
        <p>{PRE_SCAN_GUIDANCE}</p>
      </section>

      <section className="mode-grid">
        <button className={`mode-card ${mode === "room" ? "selected" : ""}`} onClick={() => setMode("room")} type="button">
          <Home size={28} />
          <span>房间扫描</span>
          <p>扫描室内空间，生成墙体、地面、门窗和家具的大致 3D 结构。</p>
        </button>
        <button className={`mode-card ${mode === "object" ? "selected" : ""}`} onClick={() => setMode("object")} type="button">
          <Cuboid size={28} />
          <span>物体扫描</span>
          <p>围绕单个物体 360° 扫描，生成物体 3D 模型和估算尺寸。</p>
        </button>
      </section>

      <section className="panel">
        <h2><Smartphone size={22} /> 设备兼容提示</h2>
        <p>{LIDAR_COMPATIBILITY_NOTICE}</p>
        <ul className="check-list">
          <li><CheckCircle2 size={18} /> 房间扫描使用 Apple RoomPlan + ARKit + LiDAR。</li>
          <li><CheckCircle2 size={18} /> 物体扫描使用 RealityKit Object Capture。</li>
          <li><CheckCircle2 size={18} /> Safari 网页相机只作为备用预览，不作为正式高精度扫描。</li>
        </ul>
        <p className="muted">当前识别设备：{device.deviceHint}；HTTPS：{device.isSecureContext ? "可用" : "不可用"}；网页相机：{device.supportsCameraApi ? "支持" : "不支持"}</p>
      </section>

      <section className="panel warning">
        <h2>扫描前提示</h2>
        <p>{PRIVACY_NOTICE}</p>
        <label className="checkbox-line">
          <input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} />
          <span>我已确认不会扫描身份证、银行卡、密码、私人照片等敏感信息。</span>
        </label>
      </section>

      {error && <p className="error">{error}</p>}
      {!accepted && <p className="notice">请先勾选上方隐私确认，再点击开始扫描。</p>}
      <div className="actions">
        <button className="primary-button" onClick={start} disabled={isSubmitting} type="button">
          <Camera size={20} />
          {isSubmitting ? "正在创建扫描任务" : accepted ? "用 iPhone 开始扫描" : "勾选确认后开始扫描"}
        </button>
        <a className="secondary-button" href="/scan/camera">打开网页相机预览</a>
      </div>
    </main>
  );
}
