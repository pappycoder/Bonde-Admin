import { SupportTicketsTablePanel } from "@/components/dashboard/support-tickets-table-panel";
import { PageHeader } from "@/components/layout/page-header";
import { FadeIn } from "@/components/motion/fade-in";

export default function SupportPage() {
  return (
    <div className="flex flex-col gap-6">
      <FadeIn>
        <PageHeader
          title="Support"
          description="Complaints, requests and help conversations from users."
        />
      </FadeIn>

      <SupportTicketsTablePanel />
    </div>
  );
}
