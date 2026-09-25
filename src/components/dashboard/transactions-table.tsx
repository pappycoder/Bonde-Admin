"use client";

import { cn } from "cn";
import { MoreHorizontal } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";

import type { AdminTransaction, AdminTxStatus, AdminTxType } from "@/lib/api/admin";
import { formatMoney, shortId, timeAgo } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const STATUS_CLASSES: Record<AdminTxStatus, string> = {
  completed:
    "border-transparent bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  processing:
    "border-transparent bg-blue-500/10 text-blue-600 dark:text-blue-400",
  pending:
    "border-transparent bg-amber-500/10 text-amber-600 dark:text-amber-400",
  failed:
    "border-transparent bg-red-500/10 text-red-600 dark:text-red-400",
  flagged:
    "border-transparent bg-orange-500/10 text-orange-600 dark:text-orange-400",
};

const TYPE_LABELS: Record<AdminTxType, string> = {
  deposit: "Deposit",
  withdrawal: "Withdrawal",
  transfer: "Transfer",
  payment: "Payment",
};

/**
 * Presentational ledger grid. Phase 2 is read-only — row actions lead to the
 * detail page; review/reverse writes land in Phase 3.
 */
export function TransactionsTable({
  transactions,
}: {
  transactions: AdminTransaction[];
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="w-28">Transaction</TableHead>
          <TableHead>User</TableHead>
          <TableHead className="hidden sm:table-cell">Type</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-10" aria-label="Actions" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((tx, index) => (
          <motion.tr
            key={tx.id}
            data-slot="table-row"
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{
              duration: 0.4,
              delay: index * 0.04,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <TableCell className="font-medium tabular-nums">
              {shortId(tx.id)}
            </TableCell>
            <TableCell>
              <Link
                href={`/transactions/${tx.id}`}
                className="flex flex-col transition-colors hover:text-foreground"
              >
                <span className="font-medium">{tx.user ?? tx.userEmail ?? "—"}</span>
                <span className="text-xs text-muted-foreground">
                  {timeAgo(tx.createdAt)}
                </span>
              </Link>
            </TableCell>
            <TableCell className="hidden text-muted-foreground sm:table-cell">
              {TYPE_LABELS[tx.type]}
            </TableCell>
            <TableCell className="text-right font-medium tabular-nums">
              <span
                className={cn(
                  tx.type === "deposit"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-foreground",
                )}
              >
                {tx.type === "deposit" ? "+" : "-"}
                {formatMoney(tx.amount, tx.currency)}
              </span>
            </TableCell>
            <TableCell>
              <Badge
                variant="outline"
                className={cn(
                  "border-transparent capitalize",
                  STATUS_CLASSES[tx.status],
                )}
              >
                {tx.status}
              </Badge>
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7"
                    aria-label="Transaction actions"
                  >
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={`/transactions/${tx.id}`}>View details</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </motion.tr>
        ))}
      </TableBody>
    </Table>
  );
}