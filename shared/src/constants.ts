export const SITE_URL = "https://vr.q-c.hk";

export const ACCURACY_NOTICE = "尺寸为扫描估算值，装修、施工、采购前请人工复核。";

export const PRIVACY_NOTICE =
  "扫描会使用摄像头和 LiDAR 数据生成 3D 模型。请不要扫描身份证、银行卡、密码、私人照片等敏感信息。";

export const PRE_SCAN_GUIDANCE =
  "请保持光线充足，缓慢移动手机，尽量覆盖所有角度。镜子、玻璃、强反光和过暗区域可能影响结果。";

export const LIDAR_COMPATIBILITY_NOTICE =
  "高精度扫描需要支持 LiDAR 的 iPhone Pro 或 iPad Pro。普通网页相机只能做预览或低精度采集。";

export const SUPPORTED_SCAN_MODES = ["room", "object"] as const;
export const SUPPORTED_SCAN_STATUSES = ["created", "scanning", "uploading", "processing", "ready", "failed"] as const;
