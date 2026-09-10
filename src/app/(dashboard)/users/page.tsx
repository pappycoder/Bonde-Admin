import { UsersTable } from "@/components/dashboard/users-table";
import { PageHeader } from "@/components/layout/page-header";
import { FadeIn } from "@/components/motion/fade-in";
import { Stagger } from "@/components/motion/stagger";
import { StatCard } from "@/components/dashboard/stat-card";
import { Activity, ShieldCheck, UserCheck, UserX } from "lucide-react";

export default function UsersPage() {
  return (
    <div className="flex flex-col gap-6">
      <FadeIn>
        <PageHeader
          title="Users"
          description="Monitor every user on the Bonde platform."
        />
      </FadeIn>

      <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total users"
          value="4,847"
          delta="+3.2%"
          trend="up"
          sublabel="vs last month"
          icon={<UserCheck className="size-4" />}
        />
        <StatCard
          title="Active now"
          value="214"
          delta="+11.0%"
          trend="up"
          sublabel="live session"
          icon={<Activity className="size-4" />}
        />
        <StatCard
          title="KYC pending"
          value="38"
          delta="+6.4%"
          trend="up"
          sublabel="awaiting review"
          icon={<ShieldCheck className="size-4" />}
        />
        <StatCard
          title="Suspended"
          value="7"
          delta="-2.0%"
          trend="down"
          sublabel="vs last month"
          icon={<UserX className="size-4" />}
        />
      </Stagger>

      <UsersTable />
    </div>
  );
}