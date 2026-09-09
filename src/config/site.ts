export const siteConfig = {
  name: "Bonde",
  fullName: "Bonde Admin",
  tagline: "Admin Console",
  description:
    "A modern admin dashboard boilerplate built with Next.js, Tailwind CSS, shadcn/ui and Motion.",
  url: "https://bonde.app",
  user: {
    name: "Ada Lovelace",
    email: "ada@bonde.app",
    initials: "AL",
  },
} as const;

export type SiteConfig = typeof siteConfig;