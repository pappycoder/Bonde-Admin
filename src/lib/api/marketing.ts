import { api, type ApiList, type ListQuery } from "@/lib/api-client";

/**
 * Admin lists for the public website's resources.
 * Waitlist records also support deletion through the registry API.
 */
export interface WaitlistSignup {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
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

export function listWaitlist(
  query?: ListQuery,
): Promise<ApiList<WaitlistSignup>> {
  return api.list<WaitlistSignup>("/admin/waitlist", query);
}

export function listContacts(
  query?: ListQuery,
): Promise<ApiList<ContactMessage>> {
  return api.list<ContactMessage>("/admin/contacts", query);
}
