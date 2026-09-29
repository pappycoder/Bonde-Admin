/** Minimal RFC 4180 CSV: quote any cell containing a comma, quote or newline. */
function cell(value: string | number): string {
  const text = String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** Joins a header row and data rows into a CSV document. */
export function toCsv(
  headers: string[],
  rows: Array<Array<string | number>>,
): string {
  return [headers, ...rows].map((row) => row.map(cell).join(",")).join("\r\n");
}

/** Hands the browser a file download, then releases the object URL. */
export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
