import { api } from "@/lib/api-client";

export type Provider = "OPENAI" | "BRAVE";
export type UsageMetrics = {
  requests: number;
  modelCalls: number;
  searchAttempts: number;
  successfulSearches: number;
  failedRequests: number;
  pendingRequests: number;
  unknownCostRequests: number;
  inputTokens: number;
  cachedInputTokens: number;
  outputTokens: number;
  reasoningTokens: number;
  estimatedCostUsd: string;
};
export type ProviderBudget = {
  provider: Provider;
  baselineAt: string | null;
  fundedUsd: string;
  spentUsd: string;
  estimatedRemainingUsd: string | null;
  unknownCostRequests: number;
  estimatedRunwayDays: number | null;
  thresholdBaseUsd: string | null;
  warningPercent: number;
  criticalPercent: number;
  emailRecipients: string[];
  severity: "WARNING" | "CRITICAL" | null;
};
export type UsageRate = {
  id: string;
  provider: Provider;
  model: string;
  inputPerMillion: string;
  cachedInputPerMillion: string;
  outputPerMillion: string;
  searchPerThousand: string;
  createdAt: string;
};
export type UsageUser = {
  id: string;
  fullName: string;
  email: string;
  requests: number;
  inputTokens: number;
  outputTokens: number;
  searchAttempts: number;
  estimatedCostUsd: string;
  unknownCostRequests: number;
  creditsConsumed: number;
  creditsRemaining: number | null;
  creditsReserved: number;
};
export type UsageOverview = {
  from: string;
  until: string;
  timezone: string;
  totals: UsageMetrics;
  byProvider: (UsageMetrics & { provider: Provider; model: string })[];
  series: (UsageMetrics & { bucket: string })[];
  providers: ProviderBudget[];
  configuredModel: string;
  credits: {
    issuedRemaining: number;
    reserved: number;
    consumedPeriod: number;
  };
  users: {
    items: UsageUser[];
    page: number;
    totalPages: number;
    total: number;
  };
  rates: UsageRate[];
  funding: {
    id: string;
    provider: Provider;
    amountUsd: string;
    kind: string;
    note: string;
    createdAt: string;
  }[];
  alerts: {
    id: string;
    provider: Provider;
    severity: string;
    remainingUsd: string;
    createdAt: string;
    resolvedAt: string | null;
    emailComplete: boolean;
    emailAttempts: number;
    recipients: string[];
    sentTo: string[];
  }[];
  latest: {
    id: string;
    provider: Provider;
    model: string;
    status: string;
    inputTokens: number | null;
    outputTokens: number | null;
    costUsd: string | null;
    durationMs: number;
    occurredAt: string;
    user: { fullName: string; email: string };
  }[];
};
export function getAiUsage(
  days: number,
  page: number,
  q: string,
  userId?: string,
) {
  const query = new URLSearchParams({
    days: String(days),
    page: String(page),
    q,
  });
  if (userId) query.set("userId", userId);
  return api.get<UsageOverview>(`/admin/ai-usage?${query}`, { auth: true });
}
export function checkAiAlerts() {
  return api.post("/admin/ai-usage/check", {}, { auth: true });
}
export function recordAiFunding(body: {
  operation?: "TOP_UP" | "BALANCE";
  provider: Provider;
  reference: string;
  amountUsd: string;
  note: string;
}) {
  return api.post("/admin/ai-usage/funding", body, { auth: true });
}
export function saveAiThresholds(body: {
  provider: Provider;
  warningPercent: number;
  criticalPercent: number;
  emailRecipients: string[];
}) {
  return api.put("/admin/ai-usage/settings", body, { auth: true });
}
export function saveAiRate(body: {
  provider: Provider;
  model: string;
  inputPerMillion: string;
  cachedInputPerMillion: string;
  outputPerMillion: string;
  searchPerThousand: string;
}) {
  return api.post("/admin/ai-usage/rates", body, { auth: true });
}
