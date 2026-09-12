import { ArrowLeft, CalendarDays, MessagesSquare, UserRound } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { tickets } from "@/lib/mock-data";
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
import { Separator } from "@/components/ui/separator";

type PageProps = {
  params: Promise<{ id: string }>;
};

const PRIORITY_CLASSES: Record<string, string> = {
  urgent: "border-transparent bg-red-500/10 text-red-600 dark:text-red-400",
  high: "border-transparent bg-amber-500/10 text-amber-600 dark:text-amber-400",
  medium: "border-transparent bg-blue-500/10 text-blue-600 dark:text-blue-400",
  low: "border-transparent bg-muted text-muted-foreground",
};

const STATUS_CLASSES: Record<string, string> = {
  open: "border-transparent bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  pending: "border-transparent bg-amber-500/10 text-amber-600 dark:text-amber-400",
  resolved: "border-transparent bg-primary/10 text-primary",
};

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const ticket = tickets.find(
    (t) => t.id.toLowerCase() === id.toLowerCase(),
  );
  return { title: ticket ? `${ticket.id} · Support` : "Ticket not found" };
}

export default async function TicketDetailPage({ params }: PageProps) {
  const { id } = await params;
  const ticket = tickets.find((t) => t.id.toLowerCase() === id.toLowerCase());

  if (!ticket) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="ghost" size="sm" className="gap-1 w-fit" asChild>
          <Link href="/support">
            <ArrowLeft className="size-4" />
            All tickets
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={PRIORITY_CLASSES[ticket.priority]}
          >
            {ticket.priority} priority
          </Badge>
          <Badge
            variant="outline"
            className={STATUS_CLASSES[ticket.status]}
          >
            {ticket.status}
          </Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{ticket.subject}</CardTitle>
          <CardDescription className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Link
              href={`/users/${ticket.userId.toLowerCase()}`}
              className="inline-flex items-center gap-1.5 font-medium text-foreground underline-offset-4 hover:underline"
            >
              <Avatar className="size-5">
                <AvatarFallback className="text-[8px]">
                  {ticket.initials}
                </AvatarFallback>
              </Avatar>
              {ticket.user}
            </Link>
            <span className="inline-flex items-center gap-1.5">
              <UserRound className="size-3.5" />
              {ticket.assignee}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-3.5" />
              Updated {ticket.updatedAt}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div className="flex justify-between gap-2 rounded-lg border bg-muted/30 px-3 py-2">
              <dt className="text-muted-foreground">Ticket</dt>
              <dd className="font-medium tabular-nums">{ticket.id}</dd>
            </div>
            <div className="flex justify-between gap-2 rounded-lg border bg-muted/30 px-3 py-2">
              <dt className="text-muted-foreground">Reporter</dt>
              <dd className="font-medium">{ticket.userId}</dd>
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
          {ticket.messages.map((message, index) => {
            const isUser = message.from === "user";
            return (
              <div
                key={index}
                className={isUser ? "flex justify-end" : "flex justify-start"}
              >
                <div
                  className={
                    isUser
                      ? "max-w-[80%] rounded-2xl rounded-br-md bg-primary/10 px-4 py-2.5 text-sm"
                      : "max-w-[80%] rounded-2xl rounded-bl-md border bg-muted/40 px-4 py-2.5 text-sm"
                  }
                >
                  <div className="mb-1 flex items-center gap-2 text-xs">
                    <span className="font-medium">
                      {isUser ? ticket.user : "Support"}
                    </span>
                    <span className="text-muted-foreground">{message.time}</span>
                  </div>
                  <p className="leading-relaxed">{message.text}</p>
                </div>
              </div>
            );
          })}
          <Separator />
          <TicketReply ticketId={ticket.id} />
        </CardContent>
      </Card>
    </div>
  );
}