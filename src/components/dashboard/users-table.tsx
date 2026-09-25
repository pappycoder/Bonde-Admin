"use client";

import { cn } from "cn";
import { MoreHorizontal, RotateCcw, Search, Trash2, UserX } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import type { User, UserStatus } from "@/lib/mock-data";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const STATUS_CLASSES: Record<UserStatus, string> = {
  active: "border-transparent bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  pending:
    "border-transparent bg-amber-500/10 text-amber-600 dark:text-amber-400",
  suspended:
    "border-transparent bg-red-500/10 text-red-600 dark:text-red-400",
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function riskTone(score: number) {
  if (score >= 75) return "bg-red-500";
  if (score >= 40) return "bg-amber-500";
  return "bg-emerald-500";
}

export function UsersTable({
  users,
  title = "All users",
  description = "Monitor who is active across the platform.",
}: {
  users: User[];
  title?: string;
  description?: string;
}) {
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<User[]>(users);
  const [prevUsers, setPrevUsers] = useState<User[]>(users);

  if (prevUsers !== users) {
    setPrevUsers(users);
    setRows(users);
  }

  const filtered = rows.filter((user) =>
    `${user.name} ${user.email}`.toLowerCase().includes(query.toLowerCase()),
  );

  const handleToggleStatus = (id: string, status: UserStatus) => {
    const next: UserStatus = status === "suspended" ? "active" : "suspended";
    setRows((prev) => prev.map((u) => (u.id === id ? { ...u, status: next } : u)));
    toast.success(next === "suspended" ? "User suspended" : "User restored", {
      description: `${id} is now ${next}.`,
    });
  };

  const handleDelete = (id: string) => {
    setRows((prev) => prev.filter((u) => u.id !== id));
    toast.error("User deleted", {
      description: `${id} was removed from the platform.`,
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4 space-y-0">
        <div className="space-y-1">
          <CardTitle>{title}</CardTitle>
          {description ? (
            <CardDescription>{description}</CardDescription>
          ) : null}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search users…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="pl-8"
          />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>User</TableHead>
              <TableHead className="hidden md:table-cell">Balance</TableHead>
              <TableHead className="hidden sm:table-cell">Risk</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden lg:table-cell">
                Last active
              </TableHead>
              <TableHead className="w-16" aria-label="Actions" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((user, index) => (
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
                    href={`/users/${user.id.toLowerCase()}`}
                    className="flex items-center gap-3"
                  >
                    <Avatar className="size-8">
                      <AvatarFallback className="text-xs">
                        {user.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium">{user.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {user.email} · {user.id}
                      </span>
                    </div>
                  </Link>
                </TableCell>
                <TableCell className="hidden font-medium tabular-nums md:table-cell">
                  {currency.format(user.balance)}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn("h-full rounded-full", riskTone(user.riskScore))}
                        style={{ width: `${user.riskScore}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {user.riskScore}
                    </span>
                  </div>
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
                  {user.lastActive}
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
                        <Link href={`/users/${user.id.toLowerCase()}`}>
                          View details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleStatus(user.id, user.status)}>
                        {user.status === "suspended" ? (
                          <>
                            <RotateCcw className="size-4" />
                            Restore user
                          </>
                        ) : (
                          <>
                            <UserX className="size-4" />
                            Suspend user
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem variant="destructive" onClick={() => handleDelete(user.id)}>
                        <Trash2 className="size-4" />
                        Delete user
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}