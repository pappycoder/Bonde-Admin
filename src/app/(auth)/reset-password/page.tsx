"use client";

import { ArrowLeft, KeyRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { ApiError } from "@/lib/api-client";
import { resetPassword } from "@/lib/auth/auth-api";
import {
  clearResetEmail,
  clearResetToken,
  loadResetEmail,
  loadResetToken,
} from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [token] = useState(() => loadResetToken());

  function backToVerifyHref(): string {
    const email = loadResetEmail();
    return email ? `/verify-otp?email=${encodeURIComponent(email)}` : "/forgot-password";
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      setError("This reset link is missing its verification code.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await resetPassword(token, password);
      clearResetToken();
      clearResetEmail();
      toast.success("Password updated", {
        description: "You can now sign in with your new password.",
      });
      router.push("/login");
    } catch (err) {
      setLoading(false);
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setError("This reset link has expired. Please start over.");
        } else if (err.status === 429) {
          setError("Too many attempts. Try again in a moment.");
        } else {
          setError(err.message);
        }
      } else {
        setError("Something went wrong. Please try again.");
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <KeyRound className="size-5" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Set a new password
        </h1>
        <p className="text-sm text-muted-foreground">
          Choose a strong password for your admin account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">New password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            required
            minLength={8}
            autoComplete="new-password"
            autoFocus
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm">Confirm password</Label>
          <Input
            id="confirm"
            type="password"
            placeholder="••••••••"
            required
            minLength={8}
            autoComplete="new-password"
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
          />
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Updating…" : "Update password"}
        </Button>
      </form>

      <div className="flex items-center justify-between">
        <Link
          href={backToVerifyHref()}
          className="mx-auto flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to verification code
        </Link>
      </div>
    </div>
  );
}