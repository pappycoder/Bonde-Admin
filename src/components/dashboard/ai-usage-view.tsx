"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Activity, Coins, RefreshCw, Search, Wallet } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { useApi } from "@/hooks/use-api";
import { ErrorState, LoadingState } from "@/components/data/state";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  checkAiAlerts,
  getAiUsage,
  recordAiFunding,
  saveAiRate,
  saveAiThresholds,
  type ProviderBudget,
  type UsageRate,
} from "@/lib/api/ai-usage";

const number = (value: number) => value.toLocaleString();
const usd = (value: string | null) =>
  value === null
    ? "Not configured"
    : new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 6,
      }).format(Number(value));
const date = (value: string) =>
  new Date(value).toLocaleString("en-NG", {
    timeZone: "Africa/Lagos",
    dateStyle: "medium",
    timeStyle: "short",
  });
const inputClass = "grid gap-1 text-sm";
const tableClass =
  "w-full text-left text-sm [&_th]:whitespace-nowrap [&_th]:py-3 [&_th]:pr-4 [&_th]:font-medium [&_th]:text-muted-foreground [&_td]:py-3 [&_td]:pr-4 [&_tr]:border-b [&_tr:last-child]:border-0";

function ProviderPanel({
  budget,
  rates,
  configuredModel,
  refresh,
}: {
  budget: ProviderBudget;
  rates: UsageRate[];
  configuredModel: string;
  refresh: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [operation, setOperation] = useState<"TOP_UP" | "BALANCE">("TOP_UP");
  const [warning, setWarning] = useState(String(budget.warningPercent));
  const [critical, setCritical] = useState(String(budget.criticalPercent));
  const [recipients, setRecipients] = useState(
    budget.emailRecipients.join(", "),
  );
  const [model, setModel] = useState(
    budget.provider === "BRAVE" ? "brave-search" : configuredModel,
  );
  const [inputRate, setInputRate] = useState("");
  const [cachedRate, setCachedRate] = useState("");
  const [outputRate, setOutputRate] = useState("");
  const [searchRate, setSearchRate] = useState("");
  const fundingIdentity = useRef<{
    fingerprint: string;
    reference: string;
  } | null>(null);
  const currentRate = rates.find(
    (rate) => rate.provider === budget.provider && rate.model === model,
  );
  const activeModel =
    budget.provider === "BRAVE" ? "brave-search" : configuredModel;
  const activeRate = rates.find(
    (rate) => rate.provider === budget.provider && rate.model === activeModel,
  );
  async function perform(work: () => Promise<unknown>, success: string) {
    setBusy(true);
    try {
      await work();
      toast.success(success);
      await refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not save monitoring settings.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function fund(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fingerprint = JSON.stringify({
      provider: budget.provider,
      amount,
      note,
      operation,
    });
    if (fundingIdentity.current?.fingerprint !== fingerprint)
      fundingIdentity.current = { fingerprint, reference: crypto.randomUUID() };
    const reference = fundingIdentity.current.reference;
    await perform(async () => {
      await recordAiFunding({
        provider: budget.provider,
        operation,
        reference,
        amountUsd: amount,
        note,
      });
      setAmount("");
      setNote("");
      fundingIdentity.current = null;
    }, "Funding entry recorded. No provider payment was made.");
  }
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>
            {budget.provider === "OPENAI" ? "OpenAI" : "Brave Search"}
          </CardTitle>
          {budget.severity && (
            <Badge variant="destructive">{budget.severity.toLowerCase()}</Badge>
          )}
        </div>
        <CardDescription>
          Admin-maintained funding estimate in USD · {activeModel}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {!activeRate && (
          <p className="rounded-md border border-amber-500/30 p-3 text-sm">
            Configure the active model’s rates under Provider pricing below,
            then record its current available balance. Until pricing is
            configured, requests have unknown costs.
          </p>
        )}
        <div>
          <p className="text-sm text-muted-foreground">Estimated remaining</p>
          <p className="text-3xl font-semibold">
            {usd(budget.estimatedRemainingUsd)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Funds since baseline {usd(budget.fundedUsd)} · Known spend since
            baseline {usd(budget.spentUsd)}
          </p>
        </div>
        {budget.unknownCostRequests > 0 && (
          <p
            role="status"
            className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-sm"
          >
            {number(budget.unknownCostRequests)} requests have unpriced or
            uncertain costs since opening. This estimate may overstate the
            available balance.
          </p>
        )}
        <p className="text-sm text-muted-foreground">
          {budget.estimatedRunwayDays === null
            ? "Runway unavailable until funding, complete pricing and usage are recorded."
            : `Estimated runway: ${number(budget.estimatedRunwayDays)} days at the recent usage rate.`}
          {budget.baselineAt && (
            <> Opening recorded {date(budget.baselineAt)}.</>
          )}
        </p>
        <form onSubmit={fund} className="space-y-3 border-t pt-4">
          <h3 className="font-medium">
            {budget.baselineAt && operation === "BALANCE"
              ? "Enter the available balance you have checked at the provider. This establishes a new baseline, resolves prior funding alerts and excludes older uncertain costs from the new balance estimate. Historical usage is retained."
              : budget.baselineAt
                ? "Record a top-up"
                : "Record current available balance"}
          </h3>
          <p className="text-xs text-muted-foreground">
            {budget.baselineAt
              ? "Record money already added at the provider. This resets the alert cycle."
              : "Enter the balance available now, not the total of previous deposits. Usage before this entry is excluded from the balance estimate."}
          </p>
          {budget.baselineAt && (
            <label className={inputClass}>
              Entry type
              <select
                className="h-9 rounded-md border bg-background px-3"
                value={operation}
                onChange={(event) =>
                  setOperation(event.target.value as "TOP_UP" | "BALANCE")
                }
              >
                <option value="TOP_UP">Record a top-up already made</option>
                <option value="BALANCE">
                  Reconcile current available balance
                </option>
              </select>
            </label>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            <label className={inputClass}>
              Amount (USD)
              <Input
                required
                type="number"
                min={
                  budget.baselineAt && operation === "TOP_UP"
                    ? "0.00000001"
                    : "0"
                }
                step="0.00000001"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
              />
            </label>
            <label className={inputClass}>
              Reference note
              <Input
                maxLength={255}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Provider receipt or opening balance"
              />
            </label>
          </div>
          <Button type="submit" disabled={busy}>
            {budget.baselineAt
              ? operation === "BALANCE"
                ? "Record reconciled balance"
                : "Record top-up"
              : "Record opening balance"}
          </Button>
        </form>
        <details className="border-t pt-4">
          <summary className="cursor-pointer font-medium">
            Alert thresholds and recipients
          </summary>
          <form
            className="mt-3 space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              void perform(
                () =>
                  saveAiThresholds({
                    provider: budget.provider,
                    warningPercent: Number(warning),
                    criticalPercent: Number(critical),
                    emailRecipients: recipients
                      .split(/[,;\s]+/)
                      .filter(Boolean),
                  }),
                "Alert settings saved.",
              );
            }}
          >
            <div className="grid grid-cols-2 gap-3">
              <label className={inputClass}>
                Warning (% remaining)
                <Input
                  required
                  type="number"
                  min="1"
                  max="99"
                  value={warning}
                  onChange={(event) => setWarning(event.target.value)}
                />
              </label>
              <label className={inputClass}>
                Critical (% remaining)
                <Input
                  required
                  type="number"
                  min="0"
                  max="98"
                  value={critical}
                  onChange={(event) => setCritical(event.target.value)}
                />
              </label>
            </div>
            <label className={inputClass}>
              Admin email recipients
              <Input
                value={recipients}
                onChange={(event) => setRecipients(event.target.value)}
                placeholder="admin@your-company.com, finance@your-company.com"
              />
            </label>
            <p className="text-xs text-muted-foreground">
              Percentages use the estimated available funds immediately after
              the latest funding entry. Leave recipients empty for
              dashboard-only alerts.
            </p>
            <Button type="submit" variant="outline" disabled={busy}>
              Save alert settings
            </Button>
          </form>
        </details>
        <details className="border-t pt-4">
          <summary className="cursor-pointer font-medium">
            Provider pricing
          </summary>
          <form
            className="mt-3 space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              void perform(
                () =>
                  saveAiRate({
                    provider: budget.provider,
                    model,
                    inputPerMillion:
                      budget.provider === "OPENAI" ? inputRate : "0",
                    cachedInputPerMillion:
                      budget.provider === "OPENAI" ? cachedRate : "0",
                    outputPerMillion:
                      budget.provider === "OPENAI" ? outputRate : "0",
                    searchPerThousand:
                      budget.provider === "BRAVE" ? searchRate : "0",
                  }),
                "Pricing saved for future provider requests.",
              );
            }}
          >
            <p className="text-xs text-muted-foreground">
              Enter the USD rates from your provider plan. Each request keeps
              its original pricing version; previously unpriced records remain
              unpriced.
            </p>
            {budget.provider === "OPENAI" && (
              <label className={inputClass}>
                Model
                <Input
                  required
                  value={model}
                  onChange={(event) => setModel(event.target.value)}
                  maxLength={100}
                />
              </label>
            )}
            {currentRate ? (
              <p className="text-xs text-muted-foreground">
                Current:{" "}
                {budget.provider === "BRAVE"
                  ? `${usd(currentRate.searchPerThousand)} / 1,000 searches`
                  : `${usd(currentRate.inputPerMillion)} input · ${usd(currentRate.cachedInputPerMillion)} cached input · ${usd(currentRate.outputPerMillion)} output per million tokens`}
                . Recorded {date(currentRate.createdAt)}.
              </p>
            ) : (
              <p className="text-sm text-amber-600">
                No pricing recorded for this model. Requests will be marked
                unpriced.
              </p>
            )}
            {budget.provider === "OPENAI" ? (
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { label: "Input / 1M", value: inputRate, set: setInputRate },
                  {
                    label: "Cached input / 1M",
                    value: cachedRate,
                    set: setCachedRate,
                  },
                  {
                    label: "Output / 1M",
                    value: outputRate,
                    set: setOutputRate,
                  },
                ].map((field) => (
                  <label key={field.label} className={inputClass}>
                    {field.label}
                    <Input
                      required
                      type="number"
                      min="0"
                      step="0.00000001"
                      value={field.value}
                      onChange={(event) => field.set(event.target.value)}
                    />
                  </label>
                ))}
              </div>
            ) : (
              <label className={inputClass}>
                USD per 1,000 successful searches
                <Input
                  required
                  type="number"
                  min="0"
                  step="0.00000001"
                  value={searchRate}
                  onChange={(event) => setSearchRate(event.target.value)}
                />
              </label>
            )}
            <Button variant="outline" type="submit" disabled={busy}>
              Record pricing version
            </Button>
          </form>
        </details>
      </CardContent>
    </Card>
  );
}

export function AiUsageView({ initialUserId }: { initialUserId?: string }) {
  const [days, setDays] = useState(30);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [userId, setUserId] = useState(initialUserId);
  const [checking, setChecking] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);
  const fetcher = useCallback(
    () => getAiUsage(days, page, query, userId),
    [days, page, query, userId],
  );
  const { data, error, loading, refresh } = useApi(fetcher, [fetcher]);
  async function checkAlerts() {
    setChecking(true);
    try {
      await checkAiAlerts();
      await refresh();
      toast.success("Thresholds checked and pending email alerts processed.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Alert check failed.",
      );
    } finally {
      setChecking(false);
    }
  }
  const bucketLabel = (value: string) =>
    new Date(value).toLocaleString("en-NG", {
      timeZone: "Africa/Lagos",
      ...(days === 1
        ? { hour: "2-digit" as const }
        : { month: "short" as const, day: "numeric" as const }),
    });
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="AI usage"
        description="Understand provider costs, customer credits and when to replenish funds."
      >
        <select
          aria-label="Usage period"
          className="h-9 rounded-md border bg-background px-3 text-sm"
          value={days}
          onChange={(event) => {
            setDays(Number(event.target.value));
            setPage(1);
          }}
        >
          {[1, 7, 30, 90].map((value) => (
            <option key={value} value={value}>
              {value === 1 ? "Last 24 hours" : `Last ${value} days`}
            </option>
          ))}
        </select>
        <Button
          variant="outline"
          disabled={loading}
          onClick={() => void refresh()}
        >
          <RefreshCw className="mr-2 size-4" />
          Refresh
        </Button>
      </PageHeader>
      <p className="text-sm text-muted-foreground">
        Provider costs and balances are estimates for requests metered by Bonde.
        They are separate from customer reply credits and may differ from
        provider billing, especially if the same key is used elsewhere. Times
        are shown in Lagos time.
      </p>
      {!data ? (
        loading ? (
          <LoadingState className="py-20" />
        ) : (
          <ErrorState message={error?.message} onRetry={() => void refresh()} />
        )
      ) : (
        <>
          {error && (
            <ErrorState
              message={error.message}
              onRetry={() => void refresh()}
            />
          )}
          {userId && (
            <div className="flex flex-wrap items-center gap-3 rounded-md border p-3 text-sm">
              <span>
                Usage and credit totals filtered to user {userId}. Provider
                funding cards remain platform-wide.
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setUserId(undefined);
                  setPage(1);
                }}
              >
                Show all users
              </Button>
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Reported AI tokens"
              value={number(data.totals.inputTokens + data.totals.outputTokens)}
              sublabel={`${number(data.totals.inputTokens)} input · ${number(data.totals.outputTokens)} output`}
              icon={<Activity className="size-4" />}
            />
            <StatCard
              title="Estimated provider spend"
              value={usd(data.totals.estimatedCostUsd)}
              sublabel={`${number(data.totals.unknownCostRequests)} requests with unknown cost`}
              icon={<Wallet className="size-4" />}
            />
            <StatCard
              title="Provider requests"
              value={number(data.totals.requests)}
              sublabel={`${number(data.totals.modelCalls)} AI calls · ${number(data.totals.searchAttempts)} search attempts`}
              icon={<Search className="size-4" />}
            />
            <StatCard
              title="Customer credits remaining"
              value={number(data.credits.issuedRemaining)}
              sublabel={`${number(data.credits.consumedPeriod)} used in period · ${number(data.credits.reserved)} reserved · issued credits only`}
              icon={<Coins className="size-4" />}
            />
          </div>
          <div className="grid gap-4 xl:grid-cols-2">
            {data.providers.map((budget) => (
              <ProviderPanel
                key={budget.provider}
                budget={budget}
                rates={data.rates}
                configuredModel={data.configuredModel}
                refresh={refresh}
              />
            ))}
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Token usage over time</CardTitle>
              <CardDescription>
                Cached input is included in input tokens; reasoning is included
                in output tokens. Updated {date(data.until)}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.series.length ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.series}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        dataKey="bucket"
                        tickFormatter={bucketLabel}
                        minTickGap={30}
                      />
                      <YAxis width={55} />
                      <Tooltip
                        labelFormatter={(value) => date(String(value))}
                      />
                      <Area
                        type="monotone"
                        dataKey="inputTokens"
                        name="Input tokens"
                        stackId="tokens"
                        stroke="#f97316"
                        fill="#f97316"
                        fillOpacity={0.3}
                      />
                      <Area
                        type="monotone"
                        dataKey="outputTokens"
                        name="Output tokens"
                        stackId="tokens"
                        stroke="#22c55e"
                        fill="#22c55e"
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="py-12 text-center text-sm text-muted-foreground">
                  No metered requests in this period. Historical chat counters
                  are not backfilled as complete cost records.
                </p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Per-user consumption</CardTitle>
              <CardDescription>
                Usage and credits consumed are for the selected period.
                Remaining and reserved credits are current balances.
              </CardDescription>
              <Input
                aria-label="Search users"
                placeholder="Search by name or email"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className={tableClass}>
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Tokens</th>
                      <th>Searches</th>
                      <th>Estimated cost</th>
                      <th>Credits used</th>
                      <th>Credits left</th>
                      <th>Reserved</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {data.users.items.map((user) => (
                      <tr key={user.id}>
                        <td>
                          <Link
                            href={`/users/${user.id}`}
                            className="font-medium hover:underline"
                          >
                            {user.fullName}
                          </Link>
                          <p className="text-xs text-muted-foreground">
                            {user.email}
                          </p>
                        </td>
                        <td>{number(user.inputTokens + user.outputTokens)}</td>
                        <td>{number(user.searchAttempts)}</td>
                        <td>
                          {usd(user.estimatedCostUsd)}
                          {user.unknownCostRequests > 0 && (
                            <p className="text-xs text-amber-600">
                              {user.unknownCostRequests} unknown
                            </p>
                          )}
                        </td>
                        <td>{number(user.creditsConsumed)}</td>
                        <td>
                          {user.creditsRemaining === null
                            ? "Not issued yet"
                            : number(user.creditsRemaining)}
                        </td>
                        <td>{number(user.creditsReserved)}</td>
                        <td>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setUserId(user.id);
                              setPage(1);
                            }}
                          >
                            Inspect
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {!data.users.items.length && (
                <p className="py-6 text-sm text-muted-foreground">
                  No matching users with issued credits or recorded usage.
                </p>
              )}
              <div className="mt-4 flex items-center justify-between gap-3 text-sm">
                <span>{number(data.users.total)} users</span>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1 || loading}
                    onClick={() => setPage((value) => value - 1)}
                  >
                    Previous
                  </Button>
                  <span>
                    Page {page} of {Math.max(1, data.users.totalPages)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= data.users.totalPages || loading}
                    onClick={() => setPage((value) => value + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <CardTitle>Funding alerts</CardTitle>
                <Button
                  variant="outline"
                  disabled={checking}
                  onClick={() => void checkAlerts()}
                >
                  {checking
                    ? "Checking…"
                    : "Check thresholds and send pending alerts"}
                </Button>
              </div>
              <CardDescription>
                One alert per severity per funding cycle. Email delivery retries
                unsent recipients. Funding entries resolve the previous cycle’s
                alerts.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className={tableClass}>
                  <thead>
                    <tr>
                      <th>When</th>
                      <th>Provider</th>
                      <th>Level</th>
                      <th>Estimated remaining</th>
                      <th>Status</th>
                      <th>Email delivery</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.alerts.map((alert) => (
                      <tr key={alert.id}>
                        <td>{date(alert.createdAt)}</td>
                        <td>{alert.provider}</td>
                        <td>
                          <Badge
                            variant={
                              alert.resolvedAt ? "secondary" : "destructive"
                            }
                          >
                            {alert.severity.toLowerCase()}
                          </Badge>
                        </td>
                        <td>{usd(alert.remainingUsd)}</td>
                        <td>
                          {alert.resolvedAt
                            ? "Resolved by replenishment"
                            : "Needs attention"}
                        </td>
                        <td>
                          {!alert.recipients.length
                            ? "No recipients configured"
                            : `${alert.sentTo.filter((email) => alert.recipients.includes(email)).length}/${alert.recipients.length} sent${alert.emailComplete ? "" : ` · retry queued (${alert.emailAttempts} attempts)`}`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {!data.alerts.length && (
                <p className="py-6 text-sm text-muted-foreground">
                  No funding alerts yet. Record provider pricing, opening
                  balances and alert recipients to begin monitoring.
                </p>
              )}
            </CardContent>
          </Card>
          <details className="rounded-xl border p-4">
            <summary className="cursor-pointer font-medium">
              Provider request history and model breakdown
            </summary>
            <div className="mt-4 overflow-x-auto">
              <table className={tableClass}>
                <thead>
                  <tr>
                    <th>Provider / model</th>
                    <th>Requests</th>
                    <th>Cached input tokens</th>
                    <th>Reasoning tokens</th>
                    <th>Known cost</th>
                    <th>Unknown costs</th>
                  </tr>
                </thead>
                <tbody>
                  {data.byProvider.map((row) => (
                    <tr key={`${row.provider}:${row.model}`}>
                      <td>
                        {row.provider} · {row.model}
                      </td>
                      <td>{number(row.requests)}</td>
                      <td>{number(row.cachedInputTokens)}</td>
                      <td>{number(row.reasoningTokens)}</td>
                      <td>{usd(row.estimatedCostUsd)}</td>
                      <td>{number(row.unknownCostRequests)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <table className={`${tableClass} mt-6`}>
                <thead>
                  <tr>
                    <th>When</th>
                    <th>User</th>
                    <th>Provider / model</th>
                    <th>Status</th>
                    <th>Tokens</th>
                    <th>Estimated cost</th>
                    <th>Latency</th>
                  </tr>
                </thead>
                <tbody>
                  {data.latest.map((row) => (
                    <tr key={row.id}>
                      <td>{date(row.occurredAt)}</td>
                      <td>{row.user.fullName}</td>
                      <td>
                        {row.provider} · {row.model}
                      </td>
                      <td>{row.status}</td>
                      <td>
                        {row.provider === "BRAVE"
                          ? "—"
                          : row.inputTokens === null ||
                              row.outputTokens === null
                            ? "Unknown"
                            : number(row.inputTokens + row.outputTokens)}
                      </td>
                      <td>
                        {row.costUsd === null ? "Unknown" : usd(row.costUsd)}
                      </td>
                      <td>{number(row.durationMs)} ms</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
          <details className="rounded-xl border p-4">
            <summary className="cursor-pointer font-medium">
              Recent funding entries
            </summary>
            <div className="mt-4 overflow-x-auto">
              <table className={tableClass}>
                <thead>
                  <tr>
                    <th>When</th>
                    <th>Provider</th>
                    <th>Entry</th>
                    <th>Amount</th>
                    <th>Note</th>
                  </tr>
                </thead>
                <tbody>
                  {data.funding.map((row) => (
                    <tr key={row.id}>
                      <td>{date(row.createdAt)}</td>
                      <td>{row.provider}</td>
                      <td>
                        {row.kind === "OPENING"
                          ? "Opening balance"
                          : row.kind === "BALANCE"
                            ? "Balance reconciliation"
                            : "Top-up"}
                      </td>
                      <td>{usd(row.amountUsd)}</td>
                      <td>{row.note || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!data.funding.length && (
                <p className="py-4 text-sm text-muted-foreground">
                  No recorded funding entries.
                </p>
              )}
            </div>
          </details>
        </>
      )}
    </div>
  );
}
