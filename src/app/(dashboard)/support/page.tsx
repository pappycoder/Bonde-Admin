import { SupportTicketsTable } from "@/components/dashboard/support-tickets-table";
import { PageHeader } from "@/components/layout/page-header";
import { FadeIn } from "@/components/motion/fade-in";
import { Button } from "@/components/ui/button";

export default function SupportPage() {
  return (
    <div className="flex flex-col gap-6">
      <FadeIn>
        <PageHeader
          title="Support"
          description="Complaints, requests and help conversations from users."
        >
          <Button size="sm">New response</Button>
        </PageHeader>
      </FadeIn>

      <SupportTicketsTable />
    </div>
  );
}