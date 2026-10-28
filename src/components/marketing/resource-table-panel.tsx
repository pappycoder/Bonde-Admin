"use client";

import { Search, Trash2 } from "lucide-react";
import { useState, type ReactNode } from "react";

import { toast } from "sonner";
import { api } from "@/lib/api-client";
import { Checkbox } from "@/components/ui/checkbox";
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
  deletable?: boolean;
  recordLabel?: (row: T) => string;
};

/**
 * Searchable, paged table with optional confirmed deletion over a registry `list` resource. Shared by
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
  deletable = false,
  recordLabel = (row) => row.id,
}: ResourceTablePanelProps<T>) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pendingDelete, setPendingDelete] = useState<T[]>([]);
  const [deleting, setDeleting] = useState(false);
  const { data, error, loading, query, setQuery, setPage, refresh } =
    useList<T>(path, {
      pageSize: 20,
    });

  const applySearch = (value: string) => {
    setSelected(new Set());
    setSearch(value);
    setQuery((prev) => ({ ...prev, q: value.trim() || undefined, page: 1 }));
  };

  const rows = data?.items ?? [];
  const page = data?.page ?? 0;
  const totalPages = data?.totalPages ?? 0;

  const selectedRows = rows.filter((row) => selected.has(row.id));
  const toggleRow = (id: string, checked: boolean) => {
    setSelected((previous) => {
      const next = new Set(previous);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };
  const changePage = (nextPage: number) => {
    setSelected(new Set());
    setPage(nextPage);
  };
  const deleteRecords = async () => {
    if (deleting || !pendingDelete.length) return;
    setDeleting(true);
    const results = await Promise.allSettled(
      pendingDelete.map((row) => api.delete(`${path}/${row.id}`)),
    );
    const failed = pendingDelete.filter(
      (_, index) => results[index].status === "rejected",
    );
    const deletedCount = pendingDelete.length - failed.length;
    setSelected(new Set(failed.map((row) => row.id)));
    setPendingDelete(failed);
    setDeleting(false);
    if (deletedCount)
      toast.success(
        `Deleted ${deletedCount} ${deletedCount === 1 ? "record" : "records"}.`,
      );
    if (failed.length)
      toast.error(
        `Could not delete ${failed.length} ${failed.length === 1 ? "record" : "records"}. Please try again.`,
      );
    const remainingPages = Math.max(
      1,
      Math.ceil(((data?.total ?? 0) - deletedCount) / (data?.pageSize ?? 20)),
    );
    if (page > remainingPages) setPage(remainingPages);
    else await refresh();
  };

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
            {description ? (
              <CardDescription>{description}</CardDescription>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            {deletable && selectedRows.length > 0 ? (
              <Button
                variant="destructive"
                size="sm"
                disabled={deleting || loading}
                onClick={() => setPendingDelete(selectedRows)}
              >
                <Trash2 className="size-4" /> Delete selected (
                {selectedRows.length})
              </Button>
            ) : null}
            <ExportMenu
              path={path}
              title={title}
              query={query}
              disabled={loading || !!error || !data?.total}
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading && !data ? (
            <LoadingState />
          ) : error && !data ? (
            <ErrorState
              message={error.message}
              onRetry={() => void refresh()}
            />
          ) : rows.length === 0 ? (
            <EmptyState title={emptyTitle} description={emptyDescription} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  {deletable ? (
                    <TableHead className="w-10">
                      <Checkbox
                        aria-label="Select all records on this page"
                        checked={
                          selectedRows.length === rows.length
                            ? true
                            : selectedRows.length > 0
                              ? "indeterminate"
                              : false
                        }
                        disabled={deleting || loading}
                        onCheckedChange={(checked) =>
                          setSelected(
                            checked === true
                              ? new Set(rows.map((row) => row.id))
                              : new Set(),
                          )
                        }
                      />
                    </TableHead>
                  ) : null}
                  {columns.map((column) => (
                    <TableHead key={column.header} className={column.className}>
                      {column.header}
                    </TableHead>
                  ))}
                  {deletable ? (
                    <TableHead className="text-right">Actions</TableHead>
                  ) : null}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    {deletable ? (
                      <TableCell>
                        <Checkbox
                          aria-label={`Select ${recordLabel(row)}`}
                          checked={selected.has(row.id)}
                          disabled={deleting || loading}
                          onCheckedChange={(checked) =>
                            toggleRow(row.id, checked === true)
                          }
                        />
                      </TableCell>
                    ) : null}
                    {columns.map((column) => (
                      <TableCell
                        key={column.header}
                        className={column.className}
                      >
                        {column.cell(row)}
                      </TableCell>
                    ))}
                    {deletable ? (
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          aria-label={`Delete ${recordLabel(row)}`}
                          disabled={deleting || loading}
                          onClick={() => setPendingDelete([row])}
                        >
                          <Trash2 className="size-4" /> Delete
                        </Button>
                      </TableCell>
                    ) : null}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={pendingDelete.length > 0}
        onOpenChange={(open) => {
          if (!open && !deleting) setPendingDelete([]);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete{" "}
              {pendingDelete.length === 1
                ? "this record"
                : `${pendingDelete.length} records`}
              ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete.length === 1
                ? `${recordLabel(pendingDelete[0])} will be permanently removed from the waitlist.`
                : `${pendingDelete.length} selected records will be permanently removed from the waitlist.`}{" "}
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              onClick={(event) => {
                event.preventDefault();
                void deleteRecords();
              }}
            >
              {deleting
                ? "Deleting…"
                : pendingDelete.length === 1
                  ? "Delete record"
                  : "Delete records"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {totalPages > 1 ? (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || deleting || loading}
              onClick={() => changePage(page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || deleting || loading}
              onClick={() => changePage(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
