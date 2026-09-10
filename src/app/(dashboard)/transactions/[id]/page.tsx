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
import { notFound } from "next/navigation";

import { transactions, type TransactionType } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const TYPE_META: Record<TransactionType, { label: string; icon: typeof Banknote }> = {
  deposit: { label: "Deposit", icon: Landmark },
  withdrawal: { label: "Withdrawal", icon: Banknote },
  transfer: { label: "Transfer", icon: Link2 },
  payment: { label: "Payment", icon: CreditCard },
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const tx = transactions.find((t) => t.id.toLowerCase() === id.toLowerCase());
  return { title: tx ? `${tx.id} · Transactions` : "Transaction not found" };
}

export default async function TransactionDetailPage({ params }: PageProps) {
  const { id } = await params;
  const tx = transactions.find((t) => t.id.toLowerCase() === id.toLowerCase());

  if (!tx) notFound();

  const meta = TYPE_META[tx.type];
  const Icon = meta.icon;
  const isCredit = tx.type === "deposit";

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
                {tx.id}
                <Badge
                  variant="outline"
                  className="border-transparent bg-primary/10 capitalize text-primary"
                >
                  {tx.status}
                </Badge>
              </CardTitle>
              <CardDescription>
                {tx.date} · via {tx.method}
              </CardDescription>
            </div>
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon className="size-5" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-muted-foreground">
              {isCredit ? "Deposited" : "Moved"} by{" "}
              <Link
                href={`/users/${tx.userId.toLowerCase()}`}
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                {tx.user}
              </Link>
            </p>
            <p
              className={cn(
                "mt-1 text-3xl font-semibold tabular-nums tracking-tight",
                isCredit ? "text-emerald-600 dark:text-emerald-400" : "text-foreground",
              )}
            >
              {isCredit ? "+" : "-"}
              {currency.format(tx.amount)}
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
              <span className="text-muted-foreground">Reference</span>
              <span className="font-mono text-xs">{tx.id.toLowerCase()}</span>
            </div>
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
            {[
              {
                title: "Initiated",
                detail: `${tx.user} started the ${meta.label.toLowerCase()} via ${tx.method}.`,
                tone: "text-primary",
              },
              {
                title: "Risk check",
                detail: "AI risk engine scored and approved the operation.",
                tone: "text-primary",
              },
              {
                title: `${tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}`,
                detail:
                  tx.status === "flagged"
                    ? "Flagged for manual review by the fraud team."
                    : "The transaction reached its final settlement state.",
                tone: tx.status === "flagged" ? "text-amber-500" : "text-primary",
                isLast: true,
              },
            ].map((step) => (
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