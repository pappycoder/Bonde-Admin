import { api, type ApiList, type ListQuery } from "@/lib/api-client";
import { useApi } from "@/hooks/use-api";

/** Derived account status — sees the same vocabulary as the dashboard. */
export type AdminUserStatus = "active" | "pending" | "suspended";

export type AdminTxType = "deposit" | "withdrawal" | "transfer" | "payment";
export type AdminTxStatus = "completed" | "processing" | "pending" | "failed" | "flagged";
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
  wallet: { id: string; balance: string; currency: string; isActive: boolean } | null;
  card: { id: string; cardNumberLast4: string; cardType: string; status: string; createdAt: string } | null;
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

export interface AdminStats {
  totals: {
    users: number;
    activeUsers: number;
    pendingUsers: number;
    suspendedUsers: number;
    newUsers30d: number;
    newUsersPrev30d: number;
    transactions30d: number;
    volume: string;
    volume30d: string;
    volumePrev30d: string;
    deposits30d: string;
    depositsPrev30d: string;
    pendingReviews: number;
    openTickets: number;
  };
  /** Last 12 month buckets, oldest first. Amounts are fixed 2-decimal strings. */
  revenue: Array<{
    month: string;
    revenue: string;
    expenses: string;
    volume: string;
  }>;
  /** Last 7 calendar days, oldest first. */
  weekly: Array<{ day: string; transactions: number }>;
}

export function listAdminUsers(query?: ListQuery): Promise<ApiList<AdminUser>> {
  return api.list<AdminUser>("/admin/users", query);
}

export function getAdminStats(): Promise<AdminStats> {
  return api.get<AdminStats>("/admin/stats", { auth: true });
}

/** Dashboard/analytics KPIs: totals, monthly series and 7-day volume. */
export function useAdminStats() {
  return useApi<AdminStats>(getAdminStats, []);
}

export function getAdminUser(id: string): Promise<AdminUserDetail> {
  return api.get<AdminUserDetail>(`/admin/users/${encodeURIComponent(id)}`, { auth: true });
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
  userName: string;
  userEmail: string;
  assigneeId: string | null;
  assigneeName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminSupportMessage {
  id: string;
  role: SupportMessageRole;
  body: string;
  authorName: string | null;
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
export function listAdminSupportTickets(query?: SupportTicketListQuery): Promise<ApiList<AdminSupportTicket>> {
  return api.list<AdminSupportTicket>("/admin/support-tickets", query);
}

export function getAdminSupportTicket(id: string): Promise<AdminSupportTicketDetail> {
  return api.get<AdminSupportTicketDetail>(`/admin/support-tickets/${encodeURIComponent(id)}`, {
    auth: true,
  });
}

/** Opens a ticket on a user's behalf, optionally with their first message. */
export function createAdminSupportTicket(
  input: CreateSupportTicketInput,
): Promise<AdminSupportTicketDetail> {
  return api.post<AdminSupportTicketDetail>("/admin/support-tickets", input, { auth: true });
}

export function replyAdminSupportTicket(id: string, body: string): Promise<AdminSupportTicketDetail> {
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
export function suspendAdminUser(id: string, reason?: string): Promise<AdminUserDetail> {
  return api.post<AdminUserDetail>(
    `/admin/users/${encodeURIComponent(id)}/suspend`,
    reason ? { reason } : {},
    { auth: true },
  );
}

/** Reactivates a suspended user's 1:1 account + wallet. Idempotent server-side. */
export function restoreAdminUser(id: string): Promise<AdminUserDetail> {
  return api.post<AdminUserDetail>(`/admin/users/${encodeURIComponent(id)}/restore`, {}, { auth: true });
}

export function getUserNames(ids: string[]): Promise<AdminUserNames> {
  const unique = [...new Set(ids)].sort();
  if (unique.length === 0) return Promise.resolve({});
  return api.get<AdminUserNames>(
    `/admin/users/names?ids=${unique.map(encodeURIComponent).join(",")}`,
    { auth: true },
  );
}

export function listAdminTransactions(query?: ListQuery): Promise<ApiList<AdminTransaction>> {
  return api.list<AdminTransaction>("/admin/transactions", query);
}

export function getAdminTransaction(id: string): Promise<AdminTransactionDetail> {
  return api.get<AdminTransactionDetail>(`/admin/transactions/${encodeURIComponent(id)}`, {
    auth: true,
  });
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