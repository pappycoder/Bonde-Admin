import { api, type ApiList, type ListQuery } from "@/lib/api-client";

/**
 * Read-only admin surface for the public website's two write-only resources.
 * Both are registry `list`/`get` resources (`waitlist`, `contacts`) — there is
 * no create/update/delete on this side.
 */
export interface WaitlistSignup {
  id: string;
  email: string;
  name: string | null;
  source: string | null;
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  createdAt: string;
}

export function listWaitlist(query?: ListQuery): Promise<ApiList<WaitlistSignup>> {
  return api.list<WaitlistSignup>("/admin/waitlist", query);
}

export function listContacts(query?: ListQuery): Promise<ApiList<ContactMessage>> {
  return api.list<ContactMessage>("/admin/contacts", query);
}
