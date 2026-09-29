import { api, type ApiList, type ListQuery } from "@/lib/api-client";
import { useApi } from "@/hooks/use-api";

/** Derived account status — sees the same vocabulary as the dashboard. */
export type AdminUserStatus = "active" | "pending" | "suspended";

export type AdminTxType = "deposit" | "withdrawal" | "transfer" | "payment";
export type AdminTxStatus =
  "completed" | "processing" | "pending" | "failed" | "flagged";
export type AdminApprovalStatus = "PENDING" | "APPROVED" | "DECLINED";

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  emailVerified: boolean;
  phoneVerified: boolean;
  onboardingCompleted: boolean;
  status: AdminUserStatus;
  balance: string;
  currency: string;
  accountNumber: string | null;
  accountType: string | null;
  isActive: boolean;
  joinedAt: string;
  lastActiveAt: string;
  transactionCount: number;
}

export interface AdminTxSummary {
  id: string;
  userId: string;
  type: AdminTxType;
  status: AdminTxStatus;
  approvalStatus: AdminApprovalStatus;
  amount: string;
  currency: string;
  method: string;
  description: string | null;
  thresholdWarning: boolean;
  isRecurring: boolean;
  createdAt: string;
}

export interface AdminUserDetail extends AdminUser {
  recentTransactions: AdminTxSummary[];
}

export interface AdminTransaction extends AdminTxSummary {
  user: string | null;
  userEmail: string | null;
}

export interface AdminTransactionDetail extends AdminTransaction {
  wallet: {
    id: string;
    balance: string;
    currency: string;
    isActive: boolean;
  } | null;
  card: {
    id: string;
    cardNumberLast4: string;
    cardType: string;
    status: string;
    createdAt: string;
  } | null;
  approvals: Array<{
    id: string;
    status: AdminApprovalStatus;
    approvedBy: string;
    approver: string | null;
    notes: string | null;
    createdAt: string;
  }>;
}

export type AdminUserNames = Record<string, string>;

export type AdminReviewStatus = "APPROVED" | "DECLINED";

export interface AdminStatsSeriesPoint {
  /** Day label ("Sep 12") for short windows, month + year ("Sep 26") for long. */
  label: string;
  revenue: string;
  expenses: string;
  volume: string;
  transactions: number;
}

export interface AdminStats {
  /** The trailing window the period metrics were scoped to, echoed by the API. */
  window: { days: number; from: string; to: string };
  /** State gauges — all-time by nature, never windowed. */
  totals: {
    users: number;
    activeUsers: number;
    pendingUsers: number;
    suspendedUsers: number;
    pendingReviews: number;
    openTickets: number;
    volume: string;
  };
  /** Period metrics over `window`, with the prior period for the deltas. */
  windowTotals: {
    newUsers: number;
    newUsersPrev: number;
    transactions: number;
    volume: string;
    volumePrev: string;
    deposits: string;
    depositsPrev: string;
  };
  /** One series over `window`, oldest first. */
  series: AdminStatsSeriesPoint[];
}

export function listAdminUsers(query?: ListQuery): Promise<ApiList<AdminUser>> {
  return api.list<AdminUser>("/admin/users", query);
}

export function getAdminStats(days?: number): Promise<AdminStats> {
  const query = days ? `?days=${days}` : "";
  return api.get<AdminStats>(`/admin/stats${query}`, { auth: true });
}

const STATS_TTL_MS = 30_000;
const DEFAULT_STATS_DAYS = 30;
const statsCache = new Map<string, { at: number; data: AdminStats }>();
const statsInFlight = new Map<string, Promise<AdminStats>>();

/**
 * The sidebar badge and the page body both need stats, and stats is the
 * heaviest admin aggregate. Concurrent callers share one request and repeat
 * calls inside the TTL reuse it. Failures are never cached, so the error-state
 * retry still reaches the server.
 */
function fetchAdminStatsShared(days: number | undefined): Promise<AdminStats> {
  // Normalised so a caller passing no window and one passing the default
  // share a cache entry — the sidebar badge and the dashboard would otherwise
  // each fire their own identical request.
  const key = String(days ?? DEFAULT_STATS_DAYS);
  const cached = statsCache.get(key);
  if (cached && Date.now() - cached.at < STATS_TTL_MS) {
    return Promise.resolve(cached.data);
  }
  const existing = statsInFlight.get(key);
  if (existing) return existing;

  const request = getAdminStats(days ?? DEFAULT_STATS_DAYS).then(
    (data) => {
      statsCache.set(key, { at: Date.now(), data });
      statsInFlight.delete(key);
      return data;
    },
    (error) => {
      statsInFlight.delete(key);
      throw error;
    },
  );
  statsInFlight.set(key, request);
  return request;
}

/**
 * Dashboard/analytics KPIs for one trailing window. The sidebar badge asks for
 * the default window so it can keep showing without a period picker.
 */
export function useAdminStats(days?: number) {
  return useApi<AdminStats>(() => fetchAdminStatsShared(days), [days]);
}

export function getAdminUser(id: string): Promise<AdminUserDetail> {
  return api.get<AdminUserDetail>(`/admin/users/${encodeURIComponent(id)}`, {
    auth: true,
  });
}

export type SupportTicketStatus = "OPEN" | "PENDING" | "RESOLVED";
export type SupportTicketPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type SupportMessageRole = "USER" | "SUPPORT";

export interface AdminSupportTicket {
  id: string;
  subject: string;
  status: SupportTicketStatus;
  priority: SupportTicketPriority;
  userId: string;
  user: string | null;
  userEmail: string | null;
  assignee: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminSupportMessage {
  id: string;
  role: SupportMessageRole;
  body: string;
  createdAt: string;
}

export interface AdminSupportTicketDetail extends AdminSupportTicket {
  messages: AdminSupportMessage[];
}

export interface CreateSupportTicketInput {
  userId: string;
  subject: string;
  priority?: SupportTicketPriority;
  message?: string;
}

/** `/admin/support-tickets` accepts the shared list params plus `status`. */
export interface SupportTicketListQuery extends ListQuery {
  status?: SupportTicketStatus;
}

/** Support inbox: paged list with a free-text `q` and an optional `status` filter. */
export function listAdminSupportTickets(
  query?: SupportTicketListQuery,
): Promise<ApiList<AdminSupportTicket>> {
  return api.list<AdminSupportTicket>("/admin/support-tickets", query);
}

export function getAdminSupportTicket(
  id: string,
): Promise<AdminSupportTicketDetail> {
  return api.get<AdminSupportTicketDetail>(
    `/admin/support-tickets/${encodeURIComponent(id)}`,
    {
      auth: true,
    },
  );
}

/** Opens a ticket on a user's behalf, optionally with their first message. */
export function createAdminSupportTicket(
  input: CreateSupportTicketInput,
): Promise<AdminSupportTicketDetail> {
  return api.post<AdminSupportTicketDetail>("/admin/support-tickets", input, {
    auth: true,
  });
}

export function replyAdminSupportTicket(
  id: string,
  body: string,
): Promise<AdminSupportTicketDetail> {
  return api.post<AdminSupportTicketDetail>(
    `/admin/support-tickets/${encodeURIComponent(id)}/messages`,
    { body },
    { auth: true },
  );
}

export function updateAdminSupportTicketStatus(
  id: string,
  status: SupportTicketStatus,
): Promise<AdminSupportTicketDetail> {
  return api.patch<AdminSupportTicketDetail>(
    `/admin/support-tickets/${encodeURIComponent(id)}/status`,
    { status },
    { auth: true },
  );
}

/** Deactivates the user's 1:1 account + wallet. Idempotent server-side. */
export function suspendAdminUser(
  id: string,
  reason?: string,
): Promise<AdminUserDetail> {
  return api.post<AdminUserDetail>(
    `/admin/users/${encodeURIComponent(id)}/suspend`,
    reason ? { reason } : {},
    { auth: true },
  );
}

/** Reactivates a suspended user's 1:1 account + wallet. Idempotent server-side. */
export function restoreAdminUser(id: string): Promise<AdminUserDetail> {
  return api.post<AdminUserDetail>(
    `/admin/users/${encodeURIComponent(id)}/restore`,
    {},
    { auth: true },
  );
}

export function getUserNames(ids: string[]): Promise<AdminUserNames> {
  const unique = [...new Set(ids)].sort();
  if (unique.length === 0) return Promise.resolve({});
  return api.get<AdminUserNames>(
    `/admin/users/names?ids=${unique.map(encodeURIComponent).join(",")}`,
    { auth: true },
  );
}

export function listAdminTransactions(
  query?: ListQuery,
): Promise<ApiList<AdminTransaction>> {
  return api.list<AdminTransaction>("/admin/transactions", query);
}

export function getAdminTransaction(
  id: string,
): Promise<AdminTransactionDetail> {
  return api.get<AdminTransactionDetail>(
    `/admin/transactions/${encodeURIComponent(id)}`,
    {
      auth: true,
    },
  );
}

/** Records an admin approval/decline on an in-flight transaction. */
export function reviewAdminTransaction(
  id: string,
  status: AdminReviewStatus,
  notes?: string,
): Promise<AdminTransactionDetail> {
  return api.post<AdminTransactionDetail>(
    `/admin/transactions/${encodeURIComponent(id)}/approval`,
    notes ? { status, notes } : { status },
    { auth: true },
  );
}

/**
 * Resolves display names for the given user ids. Missing ids stay unresolved
 * (consumers keep their short-id fallback).
 */
export function useAdminUserNames(ids: string[]): AdminUserNames {
  const unique = [...new Set(ids)].sort();
  const key = unique.join(",");
  const { data } = useApi<AdminUserNames>(() => getUserNames(unique), [key]);
  return data ?? {};
}
