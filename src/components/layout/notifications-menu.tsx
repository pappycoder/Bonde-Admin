"use client";

import { Bell, Check, CheckCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/data/state";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useApi } from "@/hooks/use-api";
import {
  countUnreadNotifications,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/api/notifications";
import { timeAgo } from "@/lib/format";

const PAGE_SIZE = 20;

export function NotificationsMenu() {
  const [open, setOpen] = useState(false);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [page, setPage] = useState(1);
  const { data, error, loading, refresh } = useApi(() => {
    const query: Parameters<typeof listNotifications>[0] = {
      pageSize: PAGE_SIZE,
      page,
    };
    if (unreadOnly) query.filter = "status:UNREAD";
    return listNotifications(query);
  }, [page, unreadOnly]);
  const { data: unreadTotal, refresh: refreshUnread } = useApi(
    countUnreadNotifications,
    [],
  );

  const items = data?.items ?? [];
  const unread = unreadTotal ?? 0;
  const badge = unread > 99 ? "99+" : String(unread);
  const totalPages = data?.totalPages ?? 1;

  const reload = async () => {
    await Promise.all([refresh(), refreshUnread()]);
  };

  const handleMarkRead = async (id: string) => {
    try {
      await markNotificationRead(id);
      await reload();
    } catch {
      toast.error("Could not mark notification as read");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setPage(1);
      await reload();
    } catch {
      toast.error("Could not update notifications");
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative size-8"
          aria-label={`Notifications${unread > 0 ? ` (${unread} unread)` : ""}`}
        >
          <Bell className="size-4" />
          {unread > 0 ? (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
              {badge}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[min(calc(100vw-2rem),22rem)] p-0"
      >
        <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
          <p className="text-sm font-medium">Notifications</p>
          <div className="flex items-center gap-1">
            <Button
              variant={unreadOnly ? "secondary" : "ghost"}
              size="sm"
              className="h-7 gap-1 px-2 text-xs"
              onClick={() => {
                setUnreadOnly((value) => !value);
                setPage(1);
              }}
            >
              Unread
            </Button>
            {unread > 0 ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1 px-2 text-xs text-muted-foreground"
                onClick={handleMarkAllRead}
              >
                <CheckCheck className="size-3.5" />
                Mark all read
              </Button>
            ) : null}
          </div>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center gap-3 py-10">
              <div className="size-5 animate-spin rounded-full border-2 border-muted border-t-primary" />
              <p className="text-sm text-muted-foreground">
                Loading notifications…
              </p>
            </div>
          ) : error ? (
            <div className="p-4">
              <EmptyState
                title="Could not load notifications"
                description={error.message}
                action={
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void refresh()}
                  >
                    Retry
                  </Button>
                }
              />
            </div>
          ) : items.length === 0 ? (
            <div className="p-4">
              <EmptyState
                title="You're all caught up"
                description="No notifications right now."
              />
            </div>
          ) : (
            <ul className="divide-y">
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => {
                      if (item.status === "UNREAD")
                        void handleMarkRead(item.id);
                    }}
                    className={cn(
                      "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50",
                      item.status === "UNREAD" ? "bg-muted/30" : "opacity-75",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-lg",
                        item.status === "UNREAD"
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      <Check className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1 space-y-0.5">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className="truncate text-sm font-medium">
                          {item.title}
                        </span>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {timeAgo(item.createdAt)}
                        </span>
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {item.content}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        {totalPages > 1 ? (
          <div className="flex items-center justify-between border-t px-4 py-2">
            <p className="text-xs text-muted-foreground">
              Page {page} of {totalPages}
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs"
                disabled={page <= 1 || loading}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 text-xs"
                disabled={page >= totalPages || loading}
                onClick={() => setPage((value) => value + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
