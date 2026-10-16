"use client";

import { ExportMenu } from "@/components/data/export-menu";

import {
  ArrowLeftRight,
  CircleDollarSign,
  ClipboardCheck,
  Landmark,
  MessagesSquare,
  UserPlus,
  Users,
} from "lucide-react";

import { ActivityFeedPanel } from "@/components/dashboard/activity-feed-panel";
import { OverviewChart } from "@/components/dashboard/overview-chart";
import {
  PeriodSelect,
  periodLabel,
  usePeriod,
} from "@/components/dashboard/period-select";
import { StatCard } from "@/components/dashboard/stat-card";
import { TransactionsTablePanel } from "@/components/dashboard/transactions-table-panel";
import { ErrorState, LoadingState } from "@/components/data/state";
import { PageHeader } from "@/components/layout/page-header";
import { FadeIn } from "@/components/motion/fade-in";
import { Stagger } from "@/components/motion/stagger";
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
  const { days, setDays } = usePeriod();
  const { data, error, loading, refresh } = useAdminStats(days);
  const windowed = data?.windowTotals;
  const period = periodLabel(days);

  return (
    <div className="flex flex-col gap-6">
      <FadeIn>
        <PageHeader
          title="Dashboard"
          description="Welcome back — here's what is happening on Bonde today."
        >
          <div className="flex items-center gap-2">
            <PeriodSelect value={days} onChange={setDays} />
            <ExportMenu disabled={!data || loading} report={{
              title: "Platform report",
              headers: ["Period", "Deposits", "Payouts", "Volume", "Transactions"],
              rows: (data?.series ?? []).map((point) => [point.label, point.revenue, point.expenses, point.volume, point.transactions]),
              scope: data ? `${data.window.from} to ${data.window.to}` : period,
            }} />
          </div>
        </PageHeader>
      </FadeIn>

      {!data || !windowed ? (
        loading ? (
          <LoadingState className="py-24" />
        ) : (
          <ErrorState message={error?.message} onRetry={() => void refresh()} />
        )
      ) : (
        <>
          <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Active users"
              value={data.totals.activeUsers.toLocaleString()}
              delta={signedPercent(windowed.newUsers, windowed.newUsersPrev)}
              trend={windowed.newUsers >= windowed.newUsersPrev ? "up" : "down"}
              sublabel={`${windowed.newUsers.toLocaleString()} new in the ${period} · ${data.totals.users.toLocaleString()} total`}
              icon={<Users className="size-4" />}
            />
            <StatCard
              title={`Transaction volume (${period})`}
              value={formatMoney(windowed.volume)}
              delta={signedPercent(
                Number(windowed.volume),
                Number(windowed.volumePrev),
              )}
              trend={
                pctDelta(
                  Number(windowed.volume),
                  Number(windowed.volumePrev),
                ) >= 0
                  ? "up"
                  : "down"
              }
              sublabel={`vs previous ${period.replace("last ", "")}`}
              icon={<CircleDollarSign className="size-4" />}
            />
            <StatCard
              title={`Deposits (${period})`}
              value={formatMoney(windowed.deposits)}
              delta={signedPercent(
                Number(windowed.deposits),
                Number(windowed.depositsPrev),
              )}
              trend={
                pctDelta(
                  Number(windowed.deposits),
                  Number(windowed.depositsPrev),
                ) >= 0
                  ? "up"
                  : "down"
              }
              sublabel={`vs previous ${period.replace("last ", "")}`}
              icon={<Landmark className="size-4" />}
            />
            <StatCard
              title={`New users (${period})`}
              value={windowed.newUsers.toLocaleString()}
              delta={signedPercent(windowed.newUsers, windowed.newUsersPrev)}
              trend={
                pctDelta(windowed.newUsers, windowed.newUsersPrev) >= 0
                  ? "up"
                  : "down"
              }
              sublabel={`vs previous ${period.replace("last ", "")}`}
              icon={<UserPlus className="size-4" />}
            />
            <StatCard
              title={`Transactions (${period})`}
              value={windowed.transactions.toLocaleString()}
              sublabel={`${data.series.at(-1)?.transactions ?? 0} in the last day`}
              icon={<ArrowLeftRight className="size-4" />}
            />
            <StatCard
              title="Pending reviews"
              value={data.totals.pendingReviews.toLocaleString()}
              sublabel="awaiting approval"
              icon={<ClipboardCheck className="size-4" />}
            />
            <StatCard
              title="Open tickets"
              value={data.totals.openTickets.toLocaleString()}
              sublabel="awaiting a response"
              icon={<MessagesSquare className="size-4" />}
            />
          </Stagger>

          <div className="grid gap-4 lg:grid-cols-3">
            <OverviewChart
              data={data.series.map((point) => ({
                label: point.label,
                revenue: Number(point.revenue),
                expenses: Number(point.expenses),
              }))}
              description={`Deposits vs. payouts for the ${period}`}
              className="lg:col-span-2"
            />
            <ActivityFeedPanel />
          </div>
        </>
      )}

      <TransactionsTablePanel pageSize={8} showViewAll />
    </div>
  );
}
