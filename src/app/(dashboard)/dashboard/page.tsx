import {
  Bot,
  CircleDollarSign,
  LifeBuoy,
  Users,
} from "lucide-react";

import { ActivityFeedPanel } from "@/components/dashboard/activity-feed-panel";
import { OverviewChart } from "@/components/dashboard/overview-chart";
import { StatCard } from "@/components/dashboard/stat-card";
import { TransactionsTablePanel } from "@/components/dashboard/transactions-table-panel";
import { PageHeader } from "@/components/layout/page-header";
import { FadeIn } from "@/components/motion/fade-in";
import { Stagger } from "@/components/motion/stagger";
import { revenueData } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
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

      <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Active users"
          value="3,921"
          delta="+4.1%"
          trend="up"
          sublabel="vs last month"
          icon={<Users className="size-4" />}
        />
        <StatCard
          title="Transaction volume"
          value="$412,180"
          delta="+12.5%"
          trend="up"
          sublabel="vs last month"
          icon={<CircleDollarSign className="size-4" />}
        />
        <StatCard
          title="AI decisions"
          value="18,204"
          delta="+8.2%"
          trend="up"
          sublabel="vs last month"
          icon={<Bot className="size-4" />}
        />
        <StatCard
          title="Open tickets"
          value="26"
          delta="-5.1%"
          trend="down"
          sublabel="vs last month"
          icon={<LifeBuoy className="size-4" />}
        />
      </Stagger>

      <div className="grid gap-4 lg:grid-cols-3">
        <OverviewChart data={revenueData} className="lg:col-span-2" />
        <ActivityFeedPanel />
      </div>

      <TransactionsTablePanel pageSize={8} showViewAll />
    </div>
  );
}