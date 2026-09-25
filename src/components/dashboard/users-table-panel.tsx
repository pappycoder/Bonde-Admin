"use client";

import { Search } from "lucide-react";
import { useState } from "react";

import { UsersTable } from "@/components/dashboard/users-table";
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
import type { AdminUser, AdminUserStatus } from "@/lib/api/admin";

const STATUS_OPTIONS: { value: AdminUserStatus | "all"; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "suspended", label: "Suspended" },
];

export function UsersTablePanel({
  title = "All users",
  description = "Monitor who is active across the platform.",
}: {
  title?: string;
  description?: string;
}) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<AdminUserStatus | "all">("all");
  const { data, error, loading, setQuery, setPage, refresh } = useList<AdminUser>(
    "/admin/users",
    { pageSize: 20 },
  );

  const applySearch = (value: string) => {
    setSearch(value);
    setQuery((prev) => ({ ...prev, q: value.trim() || undefined, page: 1 }));
  };

  const applyStatus = (value: AdminUserStatus | "all") => {
    setStatus(value);
    setQuery((prev) => ({
      ...prev,
      page: 1,
      filter: value === "all" ? undefined : [`status:${value}`],
    }));
  };

  const users = data?.items ?? [];
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
              placeholder="Search users…"
              className="pl-8"
            />
          </div>
          <Button type="submit" size="sm">
            Search
          </Button>
        </form>
        <Select value={status} onValueChange={(value) => applyStatus(value as AdminUserStatus | "all")}>
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
          ) : users.length === 0 ? (
            <EmptyState
              title="No users found"
              description="Try a different search or status filter."
            />
          ) : (
            <UsersTable users={users} />
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