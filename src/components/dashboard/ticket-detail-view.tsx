"use client";

import { cn } from "cn";
import {
  ArrowLeft,
  CalendarDays,
  MessagesSquare,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import type {
  AdminSupportMessage,
  SupportTicketPriority,
  SupportTicketStatus,
} from "@/lib/api/admin";
import {
  getAdminSupportTicket,
  updateAdminSupportTicketStatus,
} from "@/lib/api/admin";
import { initialsOf, timeAgo } from "@/lib/format";
import { ApiError } from "@/lib/api-client";
import { useApi } from "@/hooks/use-api";
import { TicketReply } from "@/components/dashboard/ticket-reply";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ErrorState, LoadingState } from "@/components/data/state";

const PRIORITY_CLASSES: Record<SupportTicketPriority, string> = {
  URGENT: "border-transparent bg-red-500/10 text-red-600 dark:text-red-400",
  HIGH: "border-transparent bg-amber-500/10 text-amber-600 dark:text-amber-400",
  MEDIUM: "border-transparent bg-blue-500/10 text-blue-600 dark:text-blue-400",
  LOW: "border-transparent bg-muted text-muted-foreground",
};

const STATUS_CLASSES: Record<SupportTicketStatus, string> = {
  OPEN: "border-transparent bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  PENDING: "border-transparent bg-amber-500/10 text-amber-600 dark:text-amber-400",
  RESOLVED: "border-transparent bg-primary/10 text-primary",
};

const STATUS_LABELS: Record<SupportTicketStatus, string> = {
  OPEN: "Open",
  PENDING: "Pending",
  RESOLVED: "Resolved",
};

export function TicketDetailView({ ticketId }: { ticketId: string }) {
  const { data, error, loading, refresh } = useApi(
    () => getAdminSupportTicket(ticketId),
    [ticketId],
  );
  const [statusChanging, setStatusChanging] = useState(false);

  if (loading && !data) {
    return <LoadingState className="py-24" />;
  }

  if (error && !data) {
    return (
      <ErrorState
        message={error.status === 404 ? "Ticket not found" : error.message}
        onRetry={() => void refresh()}
      />
    );
  }

  if (!data) return null;

  const ticket = data;

  async function changeStatus(status: SupportTicketStatus) {
    if (!ticket || status === ticket.status) return;
    setStatusChanging(true);
    try {
      await updateAdminSupportTicketStatus(ticket.id, status);
      toast.success(`Ticket marked ${status.toLowerCase()}`);
      void refresh();
    } catch (e) {
      toast.error(
        e instanceof ApiError ? e.message : "Could not update this ticket",
      );
    } finally {
      setStatusChanging(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="ghost" size="sm" className="w-fit gap-1" asChild>
          <Link href="/support">
            <ArrowLeft className="size-4" />
            All tickets
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={cn("border-transparent", PRIORITY_CLASSES[ticket.priority])}
          >
            {ticket.priority.toLowerCase()} priority
          </Badge>
          <Badge
            variant="outline"
            className={cn("border-transparent", STATUS_CLASSES[ticket.status])}
          >
            {STATUS_LABELS[ticket.status]}
          </Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{ticket.subject}</CardTitle>
          <CardDescription className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Link
              href={`/users/${encodeURIComponent(ticket.userId)}`}
              className="inline-flex items-center gap-1.5 font-medium text-foreground underline-offset-4 hover:underline"
            >
              <Avatar className="size-5">
                <AvatarFallback className="text-[8px]">
                  {initialsOf(ticket.user)}
                </AvatarFallback>
              </Avatar>
              {ticket.user ?? ticket.userEmail ?? "Unknown user"}
            </Link>
            <span className="inline-flex items-center gap-1.5">
              <UserRound className="size-3.5" />
              {ticket.assignee ?? "Unassigned"}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-3.5" />
              Updated {timeAgo(ticket.updatedAt)}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div className="flex justify-between gap-2 rounded-lg border bg-muted/30 px-3 py-2">
              <dt className="text-muted-foreground">Reporter</dt>
              <dd className="truncate font-medium">{ticket.userEmail}</dd>
            </div>
            <div className="flex items-center justify-between gap-2 rounded-lg border bg-muted/30 px-3 py-2">
              <dt className="text-muted-foreground">Status</dt>
              <dd>
                <Select
                  value={ticket.status}
                  disabled={statusChanging}
                  onValueChange={(value) => void changeStatus(value as SupportTicketStatus)}
                >
                  <SelectTrigger size="sm" className="h-8 w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(STATUS_LABELS) as SupportTicketStatus[]).map((value) => (
                      <SelectItem key={value} value={value}>
                        {STATUS_LABELS[value]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessagesSquare className="size-4" />
            Conversation
          </CardTitle>
          <CardDescription>Messages between the user and support.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {ticket.messages.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No messages yet. Start the conversation below.
            </p>
          ) : (
            ticket.messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                userName={ticket.user ?? ticket.userEmail}
              />
            ))
          )}
          <Separator />
          <TicketReply
            ticketId={ticket.id}
            disabled={ticket.status === "RESOLVED"}
            onSent={() => void refresh()}
          />
          {ticket.status === "RESOLVED" ? (
            <p className="text-xs text-muted-foreground">
              This ticket is resolved. Mark it open or pending to reply again.
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

function MessageBubble({
  message,
  userName,
}: {
  message: AdminSupportMessage;
  userName: string | null;
}) {
  const isUser = message.role === "USER";
  return (
    <div className={isUser ? "flex justify-end" : "flex justify-start"}>
      <div
        className={
          isUser
            ? "max-w-[80%] rounded-2xl rounded-br-md bg-primary/10 px-4 py-2.5 text-sm"
            : "max-w-[80%] rounded-2xl rounded-bl-md border bg-muted/40 px-4 py-2.5 text-sm"
        }
      >
        <div className="mb-1 flex items-center gap-2 text-xs">
          <span className="font-medium">
            {isUser ? (userName ?? "You") : "Support"}
          </span>
          <span className="text-muted-foreground">{timeAgo(message.createdAt)}</span>
        </div>
        <p className="leading-relaxed whitespace-pre-line">{message.body}</p>
      </div>
    </div>
  );
}
