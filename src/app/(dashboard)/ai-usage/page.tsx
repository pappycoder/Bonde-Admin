import { AiUsageView } from "@/components/dashboard/ai-usage-view";

export default async function AiUsagePage({
  searchParams,
}: {
  searchParams: Promise<{ userId?: string }>;
}) {
  const { userId } = await searchParams;
  const validId =
    userId &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      userId,
    )
      ? userId
      : undefined;
  return <AiUsageView key={validId ?? "all"} initialUserId={validId} />;
}
