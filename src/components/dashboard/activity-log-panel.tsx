"use client";

import { Search } from "lucide-react";
import { useState } from "react";

import { ActivityLog } from "@/components/dashboard/activity-log";
import { ErrorState, EmptyState, LoadingState } from "@/components/data/state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useList } from "@/hooks/use-list";
import { useAdminUserNames } from "@/lib/api/admin";
import { toActivityItems, type AdminAuditLog } from "@/lib/api/audit-logs";

export function ActivityLogPanel() {
  const [search, setSearch] = useState("");
  const { data, error, loading, setQuery, setPage, refresh } = useList<AdminAuditLog>(
    "/admin/audit-logs",
    { pageSize: 20 },
  );
  const names = useAdminUserNames(
    (data?.items ?? [])
      .map((log) => log.userId)
      .filter((id): id is string => Boolean(id)),
  );

  const applySearch = (value: string) => {
    setSearch(value);
    setQuery((prev) => ({ ...prev, q: value.trim() || undefined, page: 1 }));
  };

  const items = toActivityItems(data?.items ?? [], names);
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
              placeholder="Search actions…"
              className="pl-8"
            />
          </div>
          <Button type="submit" size="sm">
            Search
          </Button>
        </form>
      </div>

      {loading && !data ? (
        <Card>
          <CardHeader />
          <CardContent>
            <LoadingState />
          </CardContent>
        </Card>
      ) : error && !data ? (
        <Card>
          <CardHeader />
          <CardContent>
            <ErrorState message={error.message} onRetry={() => void refresh()} />
          </CardContent>
        </Card>
      ) : items.length === 0 ? (
        <Card>
          <CardHeader />
          <CardContent>
            <EmptyState
              title="No activity found"
              description="Try a different search term."
            />
          </CardContent>
        </Card>
      ) : (
        <ActivityLog activities={items} />
      )}

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