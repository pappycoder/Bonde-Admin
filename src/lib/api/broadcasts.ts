import { api, type ApiList, type ListQuery } from "@/lib/api-client";

/** A sent in-app broadcast plus its delivery record. */
export interface Broadcast {
  id: string;
  title: string;
  body: string;
  recipientCount: number;
  sentBy: string | null;
  senderName: string | null;
  createdAt: string;
}

export interface BroadcastResult {
  id: string;
  title: string;
  recipientCount: number;
  sentAt: string;
  status: "sent";
}

/**
 * Sends a message to every active profile's in-app feed. In-app only: nothing
 * is emailed or pushed, so this is a one-way, non-reversible announcement.
 */
export function sendBroadcast(input: {
  title: string;
  body: string;
}): Promise<BroadcastResult> {
  return api.post<BroadcastResult>("/admin/broadcasts", input, { auth: true });
}

export function listBroadcasts(query?: ListQuery): Promise<ApiList<Broadcast>> {
  return api.list<Broadcast>("/admin/broadcasts", query);
}
