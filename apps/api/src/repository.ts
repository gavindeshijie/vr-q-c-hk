import type { ScanRecord, ScanStatus } from "@vrqc/shared";
import type { ApiEnv, D1DatabaseLike } from "./env";

export interface ScanRepository {
  create(record: ScanRecord): Promise<ScanRecord>;
  get(id: string): Promise<ScanRecord | null>;
  list(limit: number): Promise<ScanRecord[]>;
  update(id: string, patch: Partial<ScanRecord>): Promise<ScanRecord | null>;
}

const memory = new Map<string, ScanRecord>();

export class MemoryScanRepository implements ScanRepository {
  async create(record: ScanRecord) {
    memory.set(record.id, record);
    return record;
  }

  async get(id: string) {
    return memory.get(id) ?? null;
  }

  async list(limit: number) {
    return [...memory.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, limit);
  }

  async update(id: string, patch: Partial<ScanRecord>) {
    const existing = memory.get(id);
    if (!existing) return null;
    const next: ScanRecord = {
      ...existing,
      ...patch,
      files: patch.files ?? existing.files,
      measurements: patch.measurements ?? existing.measurements,
      device: patch.device ?? existing.device,
      status: patch.status ?? existing.status,
      updatedAt: new Date().toISOString()
    };
    memory.set(id, next);
    return next;
  }
}

export class D1ScanRepository implements ScanRepository {
  constructor(private readonly db: D1DatabaseLike) {}

  async create(record: ScanRecord) {
    await this.db.prepare(
      "insert into scans (id, mode, status, created_at, updated_at, upload_token_hash, return_url, payload_json) values (?, ?, ?, ?, ?, ?, ?, ?)"
    ).bind(record.id, record.mode, record.status, record.createdAt, record.updatedAt, record.uploadTokenHash, record.returnUrl, JSON.stringify(record)).run();
    return record;
  }

  async get(id: string) {
    const row = await this.db.prepare("select payload_json from scans where id = ?").bind(id).first<{ payload_json: string }>();
    return row ? (JSON.parse(row.payload_json) as ScanRecord) : null;
  }

  async list(limit: number) {
    const { results } = await this.db.prepare("select payload_json from scans order by created_at desc limit ?").bind(limit).all<{ payload_json: string }>();
    return results.map((row) => JSON.parse(row.payload_json) as ScanRecord);
  }

  async update(id: string, patch: Partial<ScanRecord>) {
    const existing = await this.get(id);
    if (!existing) return null;
    const next: ScanRecord = {
      ...existing,
      ...patch,
      files: patch.files ?? existing.files,
      measurements: patch.measurements ?? existing.measurements,
      device: patch.device ?? existing.device,
      status: (patch.status ?? existing.status) as ScanStatus,
      updatedAt: new Date().toISOString()
    };
    await this.db.prepare("update scans set status = ?, updated_at = ?, payload_json = ? where id = ?")
      .bind(next.status, next.updatedAt, JSON.stringify(next), id)
      .run();
    return next;
  }
}

export function createRepository(env: ApiEnv): ScanRepository {
  if (env.DB) return new D1ScanRepository(env.DB);
  return new MemoryScanRepository();
}
