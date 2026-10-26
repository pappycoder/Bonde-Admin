import {
  ArrowLeftRight,
  BarChart3,
  LayoutDashboard,
  LifeBuoy,
  ListChecks,
  Mail,
  Settings,
  UserPlus,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  /**
   * Resolved at render time from `GET /admin/stats` rather than hardcoded, so
   * the count cannot drift from the real queue depth.
   */
  badgeKey?: "openTickets" | "pendingReviews";
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export const navGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { title: "Analytics", href: "/analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Management",
    items: [
      { title: "Users", href: "/users", icon: Users },
      {
        title: "Transactions",
        href: "/transactions",
        icon: ArrowLeftRight,
        badgeKey: "pendingReviews",
      },
      { title: "Financial operations", href: "/finance", icon: ArrowLeftRight },
      { title: "Activities", href: "/activities", icon: ListChecks },
      {
        title: "Support",
        href: "/support",
        icon: LifeBuoy,
        badgeKey: "openTickets",
      },
    ],
  },
  {
    label: "Marketing",
    items: [
      { title: "Waitlist", href: "/waitlist", icon: UserPlus },
      { title: "Contacts", href: "/contacts", icon: Mail },
    ],
  },
  {
    label: "Account",
    items: [{ title: "Settings", href: "/settings", icon: Settings }],
  },
];
