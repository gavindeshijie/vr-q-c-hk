import { fail, ok } from "@vrqc/shared";

const allowedOrigins = new Set([
  "https://vr.q-c.hk",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:8787",
  "http://127.0.0.1:8787"
]);

export function corsHeaders(request: Request): Headers {
  const headers = new Headers({
    "content-type": "application/json; charset=utf-8",
    "vary": "Origin"
  });
  const origin = request.headers.get("origin");
  if (origin && allowedOrigins.has(origin)) {
    headers.set("access-control-allow-origin", origin);
    headers.set("access-control-allow-methods", "GET,POST,OPTIONS");
    headers.set("access-control-allow-headers", "authorization,content-type");
  }
  return headers;
}

export function json<T>(request: Request, data: T, init: ResponseInit = {}) {
  return new Response(JSON.stringify(ok(data)), {
    ...init,
    headers: corsHeaders(request)
  });
}

export function errorJson(request: Request, status: number, code: string, message: string) {
  return new Response(JSON.stringify(fail(code, message)), {
    status,
    headers: corsHeaders(request)
  });
}

export function noStore(response: Response): Response {
  response.headers.set("cache-control", "no-store");
  return response;
}
