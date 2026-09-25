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

export type UserStatus = "active" | "suspended" | "pending";

export type User = {
  id: string;
  name: string;
  email: string;
  status: UserStatus;
  riskScore: number;
  balance: number;
  lastActive: string;
  joined: string;
  initials: string;
};

export const users: User[] = [
  {
    id: "USR-1042",
    name: "Olivia Martin",
    email: "olivia@example.com",
    status: "active",
    riskScore: 12,
    balance: 12490.5,
    lastActive: "2 min ago",
    joined: "Mar 2025",
    initials: "OM",
  },
  {
    id: "USR-1041",
    name: "Jackson Lee",
    email: "jackson@example.com",
    status: "active",
    riskScore: 27,
    balance: 4380,
    lastActive: "26 min ago",
    joined: "Jun 2025",
    initials: "JL",
  },
  {
    id: "USR-1040",
    name: "Isabella Nguyen",
    email: "isabella@example.com",
    status: "pending",
    riskScore: 61,
    balance: 0,
    lastActive: "1 hour ago",
    joined: "Aug 2026",
    initials: "IN",
  },
  {
    id: "USR-1039",
    name: "William Kim",
    email: "william@example.com",
    status: "active",
    riskScore: 8,
    balance: 8750.25,
    lastActive: "3 hours ago",
    joined: "Jan 2026",
    initials: "WK",
  },
  {
    id: "USR-1038",
    name: "Sofia Davis",
    email: "sofia@example.com",
    status: "suspended",
    riskScore: 88,
    balance: 1240,
    lastActive: "Aug 30, 2026",
    joined: "Nov 2025",
    initials: "SD",
  },
  {
    id: "USR-1037",
    name: "Ethan Brown",
    email: "ethan@example.com",
    status: "active",
    riskScore: 34,
    balance: 2120,
    lastActive: "5 hours ago",
    joined: "Feb 2026",
    initials: "EB",
  },
  {
    id: "USR-1036",
    name: "Mia Garcia",
    email: "mia@example.com",
    status: "active",
    riskScore: 45,
    balance: 9860,
    lastActive: "Yesterday",
    joined: "Apr 2026",
    initials: "MG",
  },
  {
    id: "USR-1035",
    name: "Liam Johnson",
    email: "liam@example.com",
    status: "pending",
    riskScore: 52,
    balance: 0,
    lastActive: "Aug 29, 2026",
    joined: "Sep 2026",
    initials: "LJ",
  },
];

export type TransactionType = "deposit" | "withdrawal" | "transfer" | "payment";

export type TransactionStatus =
  | "completed"
  | "processing"
  | "pending"
  | "failed"
  | "flagged";

export type Transaction = {
  id: string;
  user: string;
  userId: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  date: string;
  method: string;
};

export const transactions: Transaction[] = [
  {
    id: "TXN-9912",
    user: "Olivia Martin",
    userId: "USR-1042",
    type: "deposit",
    amount: 2490.0,
    status: "completed",
    date: "Sep 08, 2026 · 09:42",
    method: "Bank transfer",
  },
  {
    id: "TXN-9911",
    user: "Jackson Lee",
    userId: "USR-1041",
    type: "withdrawal",
    amount: 500.0,
    status: "processing",
    date: "Sep 08, 2026 · 08:17",
    method: "Card ···· 8731",
  },
  {
    id: "TXN-9910",
    user: "Isabella Nguyen",
    userId: "USR-1040",
    type: "payment",
    amount: 89.99,
    status: "pending",
    date: "Sep 07, 2026 · 21:04",
    method: "Bonde Pay",
  },
  {
    id: "TXN-9909",
    user: "William Kim",
    userId: "USR-1039",
    type: "transfer",
    amount: 1200.0,
    status: "completed",
    date: "Sep 07, 2026 · 18:33",
    method: "Wallet → Wallet",
  },
  {
    id: "TXN-9908",
    user: "Sofia Davis",
    userId: "USR-1038",
    type: "withdrawal",
    amount: 3200.0,
    status: "flagged",
    date: "Sep 07, 2026 · 12:51",
    method: "Bank transfer",
  },
  {
    id: "TXN-9907",
    user: "Ethan Brown",
    userId: "USR-1037",
    type: "payment",
    amount: 64.2,
    status: "completed",
    date: "Sep 06, 2026 · 16:09",
    method: "Card ···· 4455",
  },
  {
    id: "TXN-9906",
    user: "Mia Garcia",
    userId: "USR-1036",
    type: "deposit",
    amount: 1500.0,
    status: "completed",
    date: "Sep 06, 2026 · 11:27",
    method: "Bank transfer",
  },
  {
    id: "TXN-9905",
    user: "Liam Johnson",
    userId: "USR-1035",
    type: "deposit",
    amount: 250.0,
    status: "failed",
    date: "Sep 05, 2026 · 19:55",
    method: "Card ···· 9912",
  },
  {
    id: "TXN-9904",
    user: "Jackson Lee",
    userId: "USR-1041",
    type: "transfer",
    amount: 75.5,
    status: "completed",
    date: "Sep 05, 2026 · 14:20",
    method: "Wallet → Wallet",
  },
  {
    id: "TXN-9903",
    user: "Olivia Martin",
    userId: "USR-1042",
    type: "withdrawal",
    amount: 800.0,
    status: "completed",
    date: "Sep 05, 2026 · 10:02",
    method: "Bank transfer",
  },
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