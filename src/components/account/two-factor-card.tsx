"use client";

import { useState } from "react";
import Image from "next/image";
import QRCode from "qrcode";
import { Check, Copy, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import {
  disableTwoFactor,
  enableTwoFactor,
  getTwoFactorStatus,
  startTwoFactorSetup,
  type TwoFactorSetup,
  type TwoFactorStatus,
} from "@/lib/api/security";
import { ApiError } from "@/lib/api-client";
import { useApi } from "@/hooks/use-api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ErrorState, LoadingState } from "@/components/data/state";

type Step = "closed" | "password" | "scan" | "verify" | "codes";

function messageOf(error: unknown, fallback: string): string {
  if (error instanceof ApiError) return error.message;
  return fallback;
}

export function TwoFactorCard() {
  const {
    data: status,
    error: statusError,
    loading: statusLoading,
    refresh: loadStatus,
  } = useApi<TwoFactorStatus>(getTwoFactorStatus, []);

  const [step, setStep] = useState<Step>("closed");
  const [setup, setSetup] = useState<TwoFactorSetup | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const reset = () => {
    setStep("closed");
    setSetup(null);
    setQr(null);
    setRecoveryCodes([]);
    setPassword("");
    setCode("");
    setFormError(null);
    setCopied(false);
  };

  const runSetup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setFormError(null);
    try {
      const next = await startTwoFactorSetup(password);
      setSetup(next);
      setQr(await QRCode.toDataURL(next.otpauthUri, { width: 224, margin: 1 }));
      setStep("scan");
    } catch (error) {
      setFormError(messageOf(error, "Could not start two-factor setup."));
    } finally {
      setBusy(false);
    }
  };

  const runEnable = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!setup) return;
    setBusy(true);
    setFormError(null);
    try {
      const result = await enableTwoFactor(code);
      setRecoveryCodes(result.recoveryCodes);
      setStep("codes");
      void loadStatus();
    } catch (error) {
      setFormError(messageOf(error, "That code was not accepted."));
    } finally {
      setBusy(false);
    }
  };

  const runDisable = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setFormError(null);
    try {
      await disableTwoFactor({ password, code });
      reset();
      void loadStatus();
      toast.success("Two-factor disabled", {
        description: "Your account now signs in with a password only.",
      });
    } catch (error) {
      setFormError(messageOf(error, "Could not turn two-factor off."));
    } finally {
      setBusy(false);
    }
  };

  const copyCodes = async () => {
    await navigator.clipboard.writeText(recoveryCodes.join("\n"));
    setCopied(true);
    toast.success("Recovery codes copied");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="size-4" />
          Two-factor authentication
        </CardTitle>
        <CardDescription>
          Require a code from your authenticator app when signing in.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-3">
        {statusLoading && !status ? (
          <LoadingState label="Loading…" />
        ) : statusError && !status ? (
          <ErrorState
            message={statusError.message}
            onRetry={() => void loadStatus()}
          />
        ) : (
          <>
            <div className="space-y-0.5">
              <Label className="font-medium">
                {status?.enabled ? "Enabled" : "Disabled"}
              </Label>
              {status?.enabled ? (
                <p className="text-xs text-muted-foreground">
                  {status.recoveryCodesRemaining} recovery
                  {status.recoveryCodesRemaining === 1
                    ? " code"
                    : " codes"}{" "}
                  left
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Sign-in needs a password only.
                </p>
              )}
            </div>
            <Button
              variant={status?.enabled ? "outline" : "default"}
              size="sm"
              onClick={() => {
                setFormError(null);
                setPassword("");
                setCode("");
                setStep("password");
              }}
            >
              {status?.enabled ? "Turn off" : "Enable"}
            </Button>
          </>
        )}
      </CardContent>

      <Sheet
        open={step !== "closed"}
        onOpenChange={(open) => {
          if (!open) reset();
        }}
      >
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle>
              {status?.enabled ? "Turn off two-factor" : "Set up two-factor"}
            </SheetTitle>
            <SheetDescription>
              {step === "password"
                ? status?.enabled
                  ? "Confirm your password and a current code."
                  : "Confirm your password to continue."
                : step === "scan"
                  ? "Scan the code with your authenticator app, or type the key in."
                  : step === "verify"
                    ? "Enter the 6-digit code from your app to finish."
                    : "Save these recovery codes somewhere safe — they are shown once."}
            </SheetDescription>
          </SheetHeader>

          {step === "password" && !status?.enabled ? (
            <form onSubmit={runSetup} className="space-y-4 px-4">
              <div className="space-y-2">
                <Label htmlFor="two-factor-password">Current password</Label>
                <Input
                  id="two-factor-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>
              {formError ? (
                <p className="text-sm text-destructive">{formError}</p>
              ) : null}
              <SheetFooter>
                <Button type="submit" disabled={busy || !password}>
                  {busy ? <Loader2 className="size-3.5 animate-spin" /> : null}
                  Continue
                </Button>
              </SheetFooter>
            </form>
          ) : null}

          {step === "password" && status?.enabled ? (
            <form onSubmit={runDisable} className="space-y-4 px-4">
              <div className="space-y-2">
                <Label htmlFor="disable-password">Current password</Label>
                <Input
                  id="disable-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="disable-code">
                  Authenticator or recovery code
                </Label>
                <Input
                  id="disable-code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="123456"
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                />
              </div>
              {formError ? (
                <p className="text-sm text-destructive">{formError}</p>
              ) : null}
              <SheetFooter>
                <Button
                  type="submit"
                  disabled={busy || !password || code.length < 6}
                >
                  {busy ? <Loader2 className="size-3.5 animate-spin" /> : null}
                  Turn off two-factor
                </Button>
              </SheetFooter>
            </form>
          ) : null}

          {step === "scan" ? (
            <div className="space-y-4 px-4">
              <div className="flex justify-center rounded-lg border bg-white p-4">
                {qr ? (
                  <Image
                    src={qr}
                    alt="Authenticator enrolment QR code"
                    width={224}
                    height={224}
                    unoptimized
                    className="size-56"
                  />
                ) : (
                  <Loader2 className="size-8 animate-spin text-muted-foreground" />
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="two-factor-secret">Setup key</Label>
                <Input
                  id="two-factor-secret"
                  readOnly
                  value={setup?.secret ?? ""}
                  className="font-mono text-xs"
                />
                <p className="text-xs text-muted-foreground">
                  Enter this key manually if you cannot scan the code.
                </p>
              </div>
              <SheetFooter>
                <Button type="button" onClick={() => setStep("verify")}>
                  I&apos;ve added it
                </Button>
              </SheetFooter>
            </div>
          ) : null}

          {step === "verify" ? (
            <form onSubmit={runEnable} className="space-y-4 px-4">
              <div className="space-y-2">
                <Label htmlFor="two-factor-code">6-digit code</Label>
                <Input
                  id="two-factor-code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="123456"
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                />
              </div>
              {formError ? (
                <p className="text-sm text-destructive">{formError}</p>
              ) : null}
              <SheetFooter>
                <Button type="submit" disabled={busy || !/^\d{6}$/.test(code)}>
                  {busy ? <Loader2 className="size-3.5 animate-spin" /> : null}
                  Verify
                </Button>
              </SheetFooter>
            </form>
          ) : null}

          {step === "codes" ? (
            <div className="space-y-4 px-4">
              <ul className="grid grid-cols-2 gap-2 rounded-lg border bg-muted/40 p-4 font-mono text-sm">
                {recoveryCodes.map((recovery) => (
                  <li key={recovery}>{recovery}</li>
                ))}
              </ul>
              <div className="flex items-center justify-between gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void copyCodes()}
                >
                  {copied ? (
                    <Check className="size-3.5" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                  {copied ? "Copied" : "Copy codes"}
                </Button>
                <Button type="button" size="sm" onClick={reset}>
                  Done
                </Button>
              </div>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </Card>
  );
}
