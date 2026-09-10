"use client";

import { cn } from "cn";
import { motion } from "motion/react";

import { activities } from "@/lib/mock-data";
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

const STATUS_CLASSES: Record<string, string> = {
  approved:
    "border-transparent bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  processing:
    "border-transparent bg-blue-500/10 text-blue-600 dark:text-blue-400",
  pending:
    "border-transparent bg-amber-500/10 text-amber-600 dark:text-amber-400",
  flagged:
    "border-transparent bg-orange-500/10 text-orange-600 dark:text-orange-400",
  denied:
    "border-transparent bg-red-500/10 text-red-600 dark:text-red-400",
  open: "border-transparent bg-red-500/10 text-red-600 dark:text-red-400",
};

export function ActivityLog({
  title = "Activity log",
  description = "Every action taken across the platform.",
}: {
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
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead className="hidden md:table-cell">Device</TableHead>
              <TableHead className="hidden lg:table-cell">IP address</TableHead>
              <TableHead className="hidden sm:table-cell">Time</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.map((activity, index) => (
              <motion.tr
                key={activity.id}
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
                  <div className="flex items-center gap-2.5">
                    <Avatar className="size-8">
                      <AvatarFallback className="text-xs">
                        {activity.initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="whitespace-nowrap font-medium">
                      {activity.actor}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{activity.action}</span>
                    <span className="text-xs text-muted-foreground">
                      {activity.detail}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="hidden whitespace-nowrap text-muted-foreground md:table-cell">
                  {activity.device}
                </TableCell>
                <TableCell className="hidden font-mono text-xs text-muted-foreground lg:table-cell">
                  {activity.ip}
                </TableCell>
                <TableCell className="hidden whitespace-nowrap text-muted-foreground sm:table-cell">
                  {activity.time}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(
                      "border-transparent capitalize",
                      STATUS_CLASSES[activity.status ?? "pending"],
                    )}
                  >
                    {activity.status ?? "pending"}
                  </Badge>
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}