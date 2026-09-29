"use client";

import { ShieldCheck, UserCheck, UserX, Users } from "lucide-react";

import {
  PeriodSelect,
  periodLabel,
  usePeriod,
} from "@/components/dashboard/period-select";
import { UsersTablePanel } from "@/components/dashboard/users-table-panel";
import { StatCard } from "@/components/dashboard/stat-card";
import { ErrorState, LoadingState } from "@/components/data/state";
import { PageHeader } from "@/components/layout/page-header";
import { FadeIn } from "@/components/motion/fade-in";
import { Stagger } from "@/components/motion/stagger";
import { useAdminStats } from "@/lib/api/admin";

function signedPercent(current: number, previous: number) {
  if (previous === 0) return current === 0 ? "0.0%" : "100.0%";
  const delta = ((current - previous) / previous) * 100;
  return `${delta >= 0 ? "+" : ""}${delta.toFixed(1)}%`;
}

export default function UsersPage() {
  const { days, setDays } = usePeriod();
  const { data, error, loading, refresh } = useAdminStats(days);
  const totals = data?.totals;
  const windowed = data?.windowTotals;

  return (
    <div className="flex flex-col gap-6">
      <FadeIn>
        <PageHeader
          title="Users"
          description="Monitor every user on the Bonde platform."
        >
          <PeriodSelect value={days} onChange={setDays} />
        </PageHeader>
      </FadeIn>

      {!totals || !windowed ? (
        loading ? (
          <LoadingState className="py-16" />
        ) : (
          <ErrorState message={error?.message} onRetry={() => void refresh()} />
        )
      ) : (
        <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total users"
            value={totals.users.toLocaleString()}
            delta={signedPercent(windowed.newUsers, windowed.newUsersPrev)}
            trend={windowed.newUsers >= windowed.newUsersPrev ? "up" : "down"}
            sublabel={`${windowed.newUsers.toLocaleString()} new in the ${periodLabel(days)}`}
            icon={<Users className="size-4" />}
          />
          <StatCard
            title="Active"
            value={totals.activeUsers.toLocaleString()}
            sublabel="verified and onboarded"
            icon={<UserCheck className="size-4" />}
          />
          <StatCard
            title="Pending verification"
            value={totals.pendingUsers.toLocaleString()}
            sublabel="awaiting email or phone"
            icon={<ShieldCheck className="size-4" />}
          />
          <StatCard
            title="Suspended"
            value={totals.suspendedUsers.toLocaleString()}
            sublabel="account and wallet inactive"
            icon={<UserX className="size-4" />}
          />
        </Stagger>
      )}

      <UsersTablePanel />
    </div>
  );
}
