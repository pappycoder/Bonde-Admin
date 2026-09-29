import { api, type ApiList, type ListQuery } from "@/lib/api-client";
import { initialsOf, timeAgo } from "@/lib/format";
import type { AdminUserNames } from "@/lib/api/admin";

export interface AdminAuditLog {
  id: string;
  userId: string | null;
  action: string;
  entityType: string;
  entityId: string;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface ActivityItem {
  id: string;
  actor: string;
  initials: string;
  action: string;
  detail: string;
  time: string;
  tone?: "primary" | "success" | "warning" | "muted";
  device?: string;
  ip?: string;
  createdAt: number;
}

export function listAdminAuditLogs(
  query?: ListQuery,
): Promise<ApiList<AdminAuditLog>> {
  return api.list<AdminAuditLog>("/admin/audit-logs", query);
}

const WARNING_ACTIONS = [
  "denied",
  "flagged",
  "suspend",
  "withdraw",
  "reversal",
  "fail",
];
const PRIMARY_ACTIONS = ["login", "register", "revoke", "lock"];

function toneOf(action: string): NonNullable<ActivityItem["tone"]> {
  if (PRIMARY_ACTIONS.some((key) => action.includes(key))) return "primary";
  if (WARNING_ACTIONS.some((key) => action.includes(key))) return "warning";
  return "muted";
}

function humanizeAction(action: string): string {
  const parts = action.split(".").map((part, index) => {
    const legible = part.replace(/_/g, " ");
    return index === 0
      ? legible.charAt(0).toUpperCase() + legible.slice(1)
      : legible;
  });
  return parts.join(" · ");
}

function actorOf(
  log: AdminAuditLog,
  names?: AdminUserNames,
): { actor: string; initials: string } {
  if (!log.userId) return { actor: "System", initials: "SY" };
  const fullName = names?.[log.userId];
  if (fullName) return { actor: fullName, initials: initialsOf(fullName) };
  const short = log.userId.slice(0, 8);
  return { actor: `User ${short}`, initials: short.slice(0, 2).toUpperCase() };
}

/** "Windows · Chrome" from a raw user-agent; shared with the sessions view. */
export function parseDevice(userAgent: string): string {
  let os = "Unknown OS";
  if (userAgent.includes("Windows")) os = "Windows";
  else if (userAgent.includes("Mac")) os = "macOS";
  else if (userAgent.includes("Android")) os = "Android";
  else if (userAgent.includes("iPhone") || userAgent.includes("iPad"))
    os = "iOS";
  else if (userAgent.includes("Linux")) os = "Linux";

  let browser = "Unknown";
  if (userAgent.includes("Edg")) browser = "Edge";
  else if (userAgent.includes("Chrome")) browser = "Chrome";
  else if (userAgent.includes("Firefox")) browser = "Firefox";
  else if (userAgent.includes("Safari")) browser = "Safari";

  return `${os} · ${browser}`;
}

function detailOf(log: AdminAuditLog): string {
  const parts = [log.entityType];
  const meta = log.metadata ?? {};
  if (typeof meta.email === "string" && meta.email) parts.push(meta.email);
  return parts.filter(Boolean).join(" · ");
}

/**
 * Adapter from the read-only admin audit surface (`/api/admin/audit-logs`) to
 * the prop-driven dashboard components. When `names` (from the admin users
 * names endpoint) is provided, actor short-ids are replaced with full names.
 */
export function toActivityItems(
  logs: AdminAuditLog[],
  names?: AdminUserNames,
): ActivityItem[] {
  return logs.map((log) => {
    const actor = actorOf(log, names);
    return {
      id: log.id,
      actor: actor.actor,
      initials: actor.initials,
      action: humanizeAction(log.action),
      detail: detailOf(log),
      time: timeAgo(log.createdAt),
      tone: toneOf(log.action),
      device: log.userAgent ? parseDevice(log.userAgent) : undefined,
      ip: log.ipAddress ?? undefined,
      createdAt: Date.parse(log.createdAt),
    };
  });
}
