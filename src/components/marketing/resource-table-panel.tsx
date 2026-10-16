"use client";

import { Search } from "lucide-react";
import { useState, type ReactNode } from "react";

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ExportMenu } from "@/components/data/export-menu";
import { useList } from "@/hooks/use-list";

export interface Column<T> {
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
}

type ResourceTablePanelProps<T extends { id: string }> = {
  /** Registry resource path, e.g. `/admin/waitlist`. */
  path: string;
  title: string;
  description?: string;
  searchPlaceholder: string;
  emptyTitle: string;
  emptyDescription?: string;
  columns: Column<T>[];
};

/**
 * Read-only, searchable, paged table over a registry `list` resource. Shared by
 * the two public-website inboxes (waitlist + contacts) so both lists behave the
 * same as the rest of the console.
 */
export function ResourceTablePanel<T extends { id: string }>({
  path,
  title,
  description,
  searchPlaceholder,
  emptyTitle,
  emptyDescription,
  columns,
}: ResourceTablePanelProps<T>) {
  const [search, setSearch] = useState("");
  const { data, error, loading, query, setQuery, setPage, refresh } = useList<T>(path, {
    pageSize: 20,
  });

  const applySearch = (value: string) => {
    setSearch(value);
    setQuery((prev) => ({ ...prev, q: value.trim() || undefined, page: 1 }));
  };

  const rows = data?.items ?? [];
  const page = data?.page ?? 0;
  const totalPages = data?.totalPages ?? 0;

  return (
    <div className="flex flex-col gap-4">
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
            placeholder={searchPlaceholder}
            className="pl-8"
          />
        </div>
        <Button type="submit" size="sm">
          Search
        </Button>
      </form>

      <Card>
        <CardHeader className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <CardTitle>{title}</CardTitle>
            {description ? <CardDescription>{description}</CardDescription> : null}
          </div>
          <ExportMenu
            path={path}
            title={title}
            query={query}
            disabled={loading || !!error || !data?.total}
          />
        </CardHeader>
        <CardContent>
          {loading && !data ? (
            <LoadingState />
          ) : error && !data ? (
            <ErrorState message={error.message} onRetry={() => void refresh()} />
          ) : rows.length === 0 ? (
            <EmptyState title={emptyTitle} description={emptyDescription} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((column) => (
                    <TableHead key={column.header} className={column.className}>
                      {column.header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    {columns.map((column) => (
                      <TableCell key={column.header} className={column.className}>
                        {column.cell(row)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
