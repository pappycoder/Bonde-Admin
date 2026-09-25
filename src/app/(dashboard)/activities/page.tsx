import { ActivityLogPanel } from "@/components/dashboard/activity-log-panel";
import { PageHeader } from "@/components/layout/page-header";
import { FadeIn } from "@/components/motion/fade-in";

export default function ActivitiesPage() {
  return (
    <div className="flex flex-col gap-6">
      <FadeIn>
        <PageHeader
          title="Activities"
          description="Audit trail of every user action across the platform."
        />
      </FadeIn>

      <ActivityLogPanel />
    </div>
  );
}