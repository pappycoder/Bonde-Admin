import { api } from "../api-client";
import type { Session } from "./session";

export type { Session } from "./session";

export const ROLES = ["USER", "ADMIN", "SUPER_ADMIN"] as const;
export type BondeRole = (typeof ROLES)[number];

export interface Principal {
  userId: string;
  email: string | null;
  phone: string | null;
  role: BondeRole;
  appMetadata: Record<string, unknown>;
  userMetadata: Record<string, unknown>;
}

export interface AuthUser {
  id: string;
  email: string;
  phone: string | null;
  name: string;
  initials: string;
  role: BondeRole;
  avatarUrl: string | null;
}

export async function login(email: string, password: string): Promise<Session> {
  return api.post<Session>("/auth/login", { email, password });
}

export async function forgotPassword(email: string): Promise<{ status: "sent" }> {
  return api.post<{ status: "sent" }>("/auth/forgot-password", { email });
}

export async function verifyResetOtp(
  email: string,
  code: string,
): Promise<{ resetToken: string }> {
  return api.post<{ resetToken: string }>("/auth/verify-reset-otp", { email, code });
}

export async function resetPassword(
  token: string,
  newPassword: string,
): Promise<{ status: "success" }> {
  return api.patch<{ status: "success" }>("/auth/reset-password", {
    token,
    newPassword,
  });
}

export async function fetchMe(): Promise<Principal> {
  return api.get<Principal>("/auth/me", { auth: true });
}

export function toAuthUser(principal: Principal): AuthUser {
  const email = principal.email ?? "";
  const rawName =
    typeof principal.userMetadata?.full_name === "string"
      ? (principal.userMetadata.full_name as string).trim()
      : "";
  const name = rawName || (email ? email.split("@")[0] : "Bonde Admin");
  const parts = name.split(" ").filter(Boolean);
  const initials =
    parts.length >= 2
      ? (parts[0][0] ?? "") + (parts[parts.length - 1][0] ?? "")
      : name.slice(0, 2);
  const avatar =
    typeof principal.userMetadata?.avatar_url === "string"
      ? (principal.userMetadata.avatar_url as string)
      : null;
  return {
    id: principal.userId,
    email,
    phone: principal.phone,
    name,
    initials: initials.toUpperCase(),
    role: principal.role,
    avatarUrl: avatar,
  };
}