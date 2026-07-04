import type { ScanHistoryItem } from "@vrqc/shared";

const KEY = "vrqc.scan.history";

export function readLocalHistory(): ScanHistoryItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ScanHistoryItem[]) : [];
  } catch {
    return [];
  }
}

export function rememberScan(item: ScanHistoryItem) {
  const next = [item, ...readLocalHistory().filter((existing) => existing.scanId !== item.scanId)].slice(0, 30);
  localStorage.setItem(KEY, JSON.stringify(next));
}
