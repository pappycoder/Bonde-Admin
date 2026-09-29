import { api, type ApiList, type ListQuery } from "@/lib/api-client";

export type InviteRole = "USER" | "ADMIN" | "SUPER_ADMIN";
export type InviteStatus = "pending" | "accepted" | "revoked" | "expired";

/** A single-use invitation. The token itself is only ever in the email. */
export interface Invite {
  id: string;
  email: string;
  fullName: string | null;
  role: InviteRole;
  expiresAt: string;
  acceptedAt: string | null;
  revokedAt: string | null;
  invitedBy: string | null;
  inviterName: string | null;
  createdAt: string;
  status: InviteStatus;
}

/** What the public accept page knows about a token (never its history). */
export interface InvitePreview {
  email: string;
  fullName: string | null;
  role: InviteRole;
  expiresAt: string;
  valid: boolean;
}

export function listInvites(
  query?: ListQuery & { status?: InviteStatus },
): Promise<ApiList<Invite>> {
  return api.list<Invite>("/admin/invites", query);
}

/**
 * Issues an invite. The server emails the single-use link, so there is nothing
 * to copy here — re-inviting the same address replaces the live link.
 */
export function createInvite(input: {
  email: string;
  fullName?: string;
  role?: InviteRole;
}): Promise<Invite> {
  return api.post<Invite>("/admin/invites", input, { auth: true });
}

export function revokeInvite(
  id: string,
): Promise<{ id: string; revoked: true }> {
  return api.post<{ id: string; revoked: true }>(
    `/admin/invites/${encodeURIComponent(id)}/revoke`,
    {},
    { auth: true },
  );
}

/** Public: inspect a token before showing the accept form. */
export function peekInvite(token: string): Promise<InvitePreview> {
  return api.get<InvitePreview>(
    `/auth/invites/accept?token=${encodeURIComponent(token)}`,
  );
}

/** Public: redeem the token, choosing the invitee's own password. */
export function acceptInvite(input: {
  token: string;
  password: string;
  fullName?: string;
}): Promise<{ status: "accepted"; email: string }> {
  return api.post<{ status: "accepted"; email: string }>(
    "/auth/invites/accept",
    input,
  );
}
