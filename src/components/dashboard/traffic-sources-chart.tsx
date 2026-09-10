"use client";

import { Cell, Label, Pie, PieChart } from "recharts";

import { trafficSources } from "@/lib/mock-data";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const chartConfig = {
  organic: { label: "Organic search", color: "var(--chart-1)" },
  direct: { label: "Direct", color: "var(--chart-2)" },
  referral: { label: "Referral", color: "var(--chart-3)" },
  social: { label: "Social", color: "var(--chart-4)" },
} satisfies ChartConfig;

const total = trafficSources.reduce((sum, source) => sum + source.value, 0);

function CenterLabel({ viewBox }: { viewBox?: { cx?: number; cy?: number } }) {
  const { cx, cy } = viewBox ?? {};

  return (
    <text
      x={cx}
      y={cy}
      textAnchor="middle"
      dominantBaseline="central"
      className="fill-foreground"
    >
      <tspan
        x={cx}
        dy="-0.5em"
        className="text-2xl font-semibold tabular-nums"
      >
        {total.toLocaleString()}
      </tspan>
      <tspan
        x={cx}
        dy="1.5em"
        className="text-xs fill-muted-foreground"
      >
        visits
      </tspan>
    </text>
  );
}

export function TrafficSourcesChart({ className }: { className?: string }) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>User acquisition</CardTitle>
        <CardDescription>How new users found Bonde</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[280px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent nameKey="name" hideLabel />}
            />
            <Pie
              data={trafficSources}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              strokeWidth={4}
            >
              {trafficSources.map((source) => (
                <Cell key={source.name} fill={source.fill} />
              ))}
              <Label content={<CenterLabel />} position="center" />
            </Pie>
            <ChartLegend content={<ChartLegendContent nameKey="name" />} />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}