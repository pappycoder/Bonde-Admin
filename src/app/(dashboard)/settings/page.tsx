"use client";

import { useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/lib/auth/auth-provider";
import { PageHeader } from "@/components/layout/page-header";
import { BroadcastCard } from "@/components/settings/broadcast-card";
import { InviteTeamCard } from "@/components/settings/invite-team-card";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

export default function SettingsPage() {
  const { user } = useAuth();
  // Invite issuance and broadcasts are ADMIN+ APIs; hide the controls rather
  // than rendering cards that would 403.
  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  const [notifications, setNotifications] = useState({
    transactionAlerts: true,
    weeklyReport: false,
    securityAlerts: true,
    productNews: false,
  });

  const handleSaveNotifications = () => {
    toast.success("Preferences saved", {
      description: "Your notification preferences have been updated.",
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Settings"
        description="Manage notifications, appearance and workspace controls."
      />

      {isAdmin ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <InviteTeamCard />
          <BroadcastCard />
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Choose what you want to hear about.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
              {[
                {
                  key: "transactionAlerts" as const,
                  title: "Transaction alerts",
                  description:
                    "Receive a notification when a high-value or flagged transaction occurs.",
                },
                {
                  key: "weeklyReport" as const,
                  title: "Weekly AI report",
                  description:
                    "A summary of AI decisions and model performance every Monday.",
                },
                {
                  key: "securityAlerts" as const,
                  title: "Security alerts",
                  description:
                    "Important alerts about your account and the platform.",
                },
                {
                  key: "productNews" as const,
                  title: "Platform news",
                  description:
                    "Occasional updates about new features and tips.",
                },
              ].map((item, index) => (
                <div key={item.key}>
                  {index > 0 ? <Separator className="my-1" /> : null}
                  <div className="flex items-center justify-between gap-4 py-2">
                    <div className="space-y-0.5">
                      <Label htmlFor={item.key} className="font-medium">
                        {item.title}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                    <Switch
                      id={item.key}
                      checked={notifications[item.key]}
                      onCheckedChange={(checked) =>
                        setNotifications((prev) => ({
                          ...prev,
                          [item.key]: checked,
                        }))
                      }
                    />
                  </div>
                </div>
              ))}
            </CardContent>
            <CardFooter className="justify-end">
              <Button size="sm" onClick={handleSaveNotifications}>
                Save preferences
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="space-y-4">
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

          <Card>
            <CardHeader>
              <CardTitle>Danger zone</CardTitle>
              <CardDescription>
                Irreversible actions for this workspace.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="destructive"
                size="sm"
                className="w-full"
                onClick={() =>
                  toast.error("Workspace paused", {
                    description:
                      "Bonde Admin is now read-only. Contact support to restore it.",
                  })
                }
              >
                Pause workspace
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
