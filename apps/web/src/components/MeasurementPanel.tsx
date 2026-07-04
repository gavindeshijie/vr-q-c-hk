import type { ScanMeasurements, ScanMode } from "@vrqc/shared";
import { Disclaimer } from "./Disclaimer";

function n(value?: number, suffix = "m") {
  return typeof value === "number" ? `${value.toFixed(2)} ${suffix}` : "暂无";
}

function confidence(value?: "low" | "medium" | "high") {
  if (value === "high") return "高";
  if (value === "medium") return "中";
  if (value === "low") return "低";
  return "未标注";
}

export function MeasurementPanel({ mode, measurements }: { mode: ScanMode; measurements?: ScanMeasurements }) {
  if (!measurements) {
    return (
      <section className="panel">
        <h2>尺寸信息</h2>
        <p className="muted">扫描完成后会显示模型尺寸、墙体、门窗和识别物体。</p>
        <Disclaimer />
      </section>
    );
  }

  const doorCount = measurements.openings?.filter((item) => item.type === "door").length ?? 0;
  const windowCount = measurements.openings?.filter((item) => item.type === "window").length ?? 0;
  const openingCount = measurements.openings?.filter((item) => item.type === "opening").length ?? 0;
  const wallCount = measurements.surfaces?.filter((item) => item.type === "wall").length ?? 0;

  return (
    <section className="panel">
      <h2>尺寸信息</h2>
      {mode === "room" ? (
        <div className="metric-grid">
          <div><b>{measurements.room?.approxAreaSqm?.toFixed(2) ?? "暂无"}</b><span>估算面积 m²</span></div>
          <div><b>{wallCount}</b><span>墙体数量</span></div>
          <div><b>{doorCount}</b><span>门数量</span></div>
          <div><b>{windowCount}</b><span>窗数量</span></div>
          <div><b>{openingCount}</b><span>开口数量</span></div>
          <div><b>{measurements.objects?.length ?? 0}</b><span>识别物体</span></div>
          <div><b>{n(measurements.room?.approxCeilingHeightM)}</b><span>天花高度</span></div>
        </div>
      ) : (
        <div className="metric-grid">
          <div><b>{n(measurements.object?.widthM)}</b><span>宽</span></div>
          <div><b>{n(measurements.object?.heightM)}</b><span>高</span></div>
          <div><b>{n(measurements.object?.depthM)}</b><span>深</span></div>
          <div><b>{n(measurements.object?.volumeCbm, "m³")}</b><span>体积估算</span></div>
        </div>
      )}

      <Disclaimer />

      <div className="table-wrap">
        <h3>房间结构列表</h3>
        <table>
          <thead>
            <tr><th>类型</th><th>尺寸</th><th>面积</th><th>置信度</th></tr>
          </thead>
          <tbody>
            {(measurements.surfaces ?? []).map((surface) => (
              <tr key={surface.id}>
                <td>{surface.type}</td>
                <td>{n(surface.widthM)} x {n(surface.heightM)}</td>
                <td>{n(surface.areaSqm, "m²")}</td>
                <td>{confidence(surface.confidence)}</td>
              </tr>
            ))}
            {(measurements.surfaces?.length ?? 0) === 0 && <tr><td colSpan={4}>暂无结构数据</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="table-wrap">
        <h3>门窗 / 开口</h3>
        <table>
          <thead>
            <tr><th>类型</th><th>尺寸</th><th>置信度</th></tr>
          </thead>
          <tbody>
            {(measurements.openings ?? []).map((opening) => (
              <tr key={opening.id}>
                <td>{opening.type}</td>
                <td>{n(opening.widthM)} x {n(opening.heightM)}</td>
                <td>{confidence(opening.confidence)}</td>
              </tr>
            ))}
            {(measurements.openings?.length ?? 0) === 0 && <tr><td colSpan={3}>暂无门窗数据</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="table-wrap">
        <h3>识别到的家具 / 物体</h3>
        <table>
          <thead>
            <tr><th>类型</th><th>尺寸</th><th>置信度</th></tr>
          </thead>
          <tbody>
            {(measurements.objects ?? []).map((object) => (
              <tr key={object.id}>
                <td>{object.category}</td>
                <td>{n(object.widthM)} x {n(object.heightM)} x {n(object.depthM)}</td>
                <td>{confidence(object.confidence)}</td>
              </tr>
            ))}
            {(measurements.objects?.length ?? 0) === 0 && <tr><td colSpan={3}>暂无物体数据</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}
