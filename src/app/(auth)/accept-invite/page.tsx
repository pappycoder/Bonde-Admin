"use client";

import { Loader2, ShieldCheck } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";

import {
  acceptInvite,
  peekInvite,
  type InvitePreview,
} from "@/lib/api/invites";
import { ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/** Mirrors the API's `IsStrongPassword({ minLength: 12 })` rule. */
const PASSWORD_MIN = 12;
const PASSWORD_RULE =
  "At least 12 characters with an uppercase letter, a lowercase letter, a number and a symbol.";

function isStrongEnough(password: string): boolean {
  return (
    password.length >= PASSWORD_MIN &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /\d/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}

/**
 * Public redemption page for an emailed invitation: verify the token, choose a
 * password, then hand off to sign-in. No session exists until the invitee
 * actually signs in, so the API never releases tokens here.
 */
export default function AcceptInvitePage() {
  return (
    <Suspense fallback={<LoadingPanel />}>
      <AcceptInviteForm />
    </Suspense>
  );
}

function LoadingPanel() {
  return (
    <div className="flex flex-col items-center gap-3 py-8 text-muted-foreground">
      <Loader2 className="size-5 animate-spin" />
      <p className="text-sm">Checking your invitation…</p>
    </div>
  );
}

function AcceptInviteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [invite, setInvite] = useState<InvitePreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const preview = await peekInvite(token);
      setInvite(preview);
      setFullName(preview.fullName ?? "");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "We could not check this invitation.",
      );
      setInvite({
        email: "",
        fullName: null,
        role: "USER",
        expiresAt: "",
        valid: false,
      });
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    // Defer by a microtask (the `useApi` pattern) so the first render is not
    // followed by a synchronous state cascade.
    void (async () => {
      await Promise.resolve();
      await load();
    })();
  }, [token, load]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!isStrongEnough(password)) {
      setError(PASSWORD_RULE);
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await acceptInvite({
        token,
        password,
        fullName: fullName.trim() || undefined,
      });
      router.push(`/login?invited=${encodeURIComponent(result.email)}`);
    } catch (err) {
      setSubmitting(false);
      setError(
        err instanceof ApiError
          ? err.status === 400
            ? "This invitation is no longer valid. Ask your admin for a new link."
            : err.message
          : "Something went wrong. Please try again.",
      );
    }
  }

  if (!token) {
    return (
      <div className="space-y-4 text-center">
        <h1 className="text-xl font-semibold">
          This invitation link is incomplete
        </h1>
        <p className="text-sm text-muted-foreground">
          The link is missing its token. Open the invitation email again, or ask
          your admin for a new link.
        </p>
        <Button asChild className="w-full">
          <a href="/login">Go to sign in</a>
        </Button>
      </div>
    );
  }

  if (loading) return <LoadingPanel />;

  if (invite && !invite.valid) {
    return (
      <div className="space-y-4 text-center">
        <h1 className="text-xl font-semibold">
          This invitation is no longer valid
        </h1>
        <p className="text-sm text-muted-foreground">
          {error ??
            "The link may have expired, been used already, or been revoked."}
        </p>
        <Button asChild className="w-full">
          <a href="/login">Go to sign in</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1.5 text-center">
        <div className="mx-auto flex size-11 items-center justify-center rounded-full bg-primary/10">
          <ShieldCheck className="size-5 text-primary" />
        </div>
        <h1 className="text-xl font-semibold">Accept your invitation</h1>
        <p className="text-sm text-muted-foreground">
          You have been invited to join Bonde as{" "}
          <span className="font-medium text-foreground">
            {invite?.role.toLowerCase().replace("_", " ")}
          </span>
          . Set your password to activate your account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="accept-email">Email</Label>
          <Input
            id="accept-email"
            value={invite?.email ?? ""}
            disabled
            readOnly
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="accept-name">Full name</Label>
          <Input
            id="accept-name"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            autoComplete="name"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="accept-password">Password</Label>
          <Input
            id="accept-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="accept-confirm">Confirm password</Label>
          <Input
            id="accept-confirm"
            type="password"
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            autoComplete="new-password"
            required
          />
          <p className="text-xs text-muted-foreground">{PASSWORD_RULE}</p>
        </div>

        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? <Loader2 className="animate-spin" /> : null}
          Create my account
        </Button>
      </form>
    </div>
  );
}
