import type { ScanStatus } from "@vrqc/shared";

const labels: Record<ScanStatus, string> = {
  created: "已创建",
  scanning: "扫描中",
  uploading: "上传中",
  processing: "正在生成 3D 模型",
  ready: "已完成",
  failed: "失败"
};

export function StatusBadge({ status }: { status: ScanStatus }) {
  return <span className={`status status-${status}`}>{labels[status]}</span>;
}
