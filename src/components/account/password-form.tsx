"use client";

import { useState } from "react";
import { KeyRound, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { changePassword } from "@/lib/api/security";
import { ApiError } from "@/lib/api-client";
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

const MIN_PASSWORD_LENGTH = 8;

export function PasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setError(
        `New password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError(null);
    setSaving(true);
    try {
      const result = await changePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password changed", {
        description:
          result.revokedSessions > 0
            ? `${result.revokedSessions} other ${
                result.revokedSessions === 1 ? "device was" : "devices were"
              } signed out.`
            : "Your password was updated successfully.",
      });
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.status === 401
            ? "Current password is incorrect."
            : err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="size-4" />
          Security
        </CardTitle>
        <CardDescription>
          Change your password to keep your account safe.
        </CardDescription>
      </CardHeader>
      <form
        onSubmit={(event) => {
          void handleSubmit(event);
        }}
      >
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="p-current">Current password</Label>
            <Input
              id="p-current"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="p-new">New password</Label>
              <Input
                id="p-new"
                type="password"
                autoComplete="new-password"
                minLength={MIN_PASSWORD_LENGTH}
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-confirm">Confirm new password</Label>
              <Input
                id="p-confirm"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
            </div>
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </CardContent>
        <CardFooter className="justify-end">
          <Button
            type="submit"
            size="sm"
            disabled={
              saving || !currentPassword || !newPassword || !confirmPassword
            }
          >
            {saving ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Updating…
              </>
            ) : (
              "Update password"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
