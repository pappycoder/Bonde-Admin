"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    productDigest: false,
    securityAlerts: true,
    marketing: false,
  });

  const handleSaveProfile = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    toast.success("Profile saved", {
      description: "Your account details have been updated.",
    });
  };

  const handleSaveNotifications = () => {
    toast.success("Preferences saved", {
      description: "Your notification preferences have been updated.",
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Settings"
        description="Manage your account, appearance and notifications."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>
                Update your name, email address and role.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSaveProfile}>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" defaultValue="Ada Lovelace" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      defaultValue="ada@bonde.app"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select defaultValue="admin">
                    <SelectTrigger id="role" className="w-full sm:w-56">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="owner">Owner</SelectItem>
                      <SelectItem value="admin">Administrator</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter className="justify-end">
                <Button type="submit" size="sm">
                  Save changes
                </Button>
              </CardFooter>
            </form>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Choose what you want to hear about.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
              {(
                [
                  {
                    key: "orderUpdates" as const,
                    title: "Order updates",
                    description:
                      "Receive a notification when an order changes status.",
                  },
                  {
                    key: "productDigest" as const,
                    title: "Weekly product digest",
                    description:
                      "A summary of top-selling products every Monday.",
                  },
                  {
                    key: "securityAlerts" as const,
                    title: "Security alerts",
                    description:
                      "Important alerts about your account and storefront.",
                  },
                  {
                    key: "marketing" as const,
                    title: "Product news",
                    description:
                      "Occasional updates about new features and tips.",
                  },
                ]
              ).map((item, index) => (
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
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() =>
                  toast("Invite sent", {
                    description: "William Kim was invited to this workspace.",
                  })
                }
              >
                <Plus />
                Invite teammate
              </Button>
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