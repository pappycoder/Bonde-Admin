"use client";

import { cn } from "cn";
import { MoreHorizontal } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";

import type { AdminUser, AdminUserStatus } from "@/lib/api/admin";
import { formatMoney, initialsOf, shortId, timeAgo } from "@/lib/format";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const STATUS_CLASSES: Record<AdminUserStatus, string> = {
  active: "border-transparent bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  pending:
    "border-transparent bg-amber-500/10 text-amber-600 dark:text-amber-400",
  suspended:
    "border-transparent bg-red-500/10 text-red-600 dark:text-red-400",
};

/**
 * Presentational users grid. Phase 2 is read-only — row actions lead to the
 * detail page; suspend/restore writes land in Phase 3.
 */
export function UsersTable({ users }: { users: AdminUser[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead>User</TableHead>
          <TableHead className="hidden md:table-cell">Balance</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="hidden lg:table-cell">Last updated</TableHead>
          <TableHead className="w-16" aria-label="Actions" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user, index) => (
          <motion.tr
            key={user.id}
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
            <TableCell>
              <Link
                href={`/users/${user.id}`}
                className="flex items-center gap-3"
              >
                <Avatar className="size-8">
                  <AvatarFallback className="text-xs">
                    {initialsOf(user.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-medium">{user.fullName}</span>
                  <span className="text-xs text-muted-foreground">
                    {user.email} · {shortId(user.id)}
                  </span>
                </div>
              </Link>
            </TableCell>
            <TableCell className="hidden font-medium tabular-nums md:table-cell">
              {formatMoney(user.balance, user.currency)}
            </TableCell>
            <TableCell>
              <Badge
                variant="outline"
                className={cn(
                  "border-transparent capitalize",
                  STATUS_CLASSES[user.status],
                )}
              >
                {user.status}
              </Badge>
            </TableCell>
            <TableCell className="hidden whitespace-nowrap text-muted-foreground lg:table-cell">
              {timeAgo(user.lastActiveAt)}
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7"
                    aria-label="User actions"
                  >
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={`/users/${user.id}`}>View details</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </motion.tr>
        ))}
      </TableBody>
    </Table>
  );
}