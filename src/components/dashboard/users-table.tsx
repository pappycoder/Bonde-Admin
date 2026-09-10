"use client";

import { cn } from "cn";
import { Search } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";

import { users, type UserStatus } from "@/lib/mock-data";
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
  title = "All users",
  description = "Monitor who is active across the platform.",
}: {
  title?: string;
  description?: string;
}) {
  const [query, setQuery] = useState("");

  const filtered = users.filter((user) =>
    `${user.name} ${user.email}`.toLowerCase().includes(query.toLowerCase()),
  );

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
                  <Button variant="ghost" size="sm" className="h-7 gap-1 px-2" asChild>
                    <Link href={`/users/${user.id.toLowerCase()}`}>View</Link>
                  </Button>
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}