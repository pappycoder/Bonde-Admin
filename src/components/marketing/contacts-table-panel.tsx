"use client";

import {
  ResourceTablePanel,
  type Column,
} from "@/components/marketing/resource-table-panel";
import type { ContactMessage } from "@/lib/api/marketing";
import { timeAgo } from "@/lib/format";

const columns: Column<ContactMessage>[] = [
  {
    header: "From",
    cell: (row) => (
      <span className="flex flex-col">
        <span className="font-medium">{row.name}</span>
        <span className="text-xs text-muted-foreground">{row.email}</span>
      </span>
    ),
  },
  {
    header: "Subject",
    cell: (row) => row.subject || <span className="text-muted-foreground">—</span>,
  },
  {
    header: "Message",
    className: "max-w-[32rem] whitespace-normal",
    cell: (row) => (
      <span className="block truncate" title={row.message}>
        {row.message}
      </span>
    ),
  },
  {
    header: "Received",
    cell: (row) => (
      <span className="text-muted-foreground" title={row.createdAt}>
        {timeAgo(row.createdAt)}
      </span>
    ),
  },
];

/** Read-only list of messages submitted through the website contact form. */
export function ContactsTablePanel() {
  return (
    <ResourceTablePanel<ContactMessage>
      path="/admin/contacts"
      title="Contact messages"
      description="Enquiries submitted through the website contact form."
      searchPlaceholder="Search name, email or subject…"
      emptyTitle="No messages yet"
      emptyDescription="Messages sent from the website will appear here."
      columns={columns}
    />
  );
}
