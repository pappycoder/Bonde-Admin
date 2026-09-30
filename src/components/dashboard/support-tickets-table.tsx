"use client";

import { cn } from "cn";
import { motion } from "motion/react";
import Link from "next/link";

import type {
  AdminSupportTicket,
  SupportTicketPriority,
  SupportTicketStatus,
} from "@/lib/api/admin";
import { initialsOf, shortId, timeAgo } from "@/lib/format";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const PRIORITY_CLASSES: Record<SupportTicketPriority, string> = {
  LOW: "border-transparent bg-zinc-500/10 text-zinc-600 dark:text-zinc-400",
  MEDIUM: "border-transparent bg-blue-500/10 text-blue-600 dark:text-blue-400",
  HIGH: "border-transparent bg-amber-500/10 text-amber-600 dark:text-amber-400",
  URGENT: "border-transparent bg-red-500/10 text-red-600 dark:text-red-400",
};

const STATUS_CLASSES: Record<SupportTicketStatus, string> = {
  OPEN: "border-transparent bg-red-500/10 text-red-600 dark:text-red-400",
  PENDING: "border-transparent bg-amber-500/10 text-amber-600 dark:text-amber-400",
  RESOLVED: "border-transparent bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
};

export function SupportTicketsTable({ tickets }: { tickets: AdminSupportTicket[] }) {
  return (
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
            // `relative` anchors the subject link's stretched overlay, so the
            // whole row is the hit target. The hover/focus classes mirror
            // TableRow in ui/table.tsx, which these rows bypass because motion
            // owns the element.
            className="relative cursor-pointer transition-colors hover:bg-muted/50 focus-within:bg-muted/50"
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
              {shortId(ticket.id)}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2.5">
                <Avatar className="size-7">
                  <AvatarFallback className="text-[10px]">
                    {initialsOf(ticket.user)}
                  </AvatarFallback>
                </Avatar>
                <span className="whitespace-nowrap">
                  {ticket.user ?? ticket.userEmail ?? "Unknown user"}
                </span>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex flex-col">
                <Link
                  href={`/support/${encodeURIComponent(ticket.id)}`}
                  // The overlay stretches the link over the entire row.
                  // Truncation has to stay on an inner span: on the anchor
                  // `truncate` sets overflow:hidden, which would clip the
                  // overlay back down to the subject text.
                  className="after:absolute after:inset-0"
                >
                  <span className="max-w-64 truncate font-medium">
                    {ticket.subject}
                  </span>
                </Link>
                <span className="text-xs text-muted-foreground">
                  Updated {timeAgo(ticket.updatedAt)}
                </span>
              </div>
            </TableCell>
            <TableCell className="hidden sm:table-cell">
              <Badge
                variant="outline"
                className={cn("border-transparent", PRIORITY_CLASSES[ticket.priority])}
              >
                {ticket.priority.toLowerCase()}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge
                variant="outline"
                className={cn("border-transparent", STATUS_CLASSES[ticket.status])}
              >
                {ticket.status.toLowerCase()}
              </Badge>
            </TableCell>
            <TableCell className="hidden whitespace-nowrap text-muted-foreground lg:table-cell">
              {ticket.assignee ?? "Unassigned"}
            </TableCell>
          </motion.tr>
        ))}
      </TableBody>
    </Table>
  );
}
