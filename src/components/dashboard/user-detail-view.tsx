"use client";

import { cn } from "cn";
import {
  ArrowLeft,
  Ban,
  Building2,
  CalendarDays,
  Clock,
  Fingerprint,
  Mail,
  ShieldCheck,
  UserCheck,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ErrorState, LoadingState } from "@/components/data/state";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useApi } from "@/hooks/use-api";
import type { AdminUserStatus, AdminTxStatus, AdminTxType } from "@/lib/api/admin";
import { getAdminUser, restoreAdminUser, suspendAdminUser } from "@/lib/api/admin";
import { ApiError } from "@/lib/api-client";
import { formatMoney, formatMonthYear, initialsOf, timeAgo } from "@/lib/format";

const STATUS_CLASSES: Record<AdminUserStatus, string> = {
  active: "border-transparent bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  pending:
    "border-transparent bg-amber-500/10 text-amber-600 dark:text-amber-400",
  suspended:
    "border-transparent bg-red-500/10 text-red-600 dark:text-red-400",
};

const TYPE_LABELS: Record<AdminTxType, string> = {
  deposit: "Deposit",
  withdrawal: "Withdrawal",
  transfer: "Transfer",
  payment: "Payment",
};

const TX_STATUS_CLASSES: Record<AdminTxStatus, string> = {
  completed:
    "border-transparent bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  processing:
    "border-transparent bg-blue-500/10 text-blue-600 dark:text-blue-400",
  pending:
    "border-transparent bg-amber-500/10 text-amber-600 dark:text-amber-400",
  failed: "border-transparent bg-red-500/10 text-red-600 dark:text-red-400",
  flagged:
    "border-transparent bg-orange-500/10 text-orange-600 dark:text-orange-400",
};

export function UserDetailView({ userId }: { userId: string }) {
  const { data, error, loading, refresh } = useApi(
    () => getAdminUser(userId),
    [userId],
  );
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [acting, setActing] = useState(false);

  if (loading && !data) {
    return <LoadingState className="py-24" />;
  }

  if (error && !data) {
    return (
      <ErrorState
        message={error.status === 404 ? "User not found" : error.message}
        onRetry={() => void refresh()}
      />
    );
  }

  if (!data) return null;

  const { user, txs } = { user: data, txs: data.recentTransactions };

  async function handleSuspend() {
    setActing(true);
    try {
      await suspendAdminUser(user.id);
      toast.success("User suspended", {
        description: `${user.fullName} can no longer transact.`,
      });
      setSuspendOpen(false);
      void refresh();
    } catch (e) {
      toast.error(
        e instanceof ApiError ? e.message : "Could not suspend this user",
      );
    } finally {
      setActing(false);
    }
  }

  async function handleRestore() {
    setActing(true);
    try {
      await restoreAdminUser(user.id);
      toast.success("User restored", {
        description: `${user.fullName} can transact again.`,
      });
      void refresh();
    } catch (e) {
      toast.error(
        e instanceof ApiError ? e.message : "Could not restore this user",
      );
    } finally {
      setActing(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="gap-1" asChild>
          <Link href="/users">
            <ArrowLeft className="size-4" />
            All users
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4 space-y-0">
            <div className="flex items-center gap-4">
              <Avatar className="size-14">
                <AvatarFallback className="text-base">
                  {initialsOf(user.fullName)}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CardTitle>{user.fullName}</CardTitle>
                  <Badge
                    variant="outline"
                    className={cn(
                      "border-transparent capitalize",
                      STATUS_CLASSES[user.status],
                    )}
                  >
                    {user.status}
                  </Badge>
                </div>
                <CardDescription className="flex items-center gap-1.5">
                  <Mail className="size-3.5" />
                  {user.email}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {user.status === "suspended" ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => void handleRestore()}
                  disabled={acting}
                >
                  <UserCheck className="size-4" />
                  Restore access
                </Button>
              ) : (
                <Button
                  variant="destructive"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => setSuspendOpen(true)}
                  disabled={acting}
                >
                  <Ban className="size-4" />
                  Suspend user
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Wallet className="size-3.5" /> Balance
                </p>
                <p className="text-xl font-semibold tabular-nums">
                  {formatMoney(user.balance, user.currency)}
                </p>
              </div>
              <div className="space-y-1.5">
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CalendarDays className="size-3.5" /> Joined
                </p>
                <p className="text-sm font-medium">{formatMonthYear(user.joinedAt)}</p>
              </div>
              <div className="space-y-1.5">
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="size-3.5" /> Last active
                </p>
                <p className="text-sm font-medium">
                  {timeAgo(user.lastActiveAt) || "—"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="size-4" /> Verification
            </CardTitle>
            <CardDescription>Account and identity state.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Mail className="size-3.5" /> Email
              </span>
              <Badge
                variant="outline"
                className={cn(
                  "border-transparent",
                  user.emailVerified
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400",
                )}
              >
                {user.emailVerified ? "Verified" : "Unverified"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Fingerprint className="size-3.5" /> Phone
              </span>
              <span className="text-muted-foreground">
                {user.phone ?? "—"}{" "}
                {user.phoneVerified ? (
                  <span className="ml-1 text-emerald-600 dark:text-emerald-400">· verified</span>
                ) : null}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Building2 className="size-3.5" /> Account
              </span>
              <span className="font-medium tabular-nums">
                {user.accountNumber ?? "—"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Onboarding</span>
              <span className="font-medium capitalize">
                {user.onboardingCompleted ? "Completed" : "Pending"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent transactions</CardTitle>
          <CardDescription>
            Latest movement on this account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {txs.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-24">Transaction</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">When</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {txs.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="font-medium tabular-nums">
                      <Link
                        href={`/transactions/${tx.id}`}
                        className="text-foreground underline-offset-4 hover:underline"
                      >
                        {tx.id.slice(0, 8)}
                      </Link>
                    </TableCell>
                    <TableCell className="capitalize text-muted-foreground">
                      {TYPE_LABELS[tx.type]}
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {tx.type === "deposit" ? "+" : "-"}
                      {formatMoney(tx.amount, tx.currency)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "border-transparent capitalize",
                          TX_STATUS_CLASSES[tx.status],
                        )}
                      >
                        {tx.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden whitespace-nowrap text-muted-foreground md:table-cell">
                      {timeAgo(tx.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground">
              No transactions recorded for this user yet.
            </p>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={suspendOpen} onOpenChange={setSuspendOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Suspend {user.fullName}?</AlertDialogTitle>
            <AlertDialogDescription>
              Their account and wallet will be deactivated, blocking all
              deposits, withdrawals and transfers. You can restore access at any
              time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={acting}>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={acting} onClick={() => void handleSuspend()}>
              Suspend
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}