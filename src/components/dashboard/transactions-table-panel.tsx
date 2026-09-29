"use client";

import { ArrowUpRight, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { TransactionsTable } from "@/components/dashboard/transactions-table";
import { EmptyState, ErrorState, LoadingState } from "@/components/data/state";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useList } from "@/hooks/use-list";
import type { AdminTransaction, AdminTxStatus } from "@/lib/api/admin";

/** Same vocabulary the status badges render, so the filter matches the table. */
const STATUS_FILTERS: { value: "all" | AdminTxStatus; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "completed", label: "Completed" },
  { value: "processing", label: "Processing" },
  { value: "pending", label: "Pending" },
  { value: "flagged", label: "Flagged" },
  { value: "failed", label: "Failed" },
];

/** Enum values are the raw Prisma ones; the filter layer does not case-fold. */
const TYPE_FILTERS: { value: string; label: string }[] = [
  { value: "all", label: "All types" },
  { value: "DEPOSIT", label: "Deposit" },
  { value: "WITHDRAWAL", label: "Withdrawal" },
  { value: "TRANSFER", label: "Transfer" },
  { value: "PAYMENT", label: "Payment" },
];

const THRESHOLD_FILTERS: { value: string; label: string }[] = [
  { value: "all", label: "Any threshold" },
  { value: "true", label: "Threshold flagged" },
  { value: "false", label: "Under threshold" },
];

const RECURRING_FILTERS: { value: string; label: string }[] = [
  { value: "all", label: "Any schedule" },
  { value: "true", label: "Recurring" },
  { value: "false", label: "One-off" },
];

/** Everything the server accepts via repeatable `?filter=field:value`. */
type TxFilters = {
  type: string;
  thresholdWarning: string;
  isRecurring: string;
};

const NO_FILTERS: TxFilters = {
  type: "all",
  thresholdWarning: "all",
  isRecurring: "all",
};

function filterEntries(filters: TxFilters): string[] {
  return (Object.keys(filters) as Array<keyof TxFilters>)
    .filter((key) => filters[key] !== "all")
    .map((key) => `${key}:${filters[key]}`);
}

export function TransactionsTablePanel({
  title = "Recent transactions",
  description = "Latest movement across the platform.",
  pageSize = 20,
  showViewAll = false,
  searchable = false,
}: {
  title?: string;
  description?: string;
  pageSize?: number;
  showViewAll?: boolean;
  searchable?: boolean;
}) {
  const [search, setSearch] = useState("");
  const [status, setStatus] =
    useState<(typeof STATUS_FILTERS)[number]["value"]>("all");
  const [filters, setFilters] = useState<TxFilters>(NO_FILTERS);
  const { data, error, loading, setQuery, setPage, refresh } =
    useList<AdminTransaction>("/admin/transactions", { pageSize });

  const applyFilters = (patch: Partial<TxFilters>) => {
    const next = { ...filters, ...patch };
    setFilters(next);
    const parts = filterEntries(next);
    setQuery((prev) => ({
      ...prev,
      page: 1,
      filter: parts.length ? parts : undefined,
    }));
  };

  const applySearch = (value: string) => {
    setSearch(value);
    setQuery((prev) => ({ ...prev, q: value.trim() || undefined, page: 1 }));
  };

  const applyStatus = (value: (typeof STATUS_FILTERS)[number]["value"]) => {
    setStatus(value);
    setQuery((prev) => ({
      ...prev,
      page: 1,
      uiStatus: value === "all" ? undefined : value,
    }));
  };

  const transactions = data?.items ?? [];
  const page = data?.page ?? 0;
  const totalPages = data?.totalPages ?? 0;

  return (
    <div className="flex flex-col gap-4">
      {searchable ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <form
            className="flex w-full max-w-sm items-center gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              applySearch(search);
            }}
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search transactions…"
                className="pl-8"
              />
            </div>
            <Button type="submit" size="sm">
              Search
            </Button>
          </form>
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={status}
              onValueChange={(value) => applyStatus(value as typeof status)}
            >
              <SelectTrigger size="sm" className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_FILTERS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.type}
              onValueChange={(value) => applyFilters({ type: value })}
            >
              <SelectTrigger size="sm" className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TYPE_FILTERS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.thresholdWarning}
              onValueChange={(value) =>
                applyFilters({ thresholdWarning: value })
              }
            >
              <SelectTrigger size="sm" className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {THRESHOLD_FILTERS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.isRecurring}
              onValueChange={(value) => applyFilters({ isRecurring: value })}
            >
              <SelectTrigger size="sm" className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RECURRING_FILTERS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      ) : null}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div className="space-y-1">
            <CardTitle>{title}</CardTitle>
            {description ? (
              <CardDescription>{description}</CardDescription>
            ) : null}
          </div>
          {showViewAll ? (
            <Button variant="ghost" size="sm" className="gap-1" asChild>
              <Link href="/transactions">
                View all
                <ArrowUpRight className="size-3.5" />
              </Link>
            </Button>
          ) : null}
        </CardHeader>
        <CardContent>
          {loading && !data ? (
            <LoadingState />
          ) : error && !data ? (
            <ErrorState
              message={error.message}
              onRetry={() => void refresh()}
            />
          ) : transactions.length === 0 ? (
            <EmptyState
              title="No transactions found"
              description="Try a different search or status filter."
            />
          ) : (
            <TransactionsTable
              transactions={transactions}
              onChanged={() => void refresh()}
            />
          )}
        </CardContent>
      </Card>

      {totalPages > 1 ? (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
