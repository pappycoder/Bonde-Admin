"use client";

import { Badge } from "@/components/ui/badge";
import {
  ResourceTablePanel,
  type Column,
} from "@/components/marketing/resource-table-panel";
import type { WaitlistSignup } from "@/lib/api/marketing";
import { timeAgo } from "@/lib/format";

const columns: Column<WaitlistSignup>[] = [
  {
    header: "Email",
    cell: (row) => <span className="font-medium">{row.email}</span>,
  },
  {
    header: "First name",
    cell: (row) =>
      row.firstName ||
      (!row.lastName && row.name) || (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    header: "Last name",
    cell: (row) =>
      row.lastName || <span className="text-muted-foreground">—</span>,
  },
  {
    header: "Phone",
    cell: (row) =>
      row.phone || <span className="text-muted-foreground">—</span>,
  },
  {
    header: "Source",
    cell: (row) =>
      row.source ? (
        <Badge variant="secondary">{row.source}</Badge>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    header: "Joined",
    cell: (row) => (
      <span className="text-muted-foreground" title={row.createdAt}>
        {timeAgo(row.createdAt)}
      </span>
    ),
  },
];

/** Website waitlist signups with confirmed single and bulk deletion. */
export function WaitlistTablePanel() {
  return (
    <ResourceTablePanel<WaitlistSignup>
      path="/admin/waitlist"
      title="Waitlist signups"
      description="Everyone who asked for early access from the website."
      searchPlaceholder="Search email, name or phone…"
      emptyTitle="No signups yet"
      emptyDescription="Waitlist signups from the website will appear here."
      columns={columns}
      deletable
      recordLabel={(row) => row.email}
    />
  );
}
