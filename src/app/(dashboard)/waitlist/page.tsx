import { PageHeader } from "@/components/layout/page-header";
import { WaitlistTablePanel } from "@/components/marketing/waitlist-table-panel";
import { FadeIn } from "@/components/motion/fade-in";

export default function WaitlistPage() {
  return (
    <div className="flex flex-col gap-6">
      <FadeIn>
        <PageHeader
          title="Waitlist"
          description="People who signed up for early access from the Bonde website."
        />
      </FadeIn>

      <WaitlistTablePanel />
    </div>
  );
}
