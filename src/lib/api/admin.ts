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

export function listAdminUsers(query?: ListQuery): Promise<ApiList<AdminUser>> {
  return api.list<AdminUser>("/admin/users", query);
}

export function getAdminUser(id: string): Promise<AdminUserDetail> {
  return api.get<AdminUserDetail>(`/admin/users/${encodeURIComponent(id)}`, { auth: true });
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