"use client";

import { useRef, useState } from "react";
import { ChevronDown, Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { loadListReport, type ExportReport } from "@/lib/list-export";
import type { ListQuery } from "@/lib/api-client";
import type { ExportFormat } from "@/lib/export-report";

type ExportMenuProps = { disabled?: boolean } & (
  | { path: string; title: string; query: ListQuery; report?: never }
  | { report: ExportReport; path?: never; title?: never; query?: never }
);

export function ExportMenu(props: ExportMenuProps) {
  const [busy, setBusy] = useState(false);
  const exporting = useRef(false);
  async function run(format: ExportFormat) {
    if (exporting.current) return;
    exporting.current = true;
    setBusy(true);
    try {
      const report = props.report ?? await loadListReport(props.path!, props.title!, props.query!);
      const { exportReport } = await import("@/lib/export-report");
      await exportReport(report, format);
      toast.success(`${format.toUpperCase()} exported`, { description: `${report.rows.length.toLocaleString()} records downloaded.` });
    } catch (error) {
      toast.error("Export failed", { description: error instanceof Error ? error.message : "Please try again." });
    } finally {
      exporting.current = false;
      setBusy(false);
    }
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={props.disabled || busy} aria-label={busy ? "Preparing export" : "Export list"} className="shrink-0 gap-2 border-primary/25 hover:border-primary/50 hover:bg-primary/5">
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4 text-primary" />}
          {busy ? "Exporting…" : "Export"}<ChevronDown className="size-3.5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 p-2">
        <DropdownMenuLabel className="space-y-1">
          <span className="block">Export records</span>
          <span className="block text-xs font-normal text-muted-foreground">{props.report ? "Selected report period" : "All results matching applied filters"}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => void run("xlsx")} className="gap-3 py-3">
          <FileSpreadsheet className="size-5 text-emerald-600" /><span>Excel spreadsheet<span className="block text-xs text-muted-foreground">.xlsx · Filter and analyse</span></span>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => void run("pdf")} className="gap-3 py-3">
          <FileText className="size-5 text-primary" /><span>PDF document<span className="block text-xs text-muted-foreground">.pdf · Branded, ready to share</span></span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
