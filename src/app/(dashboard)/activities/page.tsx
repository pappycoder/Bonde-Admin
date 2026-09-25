import { ActivityLog } from "@/components/dashboard/activity-log";
import { PageHeader } from "@/components/layout/page-header";
import { FadeIn } from "@/components/motion/fade-in";

import { activities } from "@/lib/mock-data";

export default function ActivitiesPage() {
  return (
    <div className="flex flex-col gap-6">
      <FadeIn>
        <PageHeader
          title="Activities"
          description="Audit trail of every user action across the platform."
        />
      </FadeIn>

      <ActivityLog activities={activities} />
    </div>
  );
}