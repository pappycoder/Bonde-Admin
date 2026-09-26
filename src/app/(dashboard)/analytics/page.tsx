"use client";

import { TrafficSourcesChart } from "@/components/dashboard/traffic-sources-chart";
import { WeeklyTransactionsChart } from "@/components/dashboard/weekly-transactions-chart";
import { ErrorState, LoadingState } from "@/components/data/state";
import { PageHeader } from "@/components/layout/page-header";
import { FadeIn } from "@/components/motion/fade-in";
import { useAdminStats } from "@/lib/api/admin";
import { trafficSources } from "@/lib/mock-data";

export default function AnalyticsPage() {
  const { data, error, loading, refresh } = useAdminStats();

  return (
    <div className="flex flex-col gap-6">
      <FadeIn>
        <PageHeader
          title="Analytics"
          description="Understand how your platform is performing over time."
        />
      </FadeIn>

      {!data ? (
        loading ? (
          <LoadingState className="py-24" />
        ) : (
          <ErrorState message={error?.message} onRetry={() => void refresh()} />
        )
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <WeeklyTransactionsChart data={data.weekly} />
          <TrafficSourcesChart data={trafficSources} />
        </div>
      )}
    </div>
  );
}