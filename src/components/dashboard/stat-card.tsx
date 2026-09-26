"use client";

import { cn } from "cn";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";

import { StaggerItem } from "@/components/motion/stagger-item";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type StatCardProps = {
  title: string;
  value: string;
  delta?: string;
  trend?: "up" | "down";
  icon: ReactNode;
  sublabel?: string;
};

export function StatCard({
  title,
  value,
  delta,
  trend = "up",
  icon,
  sublabel,
}: StatCardProps) {
  const TrendIcon = trend === "down" ? ArrowDownRight : ArrowUpRight;

  return (
    <StaggerItem className="h-full">
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-semibold tracking-tight">{value}</div>
          <p className="mt-1 flex items-center gap-1.5 text-xs">
            {delta ? (
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 font-medium",
                  trend === "down"
                    ? "text-destructive"
                    : "text-emerald-600 dark:text-emerald-400",
                )}
              >
                <TrendIcon className="size-3.5" />
                {delta}
              </span>
            ) : null}
            {sublabel ? (
              <span className="text-muted-foreground">{sublabel}</span>
            ) : null}
          </p>
        </CardContent>
      </Card>
    </StaggerItem>
  );
}