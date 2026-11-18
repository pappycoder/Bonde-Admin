import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  getSessionEpoch,
  loadSession,
  rotateSession,
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

export interface ListQuery {
  page?: number;
  pageSize?: number;
  q?: string;
  orderBy?: string;
  filter?: string | string[];
  /** Dedicated status param, used by the admin users and support tickets lists. */
  status?: string;
  /** Derived transaction status, matching the badge the console renders. */
  uiStatus?: string;
}

export interface ApiList<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export function buildListQuery(query: ListQuery = {}): string {
  const params = new URLSearchParams();
  if (query.page != null) params.set("page", String(query.page));
  if (query.pageSize != null) params.set("pageSize", String(query.pageSize));
  if (query.q) params.set("q", query.q);
  if (query.orderBy) params.set("orderBy", query.orderBy);
  if (query.status) params.set("status", query.status);
  if (query.uiStatus) params.set("uiStatus", query.uiStatus);
  const filters = Array.isArray(query.filter) ? query.filter : [query.filter];
  for (const filter of filters) {
    if (filter) params.append("filter", filter);
  }
  const raw = params.toString();
  return raw ? `?${raw}` : "";
}

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
  const epoch = getSessionEpoch();
  const sentToken = auth ? getAccessToken() : null;

  const finalHeaders = new Headers(headers);
  if (init.body && !finalHeaders.has("content-type")) {
    finalHeaders.set("content-type", "application/json");
  }
  if (auth) {
    if (sentToken) finalHeaders.set("authorization", `Bearer ${sentToken}`);
  }

  const response = await fetch(`/api${path}`, {
    ...init,
    headers: finalHeaders,
  });

  if (auth && epoch !== getSessionEpoch()) {
    throw new ApiError(401, "Your session changed. Please try again.");
  }

  if (response.status === 401 && auth && !retried) {
    const currentToken = getAccessToken();
    if (
      (currentToken && currentToken !== sentToken) ||
      (await tryRefresh(epoch))
    ) {
      if (epoch !== getSessionEpoch()) {
        throw new ApiError(401, "Your session changed. Please try again.");
      }
      return apiFetch<T>(path, options, true);
    }
  } else if (response.status === 401 && auth && retried) {
    // Do not clear tokens rotated by another request after this retry started.
    if (getAccessToken() === sentToken) clearSession();
  }

  if (!response.ok) {
    throw new ApiError(
      response.status,
      messageOf(response, await jsonOf(response)),
    );
  }

  const result = await jsonOf(response);
  if (auth && epoch !== getSessionEpoch()) {
    throw new ApiError(401, "Your session changed. Please try again.");
  }
  return result as T;
}

async function jsonOf(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function messageOf(response: Response, body: unknown): string {
  if (body && typeof body === "object" && "message" in body) {
    const message = (body as { message: unknown }).message;
    if (Array.isArray(message)) {
      const joined = message.filter((m): m is string => typeof m === "string");
      if (joined.length > 0) return joined.join(", ");
    }
    if (typeof message === "string") return message;
  }
  return response.statusText || `Request failed (${response.status})`;
}

let refreshFlight: {
  epoch: number;
  token: string;
  promise: Promise<boolean>;
} | null = null;

function tryRefresh(epoch: number): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    clearSession();
    return Promise.resolve(false);
  }
  if (refreshFlight?.epoch === epoch && refreshFlight.token === refreshToken) {
    return refreshFlight.promise;
  }
  const flight = {
    epoch,
    token: refreshToken,
    promise: refreshTokens(epoch, refreshToken).finally(() => {
      if (refreshFlight === flight) refreshFlight = null;
    }),
  };
  refreshFlight = flight;
  return flight.promise;
}

async function refreshTokens(
  epoch: number,
  refreshToken: string,
): Promise<boolean> {
  try {
    const session = await apiFetch<Session>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    });
    if (
      !session ||
      typeof session.accessToken !== "string" ||
      !session.accessToken ||
      typeof session.refreshToken !== "string" ||
      !session.refreshToken ||
      typeof session.expiresIn !== "number" ||
      !Number.isFinite(session.expiresIn) ||
      session.expiresIn <= 0 ||
      !session.user ||
      session.user.id !== loadSession()?.user.id
    ) {
      throw new ApiError(
        401,
        "Invalid refresh response. Please sign in again.",
      );
    }
    return rotateSession(session, epoch, refreshToken);
  } catch (error) {
    if (epoch !== getSessionEpoch() || getRefreshToken() !== refreshToken)
      return false;
    if (error instanceof ApiError && [400, 401, 403].includes(error.status)) {
      clearSession();
      return false;
    }
    // Temporary network/server failures do not invalidate credentials.
    throw error;
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
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    apiFetch<T>(path, {
      method: "PUT",
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      ...options,
    }),
  delete: <T>(path: string, options?: RequestOptions) =>
    apiFetch<T>(path, { method: "DELETE", ...options }),
  list: <T>(path: string, query?: ListQuery, options?: RequestOptions) =>
    apiFetch<ApiList<T>>(`${path}${buildListQuery(query)}`, {
      method: "GET",
      auth: true,
      ...options,
    }),
};
