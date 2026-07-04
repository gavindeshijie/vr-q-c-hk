import { useEffect } from "react";
import { LIDAR_COMPATIBILITY_NOTICE } from "@vrqc/shared";
import { useCameraPreview } from "../hooks/useCameraPreview";

export function CameraFallbackPage() {
  const { videoRef, start, stop, error, isActive } = useCameraPreview();

  useEffect(() => {
    void start();
  }, [start]);

  return (
    <main className="page narrow">
      <header className="topbar">
        <a className="brand" href="/">VR.q-c.hk</a>
        <nav><a href="/scan">返回扫描</a></nav>
      </header>
      <section className="section-head">
        <p className="eyebrow">备用模式</p>
        <h1>网页相机预览</h1>
        <p>{LIDAR_COMPATIBILITY_NOTICE}</p>
      </section>
      <section className="camera-panel">
        <video ref={videoRef} playsInline muted />
        {!isActive && !error && <p className="camera-placeholder">正在请求摄像头权限</p>}
      </section>
      {error && <p className="error">{error}</p>}
      <div className="actions">
        <button className="secondary-button" onClick={() => void start()} type="button">重新打开预览</button>
        <button className="secondary-button" onClick={stop} type="button">停止摄像头</button>
      </div>
    </main>
  );
}
