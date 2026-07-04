export interface DeviceDetection {
  isIOS: boolean;
  isIPadOS: boolean;
  isIPhone: boolean;
  isSafari: boolean;
  isSecureContext: boolean;
  supportsCameraApi: boolean;
  deviceHint: string;
}

export function detectDevice(): DeviceDetection {
  const ua = navigator.userAgent;
  const platform = navigator.platform;
  const maxTouchPoints = navigator.maxTouchPoints ?? 0;
  const isIPadOS = platform === "MacIntel" && maxTouchPoints > 1;
  const isIPhone = /iPhone/i.test(ua);
  const isIOS = isIPhone || /iPad|iPod/i.test(ua) || isIPadOS;
  const isSafari = /^((?!chrome|android|crios|fxios).)*safari/i.test(ua);
  return {
    isIOS,
    isIPadOS,
    isIPhone,
    isSafari,
    isSecureContext: window.isSecureContext,
    supportsCameraApi: Boolean(navigator.mediaDevices?.getUserMedia),
    deviceHint: isIPhone ? "iPhone" : isIPadOS ? "iPadOS" : isIOS ? "iOS" : "Web"
  };
}
