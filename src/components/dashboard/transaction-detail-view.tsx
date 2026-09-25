"use client";

import { cn } from "cn";
import {
  ArrowLeft,
  Banknote,
  CheckCircle2,
  CreditCard,
  Landmark,
  Link2,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";

import { ErrorState, LoadingState } from "@/components/data/state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useApi } from "@/hooks/use-api";
import type { AdminTxStatus, AdminTxType } from "@/lib/api/admin";
import { getAdminTransaction } from "@/lib/api/admin";
import { timeAgo } from "@/lib/format";

const TYPE_META: Record<AdminTxType, { label: string; icon: typeof Banknote }> = {
  deposit: { label: "Deposit", icon: Landmark },
  withdrawal: { label: "Withdrawal", icon: Banknote },
  transfer: { label: "Transfer", icon: Link2 },
  payment: { label: "Payment", icon: CreditCard },
};

const STATUS_LABEL: Record<AdminTxStatus, string> = {
  completed: "Completed",
  processing: "Processing",
  pending: "Pending",
  failed: "Failed",
  flagged: "Flagged",
};

function settledCopy(status: AdminTxStatus): string {
  switch (status) {
    case "completed":
      return "The transaction reached its final settlement state.";
    case "failed":
      return "The transaction failed and was not settled.";
    case "flagged":
      return "Flagged for manual review by the fraud team.";
    case "pending":
    case "processing":
      return "The transaction is still in flight.";
  }
}

export function TransactionDetailView({ transactionId }: { transactionId: string }) {
  const { data, error, loading, refresh } = useApi(
    () => getAdminTransaction(transactionId),
    [transactionId],
  );

  if (loading && !data) {
    return <LoadingState className="py-24" />;
  }

  if (error && !data) {
    return (
      <ErrorState
        message={error.status === 404 ? "Transaction not found" : error.message}
        onRetry={() => void refresh()}
      />
    );
  }

  if (!data) return null;

  const tx = data;
  const meta = TYPE_META[tx.type];
  const Icon = meta.icon;
  const isCredit = tx.type === "deposit";
  const settled = STATUS_LABEL[tx.status];

  const steps = [
    {
      title: "Initiated",
      detail: `${tx.user ?? tx.userEmail ?? "The customer"} started the ${meta.label.toLowerCase()} via ${tx.method}.`,
      tone: "text-primary",
    },
    ...tx.approvals.map((approval) => ({
      title: `${approval.status.toLowerCase()} approval`,
      detail: `${approval.approver ?? "System"}${approval.notes ? ` — ${approval.notes}` : ""}`,
      tone: "text-primary",
    })),
    {
      title: settled,
      detail: settledCopy(tx.status),
      tone: tx.status === "flagged" ? "text-amber-500" : "text-primary",
      isLast: true,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="gap-1" asChild>
          <Link href="/transactions">
            <ArrowLeft className="size-4" />
            All transactions
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <span className="tabular-nums">{tx.id.slice(0, 8)}</span>
                <Badge
                  variant="outline"
                  className="border-transparent bg-primary/10 capitalize text-primary"
                >
                  {tx.status}
                </Badge>
              </CardTitle>
              <CardDescription>
                {timeAgo(tx.createdAt)} · via {tx.method}
              </CardDescription>
            </div>
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon className="size-5" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-muted-foreground">
              {isCredit ? "Deposited" : "Moved"} by{" "}
              {tx.user ? (
                <Link
                  href={`/users/${tx.userId}`}
                  className="font-medium text-foreground underline-offset-4 hover:underline"
                >
                  {tx.user}
                </Link>
              ) : (
                <span className="font-medium text-foreground">{tx.userEmail ?? "Unknown"}</span>
              )}
            </p>
            <p
              className={cn(
                "mt-1 text-3xl font-semibold tabular-nums tracking-tight",
                isCredit ? "text-emerald-600 dark:text-emerald-400" : "text-foreground",
              )}
            >
              {isCredit ? "+" : "-"}
              {new Intl.NumberFormat("en-NG", {
                style: "currency",
                currency: tx.currency,
              }).format(Number(tx.amount))}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
            <CardDescription>Transaction metadata.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Type</span>
              <span className="font-medium capitalize">{meta.label}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Method</span>
              <span className="font-medium">{tx.method}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Status</span>
              <span className="font-medium capitalize">{tx.status}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Approval</span>
              <span className="font-medium capitalize">{tx.approvalStatus.toLowerCase()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Currency</span>
              <span className="font-medium">{tx.currency}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Reference</span>
              <span className="font-mono text-xs">{tx.id}</span>
            </div>
            {tx.description ? (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Description</span>
                <span className="font-medium">{tx.description}</span>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
          <CardDescription>
            Status history for this {meta.label.toLowerCase()}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="relative space-y-5 border-l pl-6">
            {steps.map((step) => (
              <li key={step.title} className="relative">
                <span
                  className={cn(
                    "absolute top-1 -left-6 flex size-4 items-center justify-center rounded-full bg-background ring-1 ring-border",
                    step.tone,
                  )}
                >
                  {step.isLast ? (
                    <ShieldCheck className="size-3" />
                  ) : (
                    <CheckCircle2 className="size-3" />
                  )}
                </span>
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">{step.title}</p>
                  <p className="text-xs text-muted-foreground">{step.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}