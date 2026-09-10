export const siteConfig = {
  name: "Bonde",
  fullName: "Bonde Admin",
  tagline: "AI Fintech Console",
  description:
    "Admin console for Bonde — monitor users, live sessions, transactions, activities and support for the Bonde AI fintech platform.",
  url: "https://bonde.app",
  logo: "/bonde-logo.png",
  icon: "/bonde-icon.png",
  user: {
    name: "Bonde Admin",
    email: "admin@bonde.app",
    initials: "BA",
  },
} as const;

export type SiteConfig = typeof siteConfig;