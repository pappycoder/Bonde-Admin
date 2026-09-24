"use client";

import { ArrowLeft, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "sonner";

import { ApiError } from "@/lib/api-client";
import { forgotPassword, verifyResetOtp } from "@/lib/auth/auth-api";
import { saveResetEmail, saveResetToken } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={null}>
      <VerifyOtpForm />
    </Suspense>
  );
}

function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") ?? "";
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function errorOf(err: unknown): string {
    if (err instanceof ApiError) {
      if (err.status === 400) return "That code is invalid or has expired.";
      if (err.status === 429) return "Too many attempts. Try again in a moment.";
      return err.message;
    }
    return "Something went wrong. Please try again.";
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!email) {
      setError("Enter the email you used to request the reset.");
      return;
    }
    if (!/^\d{4}$/.test(code)) {
      setError("Enter the 4-digit code from your email.");
      return;
    }
    setLoading(true);
    try {
      const { resetToken } = await verifyResetOtp(email, code);
      saveResetToken(resetToken);
      saveResetEmail(email);
      toast.success("Code verified", {
        description: "Now choose a new password for your account.",
      });
      router.replace("/reset-password");
    } catch (err) {
      setLoading(false);
      setError(errorOf(err));
    }
  }

  async function handleResend() {
    setError(null);
    if (!email) {
      setError("Enter your email first.");
      return;
    }
    setResending(true);
    try {
      await forgotPassword(email);
      toast.success("Code resent", {
        description: `A new code was sent to ${email}.`,
      });
    } catch (err) {
      setError(errorOf(err));
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <ShieldCheck className="size-5" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Verify your code
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter the 4-digit code we emailed you to reset your password.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="code">Verification code</Label>
          <Input
            id="code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="0000"
            required
            autoFocus
            maxLength={4}
            value={code}
            onChange={(event) =>
              setCode(event.target.value.replace(/\D/g, "").slice(0, 4))
            }
          />
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Verifying…" : "Verify code"}
        </Button>
      </form>

      <div className="flex items-center justify-between text-sm">
        <button
          type="button"
          onClick={handleResend}
          disabled={resending || loading}
          className="text-primary hover:underline disabled:pointer-events-none disabled:opacity-50"
        >
          {resending ? "Resending…" : "Resend code"}
        </button>

        <Link
          href="/login"
          className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to login
        </Link>
      </div>
    </div>
  );
}