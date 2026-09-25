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
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type AppNotification,
} from "@/lib/api/notifications";
import { timeAgo } from "@/lib/format";

function unreadCount(items: AppNotification[]): number {
  return items.reduce((count, item) => (item.status === "UNREAD" ? count + 1 : count), 0);
}

export function NotificationsMenu() {
  const [open, setOpen] = useState(false);
  const { data, error, loading, refresh } = useApi(
    () => listNotifications({ pageSize: 50 }),
    [],
  );

  const items = data?.items ?? [];
  const unread = unreadCount(items);
  const badge = unread > 99 ? "99+" : String(unread);

  const handleMarkRead = async (id: string) => {
    try {
      await markNotificationRead(id);
      await refresh();
    } catch {
      toast.error("Could not mark notification as read");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      await refresh();
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
      <DropdownMenuContent align="end" className="w-[min(calc(100vw-2rem),22rem)] p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <p className="text-sm font-medium">Notifications</p>
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
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center gap-3 py-10">
              <div className="size-5 animate-spin rounded-full border-2 border-muted border-t-primary" />
              <p className="text-sm text-muted-foreground">Loading notifications…</p>
            </div>
          ) : error ? (
            <div className="p-4">
              <EmptyState
                title="Could not load notifications"
                description={error.message}
                action={
                  <Button variant="outline" size="sm" onClick={() => void refresh()}>
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
                      if (item.status === "UNREAD") void handleMarkRead(item.id);
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
                        <span className="truncate text-sm font-medium">{item.title}</span>
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}