import { CircleDollarSign, ShoppingCart, Users, Wallet } from "lucide-react";

import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { OrdersTable } from "@/components/dashboard/orders-table";
import { OverviewChart } from "@/components/dashboard/overview-chart";
import { StatCard } from "@/components/dashboard/stat-card";
import { PageHeader } from "@/components/layout/page-header";
import { FadeIn } from "@/components/motion/fade-in";
import { Stagger } from "@/components/motion/stagger";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <FadeIn>
        <PageHeader
          title="Dashboard"
          description="Welcome back — here’s what is happening with your store today."
        >
          <Button size="sm">Export</Button>
        </PageHeader>
      </FadeIn>

      <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total revenue"
          value="$48,219"
          delta="+12.5%"
          trend="up"
          sublabel="vs last month"
          icon={<CircleDollarSign className="size-4" />}
        />
        <StatCard
          title="New orders"
          value="1,284"
          delta="+8.2%"
          trend="up"
          sublabel="vs last month"
          icon={<ShoppingCart className="size-4" />}
        />
        <StatCard
          title="Active customers"
          value="3,921"
          delta="+4.1%"
          trend="up"
          sublabel="vs last month"
          icon={<Users className="size-4" />}
        />
        <StatCard
          title="Refunds"
          value="$1,204"
          delta="-3.4%"
          trend="down"
          sublabel="vs last month"
          icon={<Wallet className="size-4" />}
        />
      </Stagger>

      <div className="grid gap-4 lg:grid-cols-3">
        <OverviewChart className="lg:col-span-2" />
        <ActivityFeed />
      </div>

      <OrdersTable />
    </div>
  );
}