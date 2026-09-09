export type RevenuePoint = {
  month: string;
  revenue: number;
  expenses: number;
};

export const revenueData: RevenuePoint[] = [
  { month: "Jan", revenue: 18400, expenses: 12100 },
  { month: "Feb", revenue: 19600, expenses: 12900 },
  { month: "Mar", revenue: 20800, expenses: 13300 },
  { month: "Apr", revenue: 22100, expenses: 14100 },
  { month: "May", revenue: 21400, expenses: 14500 },
  { month: "Jun", revenue: 23800, expenses: 15200 },
  { month: "Jul", revenue: 25100, expenses: 14900 },
  { month: "Aug", revenue: 24600, expenses: 15800 },
  { month: "Sep", revenue: 27200, expenses: 16300 },
  { month: "Oct", revenue: 28600, expenses: 17000 },
  { month: "Nov", revenue: 30900, expenses: 17800 },
  { month: "Dec", revenue: 33200, expenses: 18400 },
];

export type OrderStatus =
  | "completed"
  | "processing"
  | "pending"
  | "cancelled"
  | "refunded";

export type Order = {
  id: string;
  customer: string;
  email: string;
  date: string;
  amount: number;
  status: OrderStatus;
};

export const orders: Order[] = [
  {
    id: "#BD-2819",
    customer: "Olivia Martin",
    email: "olivia@example.com",
    date: "Sep 06, 2026",
    amount: 1249,
    status: "completed",
  },
  {
    id: "#BD-2818",
    customer: "Jackson Lee",
    email: "jackson@example.com",
    date: "Sep 06, 2026",
    amount: 89.99,
    status: "processing",
  },
  {
    id: "#BD-2817",
    customer: "Isabella Nguyen",
    email: "isabella@example.com",
    date: "Sep 05, 2026",
    amount: 459.5,
    status: "pending",
  },
  {
    id: "#BD-2816",
    customer: "William Kim",
    email: "william@example.com",
    date: "Sep 05, 2026",
    amount: 32,
    status: "refunded",
  },
  {
    id: "#BD-2815",
    customer: "Sofia Davis",
    email: "sofia@example.com",
    date: "Sep 04, 2026",
    amount: 1999,
    status: "completed",
  },
  {
    id: "#BD-2814",
    customer: "Ethan Brown",
    email: "ethan@example.com",
    date: "Sep 04, 2026",
    amount: 79.99,
    status: "cancelled",
  },
  {
    id: "#BD-2813",
    customer: "Mia Garcia",
    email: "mia@example.com",
    date: "Sep 03, 2026",
    amount: 640,
    status: "processing",
  },
  {
    id: "#BD-2812",
    customer: "Liam Johnson",
    email: "liam@example.com",
    date: "Sep 03, 2026",
    amount: 214,
    status: "completed",
  },
];

export type Activity = {
  id: string;
  actor: string;
  action: string;
  detail: string;
  time: string;
  initials: string;
  tone?: "primary" | "success" | "warning" | "muted";
};

export const activities: Activity[] = [
  {
    id: "1",
    actor: "Olivia Martin",
    action: "placed a new order",
    detail: "#BD-2819",
    time: "2 minutes ago",
    initials: "OM",
    tone: "success",
  },
  {
    id: "2",
    actor: "Jackson Lee",
    action: "requested a pickup",
    detail: "#BD-2818",
    time: "26 minutes ago",
    initials: "JL",
  },
  {
    id: "3",
    actor: "Isabella Nguyen",
    action: "updated payment method",
    detail: "Visa •••• 4242",
    time: "1 hour ago",
    initials: "IN",
    tone: "warning",
  },
  {
    id: "4",
    actor: "Sofia Davis",
    action: "left a 5-star review",
    detail: "on Bonde Pro",
    time: "3 hours ago",
    initials: "SD",
    tone: "primary",
  },
  {
    id: "5",
    actor: "System",
    action: "completed weekly backup",
    detail: "Deploy #4281",
    time: "6 hours ago",
    initials: "SY",
    tone: "muted",
  },
];

export type WeeklyOrderPoint = {
  day: string;
  orders: number;
};

export const weeklyOrders: WeeklyOrderPoint[] = [
  { day: "Mon", orders: 132 },
  { day: "Tue", orders: 148 },
  { day: "Wed", orders: 121 },
  { day: "Thu", orders: 165 },
  { day: "Fri", orders: 178 },
  { day: "Sat", orders: 149 },
  { day: "Sun", orders: 102 },
];

export type TrafficSource = {
  name: string;
  value: number;
  fill: string;
};

export const trafficSources: TrafficSource[] = [
  { name: "Organic search", value: 4200, fill: "var(--color-organic)" },
  { name: "Direct", value: 3100, fill: "var(--color-direct)" },
  { name: "Referral", value: 2200, fill: "var(--color-referral)" },
  { name: "Social", value: 1300, fill: "var(--color-social)" },
];