"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Operation = { id: string; userId: string; kind: string; status: string; amount: string; currency: string; updatedAt: string; result?: {reason?: string; providerStatus?: string; providerCancellation?: string} };
type Inbox = { id: string; provider: string; eventType: string; status: string; errorCode: string | null };
type Catalog = {id: string; label: string; website?: string; status: string; version: number; identityIds: string[]; evidence: string[]};
type Snapshot = {
  retirements: {id: string; userId: string; retirementReason: string; retirementStatus: string; status: string}[];
  capabilities: { enabled: boolean; configured: boolean; environment: string; currencies: Record<string, { enabled: boolean }> };
  operations: Operation[];
  authorizations: {id: string; userId: string; cardId: string; amount: string; currency: string; merchantName: string; status: string}[];
  inbox: Inbox[];
  accounts: { currency: string; kind: string; _sum: { balance: string } }[];
  differences: { key: string; difference: string }[];
  customers: { userId: string; bankStatus: string; sudoStatus: string }[];
};

export default function FinancePage() {
  const [catalog, setCatalog] = useState<Catalog[]>([]);
  const [label, setLabel] = useState('');
  const [website, setWebsite] = useState('');
  const [evidence, setEvidence] = useState('');
  const [reviewId, setReviewId] = useState<string>();
  const [snapshot, setSnapshot] = useState<Snapshot>();
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [liquidity, setLiquidity] = useState<{ provider: string; currency: string; available: string | null }[]>();
  async function inspectLiquidity() {
    setBusy(true);
    try { const value = await api.get<{snapshots: {provider: string; currency: string; available: string | null}[]}>("/admin/finance/liquidity", {auth: true}); setLiquidity(value.snapshots); }
    catch(e) {setError(e instanceof Error ? e.message : "Could not query settlement liquidity.");}
    finally {setBusy(false);}
  }
  async function retry(path: string, body: Record<string, unknown> = {}) {
    setBusy(true);
    try {await api.post(path, body, {auth: true}); await refresh();}
    catch(e) {setError(e instanceof Error ? e.message : "Reconciliation failed.");}
    finally {setBusy(false);}
  }
  async function refresh() {
    try { const [data, merchants] = await Promise.all([api.get<Snapshot>("/admin/finance", { auth: true }), api.get<Catalog[]>("/admin/finance/merchant-catalog", {auth: true})]); setSnapshot(data); setCatalog(merchants); setError(undefined); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not load financial operations."); }
  }
  useEffect(() => {
    let active = true;
    api.get<Snapshot>("/admin/finance", { auth: true }).then(data => {
      if (active) setSnapshot(data);
    }).catch((e: unknown) => {
      if (active) setError(e instanceof Error ? e.message : "Could not load financial operations.");
    });
    api.get<Catalog[]>("/admin/finance/merchant-catalog", {auth: true}).then(data => { if (active) setCatalog(data); }).catch((e: unknown) => { if (active) setError(e instanceof Error ? e.message : "Could not load catalog."); });
    return () => { active = false; };
  }, []);
  async function reconcile() {
    setBusy(true);
    try { await api.post("/admin/finance/reconcile", {}, { auth: true }); await refresh(); }
    catch (e) { setError(e instanceof Error ? e.message : "Reconciliation could not complete."); }
    finally { setBusy(false); }
  }
  async function reviewMerchant(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(undefined);
    try {
      await api.post("/admin/finance/merchant-catalog/review", {id: reviewId, label: label.trim(), website: website.trim() || undefined, authorizationIds: evidence.split(/[\s,]+/).filter(Boolean)}, {auth: true});
      setLabel(""); setWebsite(""); setEvidence(""); setReviewId(undefined); await refresh();
    } catch(e) {setError(e instanceof Error ? e.message : "Provider evidence could not be verified.");}
    finally {setBusy(false);}
  }
  return <div className="flex flex-col gap-6">
    <PageHeader title="Financial operations" description="Live card operations, reserved funds and reconciliation queues." />
    <div className="flex gap-3"><Button onClick={() => void refresh()} disabled={busy}>Refresh</Button>
      <Button onClick={() => void reconcile()} disabled={busy || !snapshot?.capabilities.enabled}>{busy ? "Reconciling…" : "Process and reconcile"}</Button></div>
    {error && <p role="alert" className="text-destructive">{error}</p>}
    {!snapshot && !error && <p>Loading financial operations…</p>}
    {snapshot && <>
      <Card><CardHeader><CardTitle>Programme availability</CardTitle></CardHeader><CardContent>
        <p>{snapshot.capabilities.environment} · {snapshot.capabilities.enabled ? "Enabled" : "Disabled"} · {snapshot.capabilities.configured ? "Configured" : "Setup incomplete"}</p>
        {Object.entries(snapshot.capabilities.currencies).map(([currency, value]) => <p key={currency}>{currency}: {value.enabled ? "Available" : "Awaiting validation"}</p>)}
      </CardContent></Card>
      <Card><CardHeader><CardTitle>Ledger balances</CardTitle></CardHeader><CardContent>
        <p className="mb-3 text-sm text-muted-foreground">Ledger totals are accounting balances. Linked provider balances may represent the same money and must not be added together.</p>
        <Button onClick={() => void inspectLiquidity()} disabled={busy}>Check provider liquidity</Button>
        {liquidity?.map((row) => <p key={`${row.provider}:${row.currency}`}>{row.provider} · {row.currency}: {row.available ?? "Unavailable"}</p>)}
        {snapshot.accounts.map(a => <p key={`${a.currency}:${a.kind}`}>{a.currency} · {a.kind}: {a._sum.balance}</p>)}
        {!snapshot.accounts.length && <p>No live entries yet.</p>}
        {snapshot.differences.map(d => <p key={d.key} role="alert" className="text-destructive">Mismatch: {d.key} · {d.difference}</p>)}
      </CardContent></Card>
      <Card><CardHeader><CardTitle>Verified merchant catalog</CardTitle></CardHeader><CardContent>
        <p className="mb-3 text-sm text-muted-foreground">Build entries from Sudo authorization evidence for this programme. Publishing makes these identities selectable; existing cards keep their confirmed identity snapshots. Revoking blocks the affected identities immediately.</p>
        <form onSubmit={reviewMerchant} className="flex flex-col gap-3 mb-6">
          <label>Merchant label<input className="block border rounded p-2 w-full" required maxLength={100} value={label} onChange={e => setLabel(e.target.value)} /></label>
          <label>Website origin (optional)<input className="block border rounded p-2 w-full" type="url" value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://merchant.example" /></label>
          <label>Sudo authorization references (up to 20)<textarea className="block border rounded p-2 w-full" required value={evidence} onChange={e => setEvidence(e.target.value)} /></label>
          <Button type="submit" disabled={busy}>{reviewId ? "Verify revised draft" : "Verify evidence and save draft"}</Button>
        </form>
        {catalog.map(row => <div key={row.id} className="border-t py-3">
          <p>{row.label} · {row.status} · version {row.version}</p><p className="text-sm">{row.website} · {row.identityIds.length} verified identities</p>
          <p className="font-mono text-xs break-all">Evidence: {row.evidence.join(", ")}</p>
          <div className="flex gap-2 mt-2">
            <Button variant="outline" disabled={busy} onClick={() => {setReviewId(row.id); setLabel(row.label); setWebsite(row.website ?? ""); setEvidence(row.evidence.join("\n"));}}>Revise evidence</Button>
            {row.status === "DRAFT" && <Button disabled={busy} onClick={() => void retry(`/admin/finance/merchant-catalog/${row.id}/publish`, {version: row.version})}>Publish verified entry</Button>}
            {row.status === "PUBLISHED" && <Button variant="destructive" disabled={busy} onClick={() => {if (window.confirm(`Revoke ${row.label}? Purchases using these identities will be blocked, including on existing cards.`)) void retry(`/admin/finance/merchant-catalog/${row.id}/revoke`, {version: row.version});}}>Revoke identities</Button>}
          </div>
        </div>)}
        {!catalog.length && <p>No verified catalog entries yet.</p>}
      </CardContent></Card>
      <Card><CardHeader><CardTitle>Permanent card retirement</CardTitle></CardHeader><CardContent>
        <p className="text-sm text-muted-foreground">RETIRED confirms deactivation and return of available allocation after holds resolve. Provider cancellation remains separate because normal closure is unavailable under the supported cancellation reasons.</p>
        {(snapshot.retirements ?? []).map(row => <p key={row.id} className="border-t py-2"><span className="font-mono text-xs">{row.id}</span> · {row.retirementReason} · {row.retirementStatus} · Provider state: {row.status}</p>)}
        {!snapshot.retirements?.length && <p>No retired cards.</p>}
      </CardContent></Card>
      <Card><CardHeader><CardTitle>Recent operations</CardTitle></CardHeader><CardContent className="overflow-x-auto">
        <table className="w-full text-left text-sm"><thead><tr><th className="p-2">Reference</th><th>Action</th><th>Amount</th><th>Status</th><th>Updated</th></tr></thead><tbody>
          {snapshot.operations.map(op => <tr key={op.id} className="border-t"><td className="p-2 font-mono">{op.id}</td><td>{op.kind}</td><td>{op.amount} {op.currency}</td><td>{op.status}{op.result?.reason && <p className="text-xs">{op.result.reason}</p>}{op.result?.providerCancellation && <p className="text-xs">Provider cancellation: {op.result.providerCancellation}</p>}</td><td>{new Date(op.updatedAt).toLocaleString()}</td></tr>)}
        </tbody></table>{!snapshot.operations.length && <p>No operations yet.</p>}
      </CardContent></Card>
      <Card><CardHeader><CardTitle>Customer purchase approvals</CardTitle></CardHeader><CardContent>
        <p className="mb-3 text-sm text-muted-foreground">These purchases await customer approval in the app. Approval permits one matching merchant retry.</p>
        {(snapshot.authorizations ?? []).map(authorization => <p key={authorization.id} className="py-2 border-t">{authorization.merchantName} · {authorization.amount} {authorization.currency} · {authorization.status}<br /><span className="font-mono text-xs">Customer: {authorization.userId} · Request: {authorization.id}</span></p>)}
        {!snapshot.authorizations?.length && <p>No purchases awaiting customer approval.</p>}
      </CardContent></Card>
      <Card><CardHeader><CardTitle>Events requiring attention</CardTitle></CardHeader><CardContent>
        {snapshot.inbox.map(event => <p key={event.id}>{event.provider} · {event.eventType} · {event.status} · {event.errorCode} <Button variant="outline" size="sm" disabled={busy} onClick={() => void retry(`/admin/finance/inbox/${event.id}/retry`)}>Retry verification</Button></p>)}
        {!snapshot.inbox.length && <p>No outstanding events.</p>}
      </CardContent></Card>
      <Card><CardHeader><CardTitle>Identity setup requiring reconciliation</CardTitle></CardHeader><CardContent>
        {snapshot.customers.map(customer => <p key={customer.userId}>{customer.userId} · Banking: {customer.bankStatus} · Cards: {customer.sudoStatus} <Button variant="outline" size="sm" disabled={busy} onClick={() => void retry(`/admin/finance/customers/${customer.userId}/reconcile`)}>Find provider records</Button></p>)}
        {!snapshot.customers.length && <p>No interrupted identity setups.</p>}
      </CardContent></Card>
    </>}
  </div>;
}
