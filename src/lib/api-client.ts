import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  saveSession,
} from "./auth/session";
import type { Session } from "./auth/session";

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type RequestOptions = RequestInit & { auth?: boolean };

/**
 * Thin fetch wrapper against the same-origin `/api/*` base (proxied to the
 * backend by Next rewrites). Parses JSON, normalizes failures into `ApiError`
 * with the server's `message`, injects the Bearer token when asked, and
 * transparently retries once after a refresh-token exchange on a 401.
 */
async function apiFetch<T>(
  path: string,
  options: RequestOptions = {},
  retried = false,
): Promise<T> {
  const { auth = false, headers, ...init } = options;

  const finalHeaders = new Headers(headers);
  if (init.body && !finalHeaders.has("content-type")) {
    finalHeaders.set("content-type", "application/json");
  }
  if (auth) {
    const token = getAccessToken();
    if (token) finalHeaders.set("authorization", `Bearer ${token}`);
  }

  const response = await fetch(`/api${path}`, { ...init, headers: finalHeaders });

  if (response.status === 401 && auth && !retried) {
    if (await tryRefresh()) {
      return apiFetch<T>(path, options, true);
    }
    clearSession();
  }

  if (!response.ok) {
    throw new ApiError(response.status, messageOf(response, await jsonOf(response)));
  }

  return (await jsonOf(response)) as T;
}

async function jsonOf(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function messageOf(response: Response, body: unknown): string {
  if (
    body &&
    typeof body === "object" &&
    "message" in body &&
    typeof (body as { message: unknown }).message === "string"
  ) {
    return (body as { message: string }).message;
  }
  return response.statusText || `Request failed (${response.status})`;
}

async function tryRefresh(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;
  try {
    const session = await apiFetch<Session>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    });
    saveSession(session);
    return true;
  } catch {
    return false;
  }
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) =>
    apiFetch<T>(path, { method: "GET", ...options }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiFetch<T>(path, {
      method: "POST",
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      ...options,
    }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiFetch<T>(path, {
      method: "PATCH",
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      ...options,
    }),
};