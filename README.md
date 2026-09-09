# Bonde Admin

A professional, production-ready **admin dashboard boilerplate** built with the latest stable versions of the modern web stack.

## Tech Stack

| Layer        | Tech                                                                                              |
| ------------ | ------------------------------------------------------------------------------------------------- |
| Framework    | [Next.js 16](https://nextjs.org) (App Router, React 19, Turbopack)                                |
| Language     | [TypeScript](https://www.typescriptlang.org) (strict)                                             |
| Styling      | [Tailwind CSS v4](https://tailwindcss.com) (CSS-first config, OKLCH tokens)                       |
| Components   | [shadcn/ui](https://ui.shadcn.com) (`new-york` style, Radix primitives)                           |
| Animation    | [Motion](https://motion.dev) (formerly Framer Motion via `motion/react`)                          |
| Charts       | [Recharts](https://recharts.org) (wired into shadcn chart components)                             |
| Toasts       | [Sonner](https://sonner.emilkowal.ski)                                                            |
| Theming      | [next-themes](https://github.com/pacocoursey/next-themes) (light / dark / system)                 |

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Configure environment (optional)
cp .env.example .env.local

# 3. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app redirects to `/dashboard`.

## Scripts

```bash
npm run dev       # Start the development server (Turbopack)
npm run build     # Create a production build
npm run start     # Start the production server
npm run lint      # Lint the codebase with ESLint
```

## Project Structure

```
src/
├── app/
│   ├── (dashboard)/          # Authenticated area (route group)
│   │   ├── layout.tsx        # Sidebar + topbar shell
│   │   ├── dashboard/        # Overview (KPIs, chart, activity, orders)
│   │   ├── orders/           # Orders list page
│   │   ├── analytics/        # Charts page (bar + donut)
│   │   └── settings/         # Account / appearance / notifications
│   ├── layout.tsx            # Root layout (fonts, theme, toaster)
│   └── globals.css           # Tailwind v4 + shadcn theme tokens
├── components/
│   ├── ui/                   # shadcn/ui primitives (CLI-managed)
│   ├── layout/               # AppSidebar, Header, PageHeader
│   ├── dashboard/            # StatCard, charts, OrdersTable, ActivityFeed
│   ├── motion/               # Reusable Motion primitives
│   └── theme/                # ThemeProvider + ThemeToggle
├── config/                   # site & navigation config
├── hooks/                    # shared hooks (use-mobile, …)
└── lib/                      # utils (cn), mock data
```

## How to Use

### Add or update shadcn/ui components

All components are CLI-managed. See [shadcn docs](https://ui.shadcn.com/docs/installation/next).

```bash
npx shadcn@latest add button
npx shadcn@latest add dialog select table
```

### Animation primitives

Reusable, accessibility-aware Motion components live in `src/components/motion/`:

```tsx
import { FadeIn, Stagger, StaggerItem, SlideIn } from "@/components/motion";

<Stagger className="grid gap-4 sm:grid-cols-2">
  <StaggerItem><Card>…</Card></StaggerItem>
  <StaggerItem><Card>…</Card></StaggerItem>
</Stagger>
```

All primitives respect the user’s `prefers-reduced-motion` setting and trigger once via
`whileInView`.

### Theming

- Theme tokens are defined in `src/app/globals.css` using OKLCH CSS variables
  (Tailwind v4 `@theme inline`). Toggle light/dark/system from the header.
- Branding (name, URLs, current user) is centralized in `src/config/site.ts`.
- Navigation is data-driven from `src/config/nav.ts`.

## Deployment

Deploy anywhere Node.js runs (Vercel, Railway, Fly.io, your own server):

- Vercel: <https://vercel.com/new>
- Self-hosting: <https://nextjs.org/docs/app/building-your-application/deploying>

## License

MIT — use it as a starting point for your own projects.