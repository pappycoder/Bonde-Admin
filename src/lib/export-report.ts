import type { ExportReport } from "@/lib/list-export";

export type ExportFormat = "xlsx" | "pdf";

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function assetData(path: string) {
  const response = await fetch(path);
  if (!response.ok) throw new Error("Could not load a report asset. Please try again.");
  const blob = await response.blob();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function exportReport(report: ExportReport, format: ExportFormat) {
  if (!report.rows.length) throw new Error("No records match the current filters.");
  const logo = await assetData("/bonde-logo.png");
  const image = new Image();
  image.src = logo;
  await image.decode();
  const ratio = image.naturalHeight / image.naturalWidth;
  const created = new Date();
  const stamp = created.toISOString().slice(0, 10);
  const filename = `bonde-${report.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${stamp}.${format}`;
  const summary = `${report.rows.length.toLocaleString()} records | Generated ${created.toISOString().replace("T", " ").slice(0, 19)} UTC`;

  if (format === "xlsx") {
    const { Workbook } = await import("exceljs");
    const workbook = new Workbook();
    workbook.creator = "Bonde";
    workbook.created = created;
    const sheet = workbook.addWorksheet("Report", { views: [{ state: "frozen", ySplit: 6 }] });
    const count = report.headers.length;
    sheet.mergeCells(1, 1, 1, count);
    sheet.getRow(1).height = 48;
    const imageId = workbook.addImage({ base64: logo, extension: "png" });
    sheet.addImage(imageId, { tl: { col: 0.15, row: 0.1 }, ext: { width: 120, height: Math.min(58, 120 * ratio) } });
    for (const [row, value] of [[2, report.title], [3, summary], [4, report.scope]] as const) {
      sheet.mergeCells(row, 1, row, count);
      sheet.getCell(row, 1).value = value;
    }
    sheet.getRow(2).font = { name: "Calibri", size: 20, bold: true, color: { argb: "FF23030A" } };
    sheet.getRow(2).height = 32;
    sheet.getRow(4).alignment = { wrapText: true, vertical: "top" };
    sheet.getRow(4).height = 32;
    sheet.getRow(6).values = report.headers;
    sheet.getRow(6).height = 28;
    sheet.getRow(6).eachCell((cell) => {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFF4B00" } };
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.alignment = { vertical: "middle" };
    });
    for (const values of report.rows) {
      const row = sheet.addRow(values);
      row.alignment = { vertical: "top", wrapText: true };
      row.eachCell((cell) => {
        cell.font = { name: "Calibri", size: 11, color: { argb: "FF23030A" } };
        if (row.number % 2 === 1) cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFF4EE" } };
      });
    }
    sheet.columns.forEach((column, index) => {
      column.width = Math.min(52, Math.max(18, report.headers[index].length + 3, ...report.rows.slice(0, 100).map((row) => String(row[index]).length + 2)));
    });
    sheet.autoFilter = { from: { row: 6, column: 1 }, to: { row: 6 + report.rows.length, column: count } };
    const buffer = await workbook.xlsx.writeBuffer();
    download(new Blob([new Uint8Array(buffer)], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), filename);
  } else {
    const [{ jsPDF }, { autoTable }] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);
    const doc = new jsPDF({ orientation: "landscape", format: "a4" });
    const font = await assetData("/fonts/report-sans.ttf");
    doc.addFileToVFS("report-sans.ttf", font.split(",")[1]);
    doc.addFont("report-sans.ttf", "ReportSans", "normal");
    doc.addFont("report-sans.ttf", "ReportSans", "bold");
    doc.setFont("ReportSans");
    doc.setProperties({ title: report.title, author: "Bonde", creator: "Bonde Admin" });
    const scopeLines = doc.setFontSize(8).splitTextToSize(report.scope, 265);
    const top = 44 + scopeLines.length * 4;
    autoTable(doc, {
      head: [report.headers],
      body: report.rows,
      margin: { top, bottom: 16, left: 14, right: 14 },
      styles: { font: "ReportSans", fontSize: 8, cellPadding: 3, overflow: "linebreak", textColor: [35, 3, 10] },
      headStyles: { fillColor: [255, 75, 0], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [255, 244, 238] },
      willDrawPage: () => {
        doc.addImage(logo, "PNG", 14, 9, 30, Math.min(14, 30 * ratio));
        doc.setTextColor(35, 3, 10).setFontSize(18).text(report.title, 14, 31);
        doc.setFontSize(8).setTextColor(100).text(summary, 14, 37);
        doc.text(scopeLines, 14, 42);
      },
    });
    const pages = doc.getNumberOfPages();
    for (let page = 1; page <= pages; page++) {
      doc.setPage(page);
      doc.setDrawColor(230).line(14, 196, 283, 196);
      doc.setFontSize(8).setTextColor(100).text("Bonde | Admin report", 14, 202);
      doc.text(`Page ${page} of ${pages}`, 283, 202, { align: "right" });
    }
    download(doc.output("blob"), filename);
  }
}
