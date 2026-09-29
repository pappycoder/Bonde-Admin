"use client";

import { Search } from "lucide-react";
import { useEffect, useState } from "react";

import { ActivityLog } from "@/components/dashboard/activity-log";
import { ErrorState, EmptyState, LoadingState } from "@/components/data/state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useList } from "@/hooks/use-list";
import { useAdminUserNames } from "@/lib/api/admin";
import { toActivityItems, type AdminAuditLog } from "@/lib/api/audit-logs";

/**
 * `entityType` is a closed set written by the audited services, so it is worth
 * an exact picker. `action` stays free-form (`<domain>.<verb>`) and is filtered
 * with the implicit contains match the API applies to string fields.
 */
const ENTITY_TYPES = [
  "account",
  "auth",
  "auth-session",
  "biometric_device",
  "broadcast",
  "card",
  "chat",
  "mail",
  "message",
  "passcode",
  "profile",
  "support-ticket",
  "transaction",
  "transaction_approval",
  "transaction_threshold",
  "user",
  "user_invite",
  "virtual_account",
  "wallet",
];

export function ActivityLogPanel() {
  const [search, setSearch] = useState("");
  const [entityType, setEntityType] = useState("all");
  const [action, setAction] = useState("");
  const [actionQuery, setActionQuery] = useState("");
  const { data, error, loading, setQuery, setPage, refresh } =
    useList<AdminAuditLog>("/admin/audit-logs", { pageSize: 20 });
  const names = useAdminUserNames(
    (data?.items ?? [])
      .map((log) => log.userId)
      .filter((id): id is string => Boolean(id)),
  );

  const applySearch = (value: string) => {
    setSearch(value);
    setQuery((prev) => ({ ...prev, q: value.trim() || undefined, page: 1 }));
  };

  const applyFilters = (next: { entityType?: string; action?: string }) => {
    const merged = { entityType, action: actionQuery, ...next };
    if (next.entityType !== undefined) setEntityType(next.entityType);
    if (next.action !== undefined) setActionQuery(next.action);
    const parts = [
      merged.entityType === "all" ? null : `entityType:${merged.entityType}`,
      merged.action.trim() ? `action:${merged.action.trim()}` : null,
    ].filter((part): part is string => part !== null);
    setQuery((prev) => ({
      ...prev,
      page: 1,
      filter: parts.length ? parts : undefined,
    }));
  };

  // Debounced so each keystroke does not refetch the audit list. Bailing when
  // the box already matches what was applied keeps the initial render (and the
  // settle after a submit) from issuing a redundant request.
  useEffect(() => {
    if (action === actionQuery) return;
    const timer = setTimeout(() => applyFilters({ action }), 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [action, actionQuery]);

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
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={entityType}
            onValueChange={(value) => applyFilters({ entityType: value })}
          >
            <SelectTrigger size="sm" className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {ENTITY_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            value={action}
            onChange={(event) => setAction(event.target.value)}
            placeholder="Action contains…"
            aria-label="Filter by action substring"
            className="h-8 w-48"
          />
        </div>
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
            <ErrorState
              message={error.message}
              onRetry={() => void refresh()}
            />
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
