"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Operation = { id: string; userId: string; kind: string; status: string; amount: string; currency: string; updatedAt: string };
type Inbox = { id: string; provider: string; eventType: string; status: string; errorCode: string | null };
type Snapshot = {
  capabilities: { enabled: boolean; configured: boolean; environment: string; currencies: Record<string, { enabled: boolean }> };
  operations: Operation[];
  inbox: Inbox[];
  accounts: { currency: string; kind: string; _sum: { balance: string } }[];
  differences: { key: string; difference: string }[];
  customers: { userId: string; bankStatus: string; sudoStatus: string }[];
};

export default function FinancePage() {
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
  async function retry(path: string) {
    setBusy(true);
    try {await api.post(path, {}, {auth: true}); await refresh();}
    catch(e) {setError(e instanceof Error ? e.message : "Reconciliation failed.");}
    finally {setBusy(false);}
  }
  async function refresh() {
    try { setSnapshot(await api.get<Snapshot>("/admin/finance", { auth: true })); setError(undefined); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not load financial operations."); }
  }
  useEffect(() => {
    let active = true;
    api.get<Snapshot>("/admin/finance", { auth: true }).then(data => {
      if (active) setSnapshot(data);
    }).catch((e: unknown) => {
      if (active) setError(e instanceof Error ? e.message : "Could not load financial operations.");
    });
    return () => { active = false; };
  }, []);
  async function reconcile() {
    setBusy(true);
    try { await api.post("/admin/finance/reconcile", {}, { auth: true }); await refresh(); }
    catch (e) { setError(e instanceof Error ? e.message : "Reconciliation could not complete."); }
    finally { setBusy(false); }
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
      <Card><CardHeader><CardTitle>Recent operations</CardTitle></CardHeader><CardContent className="overflow-x-auto">
        <table className="w-full text-left text-sm"><thead><tr><th className="p-2">Reference</th><th>Action</th><th>Amount</th><th>Status</th><th>Updated</th></tr></thead><tbody>
          {snapshot.operations.map(op => <tr key={op.id} className="border-t"><td className="p-2 font-mono">{op.id}</td><td>{op.kind}</td><td>{op.amount} {op.currency}</td><td>{op.status}</td><td>{new Date(op.updatedAt).toLocaleString()}</td></tr>)}
        </tbody></table>{!snapshot.operations.length && <p>No operations yet.</p>}
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
