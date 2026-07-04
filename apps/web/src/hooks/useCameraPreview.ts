import { useCallback, useEffect, useRef, useState } from "react";

function formatCameraError(error: unknown): string {
  if (!window.isSecureContext) {
    return "当前页面不是 HTTPS，浏览器不允许打开摄像头。请使用 https://vr.q-c.hk 或本地 localhost。";
  }
  if (!navigator.mediaDevices?.getUserMedia) {
    return "当前浏览器不支持网页相机预览。";
  }
  if (error instanceof DOMException) {
    if (error.name === "NotAllowedError" || error.name === "SecurityError") return "你拒绝了摄像头权限，无法打开预览。";
    if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") return "没有检测到可用摄像头。";
    if (error.name === "NotReadableError" || error.name === "TrackStartError") return "摄像头可能被其他应用占用。";
    if (error.name === "OverconstrainedError") return "当前摄像头不支持请求的分辨率，已无法启动预览。";
  }
  return "摄像头打开失败，请检查浏览器权限和设备状态。";
}

export function useCameraPreview() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);

  const stop = useCallback(() => {
    for (const track of streamRef.current?.getTracks() ?? []) track.stop();
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setIsActive(false);
  }, []);

  const start = useCallback(async () => {
    setError(null);
    stop();
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new DOMException("unsupported", "NotSupportedError");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsActive(true);
    } catch (cameraError) {
      setError(formatCameraError(cameraError));
      stop();
    }
  }, [stop]);

  useEffect(() => stop, [stop]);

  return { videoRef, start, stop, error, isActive };
}
