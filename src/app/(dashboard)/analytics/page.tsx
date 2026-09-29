"use client";

import {
  PeriodSelect,
  periodLabel,
  usePeriod,
} from "@/components/dashboard/period-select";
import { TransactionsChart } from "@/components/dashboard/transactions-chart";
import { VolumeChart } from "@/components/dashboard/volume-chart";
import { ErrorState, LoadingState } from "@/components/data/state";
import { PageHeader } from "@/components/layout/page-header";
import { FadeIn } from "@/components/motion/fade-in";
import { useAdminStats } from "@/lib/api/admin";

export default function AnalyticsPage() {
  const { days, setDays } = usePeriod();
  const { data, error, loading, refresh } = useAdminStats(days);

  return (
    <div className="flex flex-col gap-6">
      <FadeIn>
        <PageHeader
          title="Analytics"
          description="Understand how your platform is performing over time."
        >
          <PeriodSelect value={days} onChange={setDays} />
        </PageHeader>
      </FadeIn>

      {!data ? (
        loading ? (
          <LoadingState className="py-24" />
        ) : (
          <ErrorState message={error?.message} onRetry={() => void refresh()} />
        )
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <TransactionsChart
            data={data.series}
            title={`Transactions · ${periodLabel(days)}`}
            description="Successful transactions per bucket"
          />
          <VolumeChart
            data={data.series}
            title={`Volume · ${periodLabel(days)}`}
            description="All successful transaction value"
          />
        </div>
      )}
    </div>
  );
}
