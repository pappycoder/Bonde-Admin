"use client";

import { useState } from "react";
import { Laptop, Loader2, Smartphone } from "lucide-react";
import { toast } from "sonner";

import { parseDevice } from "@/lib/api/audit-logs";
import {
  getAuthSessions,
  revokeAuthSession,
  type AuthSession,
} from "@/lib/api/security";
import { ApiError } from "@/lib/api-client";
import { timeAgo } from "@/lib/format";
import { useApi } from "@/hooks/use-api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ErrorState, LoadingState } from "@/components/data/state";

const MOBILE_UA = /Android|iPhone|iPad|iPod|Mobile/i;

function deviceLabel(session: AuthSession): string {
  return session.userAgent ? parseDevice(session.userAgent) : "Unknown device";
}

export function SessionsCard() {
  const { data, error, loading, refresh } = useApi(getAuthSessions, []);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const sessions = data?.sessions ?? [];

  const handleRevoke = async (session: AuthSession) => {
    setRevokingId(session.id);
    try {
      await revokeAuthSession(session.id);
      toast.success("Session revoked", {
        description: "The device has been signed out.",
      });
      void refresh();
    } catch (err) {
      toast.error("Could not revoke this session", {
        description:
          err instanceof ApiError ? err.message : "Please try again.",
      });
    } finally {
      setRevokingId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sessions</CardTitle>
        <CardDescription>Devices signed in to your account.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-1">
        {loading && !data ? (
          <LoadingState label="Loading sessions…" />
        ) : error && !data ? (
          <ErrorState message={error.message} onRetry={() => void refresh()} />
        ) : sessions.length === 0 ? (
          <p className="py-2 text-sm text-muted-foreground">
            No other signed-in devices.
          </p>
        ) : (
          sessions.map((session, index) => {
            const Icon =
              session.userAgent && MOBILE_UA.test(session.userAgent)
                ? Smartphone
                : Laptop;
            return (
              <div key={session.id}>
                {index > 0 ? <Separator className="my-1" /> : null}
                <div className="flex items-center justify-between gap-3 py-2">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="size-4" />
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <p className="truncate text-sm font-medium">
                        {deviceLabel(session)}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {[
                          session.ipAddress,
                          `active ${timeAgo(session.lastUsedAt)}`,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </div>
                  </div>
                  {session.current ? (
                    <Badge variant="secondary">This device</Badge>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 shrink-0 px-2 text-muted-foreground"
                      disabled={revokingId === session.id}
                      onClick={() => void handleRevoke(session)}
                    >
                      {revokingId === session.id ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        "Revoke"
                      )}
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
