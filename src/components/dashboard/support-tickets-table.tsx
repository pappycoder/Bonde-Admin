"use client";

import { cn } from "cn";
import { motion } from "motion/react";
import Link from "next/link";

import type {
  Ticket,
  TicketPriority,
  TicketStatus,
} from "@/lib/mock-data";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const PRIORITY_CLASSES: Record<TicketPriority, string> = {
  low: "border-transparent bg-zinc-500/10 text-zinc-600 dark:text-zinc-400",
  medium:
    "border-transparent bg-blue-500/10 text-blue-600 dark:text-blue-400",
  high: "border-transparent bg-amber-500/10 text-amber-600 dark:text-amber-400",
  urgent:
    "border-transparent bg-red-500/10 text-red-600 dark:text-red-400",
};

const STATUS_CLASSES: Record<TicketStatus, string> = {
  open: "border-transparent bg-red-500/10 text-red-600 dark:text-red-400",
  pending:
    "border-transparent bg-amber-500/10 text-amber-600 dark:text-amber-400",
  resolved:
    "border-transparent bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
};

export function SupportTicketsTable({
  tickets,
  title = "Support tickets",
  description = "Complaints, requests and help conversations.",
}: {
  tickets: Ticket[];
  title?: string;
  description?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-24">Ticket</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead className="hidden sm:table-cell">Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden lg:table-cell">Assignee</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.map((ticket, index) => (
              <motion.tr
                key={ticket.id}
                data-slot="table-row"
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.04,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <TableCell className="font-medium tabular-nums">
                  <Link
                    href={`/support/${ticket.id.toLowerCase()}`}
                    className="underline-offset-4 hover:underline"
                  >
                    {ticket.id}
                  </Link>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <Avatar className="size-7">
                      <AvatarFallback className="text-[10px]">
                        {ticket.initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="whitespace-nowrap">{ticket.user}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <Link
                      href={`/support/${ticket.id.toLowerCase()}`}
                      className="max-w-64 truncate font-medium underline-offset-4 hover:underline"
                    >
                      {ticket.subject}
                    </Link>
                    <span className="text-xs text-muted-foreground">
                      Updated {ticket.updatedAt}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge
                    variant="outline"
                    className={cn("border-transparent capitalize", PRIORITY_CLASSES[ticket.priority])}
                  >
                    {ticket.priority}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn("border-transparent capitalize", STATUS_CLASSES[ticket.status])}
                  >
                    {ticket.status}
                  </Badge>
                </TableCell>
                <TableCell className="hidden whitespace-nowrap text-muted-foreground lg:table-cell">
                  {ticket.assignee}
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}