import { api, type ApiList, type ListQuery } from "@/lib/api-client";

export type NotificationStatus = "UNREAD" | "READ";
export type NotificationType = "SYSTEM" | "CARD" | "TRANSACTION";

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  content: string;
  status: NotificationStatus;
  type: NotificationType;
  metadata: Record<string, unknown> | null;
  readAt: string | null;
  createdAt: string;
}

export function listNotifications(query?: ListQuery): Promise<ApiList<AppNotification>> {
  return api.list<AppNotification>("/notifications", query);
}

export async function markNotificationRead(id: string): Promise<AppNotification> {
  return api.patch<AppNotification>(`/notifications/${id}/read`);
}

export async function markAllNotificationsRead(): Promise<{ updated: number }> {
  return api.patch<{ updated: number }>("/notifications/read-all");
}