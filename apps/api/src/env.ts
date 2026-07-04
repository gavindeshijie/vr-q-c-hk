export interface D1DatabaseLike {
  prepare(query: string): {
    bind(...values: unknown[]): {
      first<T = unknown>(): Promise<T | null>;
      all<T = unknown>(): Promise<{ results: T[] }>;
      run(): Promise<unknown>;
    };
  };
}

export interface R2BucketLike {
  put(key: string, value: ReadableStream | ArrayBuffer | string, options?: { httpMetadata?: { contentType?: string } }): Promise<unknown>;
}

export interface ApiEnv {
  PUBLIC_SITE_URL?: string;
  STORAGE_PROVIDER?: "r2" | "supabase" | "local";
  R2_PUBLIC_BASE_URL?: string;
  DATABASE_URL?: string;
  USDZ_CONVERTER_ENDPOINT?: string;
  MAX_USDZ_MB?: string;
  MAX_IMAGES_ZIP_MB?: string;
  DB?: D1DatabaseLike;
  SCANS_BUCKET?: R2BucketLike;
}
