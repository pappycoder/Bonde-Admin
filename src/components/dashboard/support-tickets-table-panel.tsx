"use client";

import { Search } from "lucide-react";
import { useState } from "react";

import { SupportTicketsTable } from "@/components/dashboard/support-tickets-table";
import { EmptyState, ErrorState, LoadingState } from "@/components/data/state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useList } from "@/hooks/use-list";
import type { AdminSupportTicket, SupportTicketStatus } from "@/lib/api/admin";

const STATUS_OPTIONS: { value: SupportTicketStatus | "all"; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "OPEN", label: "Open" },
  { value: "PENDING", label: "Pending" },
  { value: "RESOLVED", label: "Resolved" },
];

export function SupportTicketsTablePanel({
  title = "All tickets",
  description = "Complaints, requests and help conversations.",
}: {
  title?: string;
  description?: string;
}) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<SupportTicketStatus | "all">("all");
  const { data, error, loading, setQuery, setPage, refresh } = useList<AdminSupportTicket>(
    "/admin/support-tickets",
    { pageSize: 20 },
  );

  const applySearch = (value: string) => {
    setSearch(value);
    setQuery((prev) => ({ ...prev, q: value.trim() || undefined, page: 1 }));
  };

  const applyStatus = (value: SupportTicketStatus | "all") => {
    setStatus(value);
    setQuery((prev) => ({ ...prev, page: 1, status: value === "all" ? undefined : value }));
  };

  const tickets = data?.items ?? [];
  const page = data?.page ?? 0;
  const totalPages = data?.totalPages ?? 0;

  return (
    <div className="flex flex-col gap-4">
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
              placeholder="Search tickets…"
              className="pl-8"
            />
          </div>
          <Button type="submit" size="sm">
            Search
          </Button>
        </form>
        <Select
          value={status}
          onValueChange={(value) => applyStatus(value as SupportTicketStatus | "all")}
        >
          <SelectTrigger size="sm" className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </CardHeader>
        <CardContent>
          {loading && !data ? (
            <LoadingState />
          ) : error && !data ? (
            <ErrorState message={error.message} onRetry={() => void refresh()} />
          ) : tickets.length === 0 ? (
            <EmptyState
              title="No tickets found"
              description="Try a different search or status filter."
            />
          ) : (
            <SupportTicketsTable tickets={tickets} />
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
