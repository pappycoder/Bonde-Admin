"use client";

import { ArrowLeftRight, Eye, Landmark, Wallet } from "lucide-react";

import type { User } from "@/lib/mock-data";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function UserScreenView({ user }: { user: User }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div className="space-y-1">
          <CardTitle>Live screen view</CardTitle>
          <CardDescription>
            What {user.name.split(" ")[0]} is currently seeing in the Bonde app.
          </CardDescription>
        </div>
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="size-2 rounded-full bg-emerald-500" />
          Live · refreshed 2s ago
        </span>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-xl border bg-muted/30 shadow-sm">
          <div className="flex items-center gap-1.5 border-b bg-muted/60 px-3 py-2">
            <span className="size-2.5 rounded-full bg-red-400/80" />
            <span className="size-2.5 rounded-full bg-amber-400/80" />
            <span className="size-2.5 rounded-full bg-emerald-400/80" />
            <span className="ml-3 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Eye className="size-3" />
              app.bonde.ai — personal dashboard
            </span>
          </div>

          <div className="space-y-3 bg-background p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Landmark className="size-3.5" />
                </div>
                <div>
                  <p className="text-xs font-semibold">{user.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </div>
              <p className="text-sm font-semibold tabular-nums">
                {currency.format(user.balance)}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                {
                  label: "Available",
                  value: currency.format(user.balance * 0.8),
                  icon: Wallet,
                },
                {
                  label: "Invested",
                  value: currency.format(user.balance * 0.15),
                  icon: ArrowLeftRight,
                },
                {
                  label: "AI Score",
                  value: "842",
                  icon: Landmark,
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-lg border bg-muted/40 p-2.5"
                >
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <stat.icon className="size-3" />
                    <span className="text-[10px]">{stat.label}</span>
                  </div>
                  <p className="mt-1 text-xs font-semibold tabular-nums">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="overflow-hidden rounded-lg border">
              <table className="w-full text-left text-[10px]">
                <thead className="bg-muted/60">
                  <tr className="text-muted-foreground">
                    <th className="px-2.5 py-1.5 font-medium">Activity</th>
                    <th className="px-2.5 py-1.5 font-medium">Amount</th>
                    <th className="px-2.5 py-1.5 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t text-muted-foreground">
                    <td className="px-2.5 py-1.5 font-medium text-foreground">
                      Deposit
                    </td>
                    <td className="px-2.5 py-1.5 tabular-nums">$250.00</td>
                    <td className="px-2.5 py-1.5">
                      <span className="rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-emerald-600 dark:text-emerald-400">
                        completed
                      </span>
                    </td>
                  </tr>
                  <tr className="border-t text-muted-foreground">
                    <td className="px-2.5 py-1.5 font-medium text-foreground">
                      Bill payment
                    </td>
                    <td className="px-2.5 py-1.5 tabular-nums">$64.20</td>
                    <td className="px-2.5 py-1.5">
                      <span className="rounded-full bg-amber-500/10 px-1.5 py-0.5 text-amber-600 dark:text-amber-400">
                        pending
                      </span>
                    </td>
                  </tr>
                  <tr className="border-t text-muted-foreground">
                    <td className="px-2.5 py-1.5 font-medium text-foreground">
                      Transfer
                    </td>
                    <td className="px-2.5 py-1.5 tabular-nums">$75.50</td>
                    <td className="px-2.5 py-1.5">
                      <span className="rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-emerald-600 dark:text-emerald-400">
                        completed
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}