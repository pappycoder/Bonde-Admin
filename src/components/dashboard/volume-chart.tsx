"use client";

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { formatMoney } from "@/lib/format";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const chartConfig = {
  volume: { label: "Volume", color: "var(--chart-1)" },
} satisfies ChartConfig;

/** One bucket of the admin series — amounts arrive as 2-decimal strings. */
export type VolumePoint = {
  label: string;
  volume: string;
};

export function VolumeChart({
  data,
  title,
  description,
  className,
}: {
  data: VolumePoint[];
  title: string;
  description: string;
  className?: string;
}) {
  const points = data.map((point) => ({
    label: point.label,
    volume: Number(point.volume),
  }));

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[280px] w-full"
        >
          <AreaChart data={points} margin={{ left: 12, right: 12 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel indicator="dot" />}
              formatter={(value) => formatMoney(Number(value))}
            />
            <defs>
              <linearGradient id="fillVolume" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-volume)"
                  stopOpacity={0.9}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-volume)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <Area
              dataKey="volume"
              type="natural"
              fill="url(#fillVolume)"
              stroke="var(--color-volume)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
