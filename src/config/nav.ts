import {
  ArrowLeftRight,
  BarChart3,
  LayoutDashboard,
  LifeBuoy,
  ListChecks,
  Settings,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
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
      },
      { title: "Activities", href: "/activities", icon: ListChecks },
      { title: "Support", href: "/support", icon: LifeBuoy, badge: 6 },
    ],
  },
  {
    label: "Account",
    items: [{ title: "Settings", href: "/settings", icon: Settings }],
  },
];