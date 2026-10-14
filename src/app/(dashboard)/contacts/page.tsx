import { PageHeader } from "@/components/layout/page-header";
import { ContactsTablePanel } from "@/components/marketing/contacts-table-panel";
import { FadeIn } from "@/components/motion/fade-in";

export default function ContactsPage() {
  return (
    <div className="flex flex-col gap-6">
      <FadeIn>
        <PageHeader
          title="Contacts"
          description="Messages submitted through the Bonde website contact form."
        />
      </FadeIn>

      <ContactsTablePanel />
    </div>
  );
}
