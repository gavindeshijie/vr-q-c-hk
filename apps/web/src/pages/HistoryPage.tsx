import { useEffect, useState } from "react";
import type { ScanHistoryItem } from "@vrqc/shared";
import { StatusBadge } from "../components/StatusBadge";
import { listScans } from "../api/client";
import { readLocalHistory } from "../scan/history";

export function HistoryPage() {
  const [items, setItems] = useState<ScanHistoryItem[]>(readLocalHistory());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listScans().then((response) => {
      if (response.ok) setItems(response.data);
      else setError(response.error.message);
    }).catch(() => setError("API 历史记录暂不可用，已显示本地记录。"));
  }, []);

  return (
    <main className="page narrow">
      <header className="topbar">
        <a className="brand" href="/">VR.q-c.hk</a>
        <nav><a href="/scan">开始扫描</a></nav>
      </header>
      <section className="section-head">
        <p className="eyebrow">最近记录</p>
        <h1>扫描历史</h1>
      </section>
      {error && <p className="notice">{error}</p>}
      <section className="history-list">
        {items.map((item) => (
          <a className="history-item" key={item.scanId} href={`/scan/result/${item.scanId}`}>
            {item.thumbnailUrl ? <img src={item.thumbnailUrl} alt="扫描缩略图" /> : <span className="thumb-placeholder" />}
            <div>
              <b>{item.mode === "room" ? "房间扫描" : "物体扫描"}</b>
              <span>{new Date(item.createdAt).toLocaleString("zh-CN")}</span>
            </div>
            <StatusBadge status={item.status} />
          </a>
        ))}
        {items.length === 0 && <p className="muted">暂无扫描记录。</p>}
      </section>
    </main>
  );
}
