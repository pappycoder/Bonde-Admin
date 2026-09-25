"use client";

import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { ErrorState, LoadingState } from "@/components/data/state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useApi } from "@/hooks/use-api";
import { listAdminAuditLogs, toActivityItems } from "@/lib/api/audit-logs";

function FeedShell({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export function ActivityFeedPanel({ className }: { className?: string }) {
  const { data, error, loading, refresh } = useApi(
    () => listAdminAuditLogs({ pageSize: 8 }),
    [],
  );

  if (loading && !data) {
    return (
      <FeedShell className={className}>
        <LoadingState />
      </FeedShell>
    );
  }

  if (error && !data) {
    return (
      <FeedShell className={className}>
        <ErrorState message={error.message} onRetry={() => void refresh()} />
      </FeedShell>
    );
  }

  const items = toActivityItems(data?.items ?? []);
  if (items.length === 0) {
    return (
      <FeedShell className={className}>
        <p className="py-12 text-center text-sm text-muted-foreground">
          No recent activity yet.
        </p>
      </FeedShell>
    );
  }

  return <ActivityFeed activities={items} className={className} />;
}