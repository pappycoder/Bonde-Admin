import { OrdersTable } from "@/components/dashboard/orders-table";
import { PageHeader } from "@/components/layout/page-header";
import { FadeIn } from "@/components/motion/fade-in";
import { Button } from "@/components/ui/button";

export default function OrdersPage() {
  return (
    <div className="flex flex-col gap-6">
      <FadeIn>
        <PageHeader
          title="Orders"
          description="Track and manage every order in your store."
        >
          <Button size="sm">New order</Button>
        </PageHeader>
      </FadeIn>

      <OrdersTable
        title="All orders"
        description="Latest transactions across the store."
        showViewAll={false}
      />
    </div>
  );
}