"use client";

import {
  CircleDollarSign,
  Landmark,
  MessagesSquare,
  UserPlus,
  Users,
} from "lucide-react";

import { ActivityFeedPanel } from "@/components/dashboard/activity-feed-panel";
import {
  OverviewChart,
  type RevenuePoint,
} from "@/components/dashboard/overview-chart";
import { StatCard } from "@/components/dashboard/stat-card";
import { TransactionsTablePanel } from "@/components/dashboard/transactions-table-panel";
import { ErrorState, LoadingState } from "@/components/data/state";
import { PageHeader } from "@/components/layout/page-header";
import { FadeIn } from "@/components/motion/fade-in";
import { Stagger } from "@/components/motion/stagger";
import { Button } from "@/components/ui/button";
import { useAdminStats } from "@/lib/api/admin";
import { formatMoney } from "@/lib/format";

function pctDelta(current: number, previous: number) {
  if (previous === 0) return current === 0 ? 0 : 100;
  return ((current - previous) / previous) * 100;
}

function signedPercent(current: number, previous: number) {
  const delta = pctDelta(current, previous);
  return `${delta >= 0 ? "+" : ""}${delta.toFixed(1)}%`;
}

export function DashboardView() {
  const { data, error, loading, refresh } = useAdminStats();

  return (
    <div className="flex flex-col gap-6">
      <FadeIn>
        <PageHeader
          title="Dashboard"
          description="Welcome back — here's what is happening on Bonde today."
        >
          <Button size="sm">Export report</Button>
        </PageHeader>
      </FadeIn>

      {!data ? (
        loading ? (
          <LoadingState className="py-24" />
        ) : (
          <ErrorState message={error?.message} onRetry={() => void refresh()} />
        )
      ) : (
        <>
          <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <StatCard
              title="Active users"
              value={data.totals.activeUsers.toLocaleString()}
              delta={`+${data.totals.newUsers30d.toLocaleString()}`}
              trend="up"
              sublabel={`new in 30 days · ${data.totals.users.toLocaleString()} total`}
              icon={<Users className="size-4" />}
            />
            <StatCard
              title="Transaction volume (30d)"
              value={formatMoney(data.totals.volume30d)}
              delta={signedPercent(
                Number(data.totals.volume30d),
                Number(data.totals.volumePrev30d),
              )}
              trend={pctDelta(
                Number(data.totals.volume30d),
                Number(data.totals.volumePrev30d),
              ) >= 0 ? "up" : "down"}
              sublabel="vs previous 30 days"
              icon={<CircleDollarSign className="size-4" />}
            />
            <StatCard
              title="Deposits (30d)"
              value={formatMoney(data.totals.deposits30d)}
              delta={signedPercent(
                Number(data.totals.deposits30d),
                Number(data.totals.depositsPrev30d),
              )}
              trend={pctDelta(
                Number(data.totals.deposits30d),
                Number(data.totals.depositsPrev30d),
              ) >= 0 ? "up" : "down"}
              sublabel="vs previous 30 days"
              icon={<Landmark className="size-4" />}
            />
            <StatCard
              title="New users (30d)"
              value={data.totals.newUsers30d.toLocaleString()}
              delta={signedPercent(
                data.totals.newUsers30d,
                data.totals.newUsersPrev30d,
              )}
              trend={pctDelta(
                data.totals.newUsers30d,
                data.totals.newUsersPrev30d,
              ) >= 0 ? "up" : "down"}
              sublabel="vs previous 30 days"
              icon={<UserPlus className="size-4" />}
            />
            <StatCard
              title="Open tickets"
              value={data.totals.openTickets.toLocaleString()}
              sublabel="awaiting a response"
              icon={<MessagesSquare className="size-4" />}
            />
          </Stagger>

          <div className="grid gap-4 lg:grid-cols-3">
            <OverviewChart data={toRevenuePoints(data)} className="lg:col-span-2" />
            <ActivityFeedPanel />
          </div>
        </>
      )}

      <TransactionsTablePanel pageSize={8} showViewAll />
    </div>
  );
}

function toRevenuePoints(stats: {
  revenue: Array<{ month: string; revenue: string; expenses: string }>;
}): RevenuePoint[] {
  return stats.revenue.map((point) => ({
    month: point.month,
    revenue: Number(point.revenue),
    expenses: Number(point.expenses),
  }));
}