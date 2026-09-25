import { TransactionsTablePanel } from "@/components/dashboard/transactions-table-panel";
import { PageHeader } from "@/components/layout/page-header";
import { FadeIn } from "@/components/motion/fade-in";

export default function TransactionsPage() {
  return (
    <div className="flex flex-col gap-6">
      <FadeIn>
        <PageHeader
          title="Transactions"
          description="Full ledger of every deposit, withdrawal, transfer and payment."
        />
      </FadeIn>

      <TransactionsTablePanel
        title="All transactions"
        description="Latest movement across the platform."
        pageSize={20}
        searchable
      />
    </div>
  );
}