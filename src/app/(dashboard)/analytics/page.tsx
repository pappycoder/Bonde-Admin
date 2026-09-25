import { TrafficSourcesChart } from "@/components/dashboard/traffic-sources-chart";
import { WeeklyTransactionsChart } from "@/components/dashboard/weekly-transactions-chart";
import { PageHeader } from "@/components/layout/page-header";
import { FadeIn } from "@/components/motion/fade-in";
import { trafficSources, weeklyVolume } from "@/lib/mock-data";

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col gap-6">
      <FadeIn>
        <PageHeader
          title="Analytics"
          description="Understand how your platform is performing over time."
        />
      </FadeIn>

      <div className="grid gap-4 lg:grid-cols-2">
        <WeeklyTransactionsChart data={weeklyVolume} />
        <TrafficSourcesChart data={trafficSources} />
      </div>
    </div>
  );
}