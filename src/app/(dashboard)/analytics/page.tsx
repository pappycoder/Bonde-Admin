import { TrafficSourcesChart } from "@/components/dashboard/traffic-sources-chart";
import { WeeklyOrdersChart } from "@/components/dashboard/weekly-orders-chart";
import { PageHeader } from "@/components/layout/page-header";
import { FadeIn } from "@/components/motion/fade-in";

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col gap-6">
      <FadeIn>
        <PageHeader
          title="Analytics"
          description="Understand how your store is performing over time."
        />
      </FadeIn>

      <div className="grid gap-4 lg:grid-cols-2">
        <WeeklyOrdersChart />
        <TrafficSourcesChart />
      </div>
    </div>
  );
}