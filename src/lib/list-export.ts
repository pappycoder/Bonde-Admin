import { api, type ListQuery } from "@/lib/api-client";

export type ExportCell = string | number;
export interface ExportReport {
  title: string;
  headers: string[];
  rows: ExportCell[][];
  scope: string;
}

// Explicit fields keep exports useful and prevent accidental inclusion of API metadata.
const fields: Record<string, [string, string][]> = {
  "/admin/users": [["fullName", "Name"], ["email", "Email"], ["phone", "Phone"], ["status", "Status"], ["balance", "Balance"], ["currency", "Currency"], ["emailVerified", "Email verified"], ["phoneVerified", "Phone verified"], ["joinedAt", "Joined (UTC)"]],
  "/admin/transactions": [["id", "Reference"], ["user", "User"], ["userEmail", "Email"], ["type", "Type"], ["status", "Status"], ["amount", "Amount"], ["currency", "Currency"], ["method", "Method"], ["createdAt", "Created (UTC)"]],
  "/admin/support-tickets": [["id", "Ticket ID"], ["subject", "Subject"], ["user", "User"], ["userEmail", "Email"], ["status", "Status"], ["priority", "Priority"], ["assignee", "Assignee"], ["createdAt", "Created (UTC)"]],
  "/admin/audit-logs": [["id", "Event ID"], ["userId", "Actor ID"], ["action", "Action"], ["entityType", "Entity type"], ["entityId", "Entity ID"], ["ipAddress", "IP address"], ["createdAt", "Created (UTC)"]],
  "/admin/waitlist": [["email", "Email"], ["name", "Name"], ["source", "Source"], ["createdAt", "Joined (UTC)"]],
  "/admin/contacts": [["name", "Name"], ["email", "Email"], ["subject", "Subject"], ["message", "Message"], ["createdAt", "Received (UTC)"]],
};

export async function loadListReport(path: string, title: string, query: ListQuery): Promise<ExportReport> {
  const columns = fields[path];
  if (!columns) throw new Error("Export is unavailable for this list.");
  const records: Record<string, unknown>[] = [];
  let page = 1;
  for (;;) {
    const result = await api.list<Record<string, unknown>>(path, { ...query, page, pageSize: 100 });
    records.push(...result.items);
    if (page >= result.totalPages) break;
    if (!result.items.length) throw new Error("The list changed during export. Please try again.");
    page++;
  }
  const filters = [query.q ? `Search: ${query.q}` : "", query.status ? `Status: ${query.status}` : "", query.uiStatus ? `Status: ${query.uiStatus}` : "", ...(Array.isArray(query.filter) ? query.filter : [query.filter])].filter(Boolean);
  return {
    title,
    headers: columns.map(([, label]) => label),
    rows: records.map((record) => columns.map(([key]) => {
      const value = record[key];
      if (typeof value === "boolean") return value ? "Yes" : "No";
      if (typeof value === "number") return value;
      if (typeof value !== "string") return "";
      if (key.endsWith("At")) return new Date(value).toISOString();
      return value;
    })),
    scope: filters.length ? filters.join(" · ") : "All records",
  };
}
