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

export interface TwoFactorStatus {
  enabled: boolean;
  enrolledAt: string | null;
  recoveryCodesRemaining: number;
}

export interface TwoFactorSetup {
  secret: string;
  otpauthUri: string;
}

export function getTwoFactorStatus(): Promise<TwoFactorStatus> {
  return api.get<TwoFactorStatus>("/auth/2fa", { auth: true });
}

/** Starts enrolment; re-checks the password so a hijacked session cannot enrol. */
export function startTwoFactorSetup(password: string): Promise<TwoFactorSetup> {
  return api.post<TwoFactorSetup>(
    "/auth/2fa/setup",
    { password },
    { auth: true },
  );
}

/** Confirms enrolment. The recovery codes are returned exactly once. */
export function enableTwoFactor(
  code: string,
): Promise<{ recoveryCodes: string[] }> {
  return api.post<{ recoveryCodes: string[] }>(
    "/auth/2fa/enable",
    { code },
    { auth: true },
  );
}

/** Turns the factor off; needs the password and a current code. */
export function disableTwoFactor(input: {
  password: string;
  code: string;
}): Promise<{ status: string }> {
  return api.post<{ status: string }>(
    "/auth/2fa/disable",
    { password: input.password, code: input.code },
    { auth: true },
  );
}
