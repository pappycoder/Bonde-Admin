"use client";

import { cn } from "cn";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import type { ActivityItem } from "@/lib/api/audit-logs";
import { Stagger } from "@/components/motion/stagger";
import { StaggerItem } from "@/components/motion/stagger-item";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const TONE_DOT_CLASSES = {
  primary: "bg-primary",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  muted: "bg-muted-foreground",
} as const;

export function ActivityFeed({
  activities,
  className,
}: {
  activities: ActivityItem[];
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Recent activity</CardTitle>
        <Button variant="ghost" size="sm" className="gap-1" asChild>
          <Link href="/activities">
            View all
            <ArrowUpRight className="size-3.5" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <Stagger className="space-y-1">
          {activities.map((activity) => (
            <StaggerItem key={activity.id} y={8}>
              <div className="flex items-start gap-3 rounded-lg px-2 py-2">
                <div className="relative">
                  <Avatar className="size-9">
                    <AvatarFallback className="text-xs">
                      {activity.initials}
                    </AvatarFallback>
                  </Avatar>
                  <span
                    aria-hidden
                    className={cn(
                      "absolute right-0 bottom-0 size-2 rounded-full ring-2 ring-background",
                      TONE_DOT_CLASSES[activity.tone ?? "muted"],
                    )}
                  />
                </div>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <p className="text-sm leading-snug">
                    <span className="font-medium">{activity.actor}</span>{" "}
                    <span className="text-muted-foreground">
                      {activity.action}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {activity.detail} · {activity.time}
                  </p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </CardContent>
    </Card>
  );
}