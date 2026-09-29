"use client";

import { useAuth } from "@/lib/auth/auth-provider";
import { PageHeader } from "@/components/layout/page-header";
import { BroadcastCard } from "@/components/settings/broadcast-card";
import { InviteTeamCard } from "@/components/settings/invite-team-card";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function SettingsPage() {
  const { user } = useAuth();
  // Invite issuance and broadcasts are ADMIN+ APIs; hide the controls rather
  // than rendering cards that would 403.
  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Settings"
        description="Manage team access, announcements and appearance."
      />

      {isAdmin ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <InviteTeamCard />
          <BroadcastCard />
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              Bonde notifies you in-app about reviews, broadcasts and support.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              Open the bell in the top bar to read, filter and clear your
              notifications. Per-channel preferences are not configurable yet.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Toggle between light, dark and system themes.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <Label htmlFor="theme" className="font-medium">
              Theme
            </Label>
            <ThemeToggle />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
