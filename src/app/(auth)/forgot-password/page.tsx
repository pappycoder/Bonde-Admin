"use client";

import { ArrowLeft, MailCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { ApiError } from "@/lib/api-client";
import { forgotPassword } from "@/lib/auth/auth-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await forgotPassword(email);
      toast.success("Reset code sent", {
        description: `Check ${email} for a 4-digit reset code.`,
      });
      router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setLoading(false);
      if (err instanceof ApiError && err.status === 429) {
        setError("Too many attempts. Try again in a moment.");
      } else if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <MailCheck className="size-5" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Forgot password
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your email and we&apos;ll send you a code to reset your
          password.
        </p>
      </div>

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

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Sending…" : "Send reset code"}
        </Button>
      </form>

      <Link
        href="/login"
        className="mx-auto flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to login
      </Link>
    </div>
  );
}