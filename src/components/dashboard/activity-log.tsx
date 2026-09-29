"use client";

import { motion } from "motion/react";

import type { ActivityItem } from "@/lib/api/audit-logs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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

export function ActivityLog({
  activities,
  title = "Activity log",
  description = "Every action taken across the platform.",
}: {
  activities: ActivityItem[];
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
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
