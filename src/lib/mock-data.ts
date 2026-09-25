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

export type TicketPriority = "low" | "medium" | "high" | "urgent";
export type TicketStatus = "open" | "pending" | "resolved";

export type TicketMessage = {
  from: "user" | "support";
  text: string;
  time: string;
};

export type Ticket = {
  id: string;
  user: string;
  userId: string;
  subject: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignee: string;
  updatedAt: string;
  initials: string;
  messages: TicketMessage[];
};

export const tickets: Ticket[] = [
  {
    id: "TKT-221",
    user: "Sofia Davis",
    userId: "USR-1038",
    subject: "Withdrawal blocked — account under review",
    priority: "urgent",
    status: "open",
    assignee: "Unassigned",
    updatedAt: "12 min ago",
    initials: "SD",
    messages: [
      {
        from: "user",
        text: "Hi, I've been trying to withdraw $250 but the action is blocked and it says my account is under review. Can you help?",
        time: "2 hours ago",
      },
      {
        from: "support",
        text: "Hi Sofia, thanks for reaching out. I'm checking what triggered the review on your account.",
        time: "1 hour ago",
      },
      {
        from: "user",
        text: "Thanks. I've never had an issue with withdrawals before.",
        time: "25 min ago",
      },
    ],
  },
  {
    id: "TKT-220",
    user: "Isabella Nguyen",
    userId: "USR-1040",
    subject: "KYC verification stuck on document upload",
    priority: "high",
    status: "pending",
    assignee: "T. Reed",
    updatedAt: "1 hour ago",
    initials: "IN",
    messages: [
      {
        from: "user",
        text: "My KYC verification is stuck on the document upload step for over a week now.",
        time: "4 hours ago",
      },
      {
        from: "support",
        text: "Thanks Isabella. I can see the upload on our side — checking with the verification team.",
        time: "2 hours ago",
      },
      {
        from: "user",
        text: "I re-uploaded my passport just now in case the first one was rejected.",
        time: "1 hour ago",
      },
    ],
  },
  {
    id: "TKT-219",
    user: "Ethan Brown",
    userId: "USR-1037",
    subject: "Card declined twice at checkout",
    priority: "medium",
    status: "open",
    assignee: "Unassigned",
    updatedAt: "3 hours ago",
    initials: "EB",
    messages: [
      {
        from: "user",
        text: "My card was declined twice while trying to pay for an order today.",
        time: "5 hours ago",
      },
      {
        from: "support",
        text: "Sorry about that. Can you confirm the last four digits of the card and the merchant?",
        time: "3 hours ago",
      },
    ],
  },
  {
    id: "TKT-218",
    user: "Mia Garcia",
    userId: "USR-1036",
    subject: "How to export transaction history?",
    priority: "low",
    status: "resolved",
    assignee: "A. Silva",
    updatedAt: "Yesterday",
    initials: "MG",
    messages: [
      {
        from: "user",
        text: "How do I export my transaction history as a CSV file?",
        time: "2 days ago",
      },
      {
        from: "support",
        text: "Hi Mia, go to Transactions → Export and choose CSV or PDF. Let me know if it's missing!",
        time: "Yesterday",
      },
    ],
  },
  {
    id: "TKT-217",
    user: "Liam Johnson",
    userId: "USR-1035",
    subject: "Deposit not reflecting after 4 hours",
    priority: "high",
    status: "pending",
    assignee: "T. Reed",
    updatedAt: "Yesterday",
    initials: "LJ",
    messages: [
      {
        from: "user",
        text: "I made a deposit 4 hours ago and it still hasn't reflected in my balance.",
        time: "4 hours ago",
      },
      {
        from: "support",
        text: "Thanks Liam, I can see the deposit is queued — the provider is slow today. We'll update you.",
        time: "2 hours ago",
      },
    ],
  },
  {
    id: "TKT-216",
    user: "Jackson Lee",
    userId: "USR-1041",
    subject: "Change linked bank account",
    priority: "medium",
    status: "resolved",
    assignee: "A. Silva",
    updatedAt: "2 days ago",
    initials: "JL",
    messages: [
      {
        from: "user",
        text: "Please help me change the bank account linked to my Bonde wallet.",
        time: "3 days ago",
      },
      {
        from: "support",
        text: "Sure Jackson — verified your new account and unlinked the old one. Done!",
        time: "2 days ago",
      },
    ],
  },
  {
    id: "TKT-215",
    user: "Olivia Martin",
    userId: "USR-1042",
    subject: "Request higher daily transfer limit",
    priority: "low",
    status: "open",
    assignee: "Unassigned",
    updatedAt: "2 days ago",
    initials: "OM",
    messages: [
      {
        from: "user",
        text: "I'd like to request a higher daily transfer limit than the current one.",
        time: "2 days ago",
      },
    ],
  },
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