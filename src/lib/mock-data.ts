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

export type WeeklyVolumePoint = {
  day: string;
  transactions: number;
};

export const weeklyVolume: WeeklyVolumePoint[] = [
  { day: "Mon", transactions: 132 },
  { day: "Tue", transactions: 148 },
  { day: "Wed", transactions: 121 },
  { day: "Thu", transactions: 165 },
  { day: "Fri", transactions: 178 },
  { day: "Sat", transactions: 149 },
  { day: "Sun", transactions: 102 },
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