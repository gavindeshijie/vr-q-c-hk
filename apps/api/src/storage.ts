import type { ApiEnv, R2BucketLike } from "./env";

export interface StoredFile {
  key: string;
  url: string;
  size: number;
  contentType: string;
}

export interface StorageAdapter {
  put(key: string, file: File): Promise<StoredFile>;
}

export class R2StorageAdapter implements StorageAdapter {
  constructor(private readonly bucket: R2BucketLike, private readonly publicBaseUrl: string) {}

  async put(key: string, file: File): Promise<StoredFile> {
    await this.bucket.put(key, file.stream(), { httpMetadata: { contentType: file.type || "application/octet-stream" } });
    return {
      key,
      url: `${this.publicBaseUrl.replace(/\/$/, "")}/${encodeURIComponent(key).replaceAll("%2F", "/")}`,
      size: file.size,
      contentType: file.type || "application/octet-stream"
    };
  }
}

export class LocalPlaceholderStorageAdapter implements StorageAdapter {
  async put(key: string, file: File): Promise<StoredFile> {
    return {
      key,
      url: `/api/local-files/${encodeURIComponent(key)}`,
      size: file.size,
      contentType: file.type || "application/octet-stream"
    };
  }
}

export function createStorage(env: ApiEnv): StorageAdapter {
  if (env.STORAGE_PROVIDER === "r2" && env.SCANS_BUCKET && env.R2_PUBLIC_BASE_URL) {
    return new R2StorageAdapter(env.SCANS_BUCKET, env.R2_PUBLIC_BASE_URL);
  }
  return new LocalPlaceholderStorageAdapter();
}
