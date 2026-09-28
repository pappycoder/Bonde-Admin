"use client";

import { ArrowLeft, ArrowRight, KeyRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { ApiError } from "@/lib/api-client";
import { useAuth } from "@/lib/auth/auth-provider";
import type { MfaChallenge } from "@/lib/auth/auth-api";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const { login, completeMfa } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [challenge, setChallenge] = useState<MfaChallenge | null>(null);
  const [code, setCode] = useState("");

  function loginErrorOf(err: unknown): string {
    if (err instanceof ApiError) {
      if (err.status === 401) return "Invalid email or password.";
      if (err.status === 403) return "Your email has not been verified yet.";
      if (err.status === 429)
        return "Too many attempts. Try again in a moment.";
      return err.message;
    }
    return "Something went wrong. Please try again.";
  }

  function signedIn(): void {
    toast.success("Signed in", {
      description: "Welcome back to the Bonde admin console.",
    });
    router.push("/dashboard");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const outcome = await login(email, password, remember);
      if (outcome.status === "mfa_required") {
        // The API parked the session: ask for the authenticator code next.
        setChallenge(outcome.challenge);
        setCode("");
        setLoading(false);
        return;
      }
      signedIn();
    } catch (err) {
      setLoading(false);
      setError(loginErrorOf(err));
    }
  }

  async function handleMfaSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!challenge) return;
    setError(null);
    setLoading(true);
    try {
      await completeMfa(challenge.challengeId, code, remember);
      signedIn();
    } catch (err) {
      setLoading(false);
      setError(loginErrorOf(err));
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
        <p className="text-sm text-muted-foreground">
          Access the Bonde admin console.
        </p>
      </div>

      {challenge ? (
        <form onSubmit={handleMfaSubmit} className="space-y-4">
          <div className="flex items-start gap-3 rounded-lg border bg-muted/40 p-3">
            <KeyRound className="mt-0.5 size-4 shrink-0 text-primary" />
            <p className="text-sm text-muted-foreground">
              Two-factor authentication is on for{" "}
              <span className="font-medium text-foreground">{email}</span>.
              Enter the 6-digit code from your authenticator app, or one of your
              recovery codes.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mfa-code">Verification code</Label>
            <Input
              id="mfa-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="123456"
              required
              autoFocus
              value={code}
              onChange={(event) => setCode(event.target.value)}
            />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <Button
            type="submit"
            className="w-full"
            disabled={loading || code.trim().length < 6}
          >
            {loading ? "Verifying…" : "Verify code"}
            {!loading ? <ArrowRight className="size-4" /> : null}
          </Button>

          <Button
            type="button"
            variant="ghost"
            className="w-full"
            disabled={loading}
            onClick={() => {
              setChallenge(null);
              setCode("");
              setError(null);
            }}
          >
            <ArrowLeft className="size-4" />
            Use a different account
          </Button>
        </form>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@bonde.app"
              required
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/forgot-password"
                className="text-xs text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              required
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="remember"
              checked={remember}
              onCheckedChange={(checked) => setRemember(Boolean(checked))}
            />
            <Label htmlFor="remember" className="text-sm font-normal">
              Remember me
            </Label>
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
            {!loading ? <ArrowRight className="size-4" /> : null}
          </Button>
        </form>
      )}

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <span className="font-medium text-foreground">
          Contact your workspace owner.
        </span>
      </p>
    </div>
  );
}
