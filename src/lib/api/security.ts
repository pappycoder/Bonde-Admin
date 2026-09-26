import { api } from "@/lib/api-client";

/** A device signed in to the signed-in user's account. */
export interface AuthSession {
  id: string;
  userAgent: string | null;
  ipAddress: string | null;
  createdAt: string;
  lastUsedAt: string;
  tokenExpiresAt: string;
  /** True when this is the session making the request. */
  current: boolean;
}

export interface ChangePasswordResult {
  status: "success";
  revokedSessions: number;
}

export function getAuthSessions(): Promise<{ sessions: AuthSession[] }> {
  return api.get<{ sessions: AuthSession[] }>("/auth/sessions", { auth: true });
}

/** Signs a device out. It keeps its access token until that token expires. */
export function revokeAuthSession(
  id: string,
): Promise<{ id: string; revoked: true }> {
  return api.delete<{ id: string; revoked: true }>(
    `/auth/sessions/${encodeURIComponent(id)}`,
    {
      auth: true,
    },
  );
}

/**
 * Changes the signed-in user's password. Every other device is signed out
 * server-side and the user is emailed.
 */
export function changePassword(input: {
  currentPassword: string;
  newPassword: string;
}): Promise<ChangePasswordResult> {
  return api.post<ChangePasswordResult>("/auth/change-password", input, {
    auth: true,
  });
}

/** Revokes the current session server-side; safe to call when already signed out. */
export function logoutSession(): Promise<{ status: "signed_out" }> {
  return api.post<{ status: "signed_out" }>("/auth/logout", {}, { auth: true });
}
