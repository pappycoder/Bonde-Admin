import { ArrowLeft, CalendarDays, Clock, Mail, ShieldAlert, Wallet } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { transactions, users, tickets } from "@/lib/mock-data";
import { UserDetailActions } from "@/components/dashboard/user-detail-actions";
import { UserScreenView } from "@/components/dashboard/user-screen-view";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const user = users.find((u) => u.id.toLowerCase() === id.toLowerCase());
  return { title: user ? `${user.name} · User` : "User not found" };
}

export default async function UserDetailPage({ params }: PageProps) {
  const { id } = await params;
  const user = users.find((u) => u.id.toLowerCase() === id.toLowerCase());

  if (!user) notFound();

  const userTxs = transactions.filter(
    (tx) => tx.userId === user.id && (tx.status === "flagged" || tx.status === "pending"),
  );
  const userTickets = tickets.filter((t) => t.userId === user.id).slice(0, 3);
  const riskTone =
    user.riskScore >= 75 ? "bg-red-500" : user.riskScore >= 40 ? "bg-amber-500" : "bg-emerald-500";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="gap-1" asChild>
          <Link href="/users">
            <ArrowLeft className="size-4" />
            All users
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div className="flex items-center gap-4">
              <Avatar className="size-14">
                <AvatarFallback className="text-base">
                  {user.initials}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CardTitle>{user.name}</CardTitle>
                  <Badge
                    variant="outline"
                    className="border-transparent bg-primary/10 capitalize text-primary"
                  >
                    {user.status}
                  </Badge>
                </div>
                <CardDescription className="flex items-center gap-1.5">
                  <Mail className="size-3.5" />
                  {user.email} · {user.id}
                </CardDescription>
              </div>
            </div>
            <UserDetailActions userId={user.id} initialStatus={user.status} />
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Wallet className="size-3.5" /> Balance
                </p>
                <p className="text-xl font-semibold tabular-nums">
                  {currency.format(user.balance)}
                </p>
              </div>
              <div className="space-y-1.5">
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CalendarDays className="size-3.5" /> Joined
                </p>
                <p className="text-sm font-medium">{user.joined}</p>
              </div>
              <div className="space-y-1.5">
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="size-3.5" /> Last active
                </p>
                <p className="text-sm font-medium">{user.lastActive}</p>
              </div>
            </div>

            <div className="mt-5 space-y-2">
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <ShieldAlert className="size-3.5" /> Risk score
                </p>
                <span className="text-xs font-medium tabular-nums">
                  {user.riskScore} / 100
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full ${riskTone}`}
                  style={{ width: `${user.riskScore}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <UserScreenView user={user} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent transactions</CardTitle>
            <CardDescription>
              Latest flagged or pending movement for this user.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {userTxs.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-24">Transaction</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userTxs.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="font-medium tabular-nums">
                        {tx.id}
                      </TableCell>
                      <TableCell className="capitalize text-muted-foreground">
                        {tx.type}
                      </TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {currency.format(tx.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="border-transparent bg-amber-500/10 capitalize text-amber-600 dark:text-amber-400"
                        >
                          {tx.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground">
                No flagged or pending transactions for this user.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Support tickets</CardTitle>
            <CardDescription>Recent conversations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {userTickets.length > 0 ? (
              userTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="rounded-lg border bg-muted/30 p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium tabular-nums">
                      {ticket.id}
                    </span>
                    <Badge
                      variant="outline"
                      className="border-transparent bg-blue-500/10 capitalize text-blue-600 dark:text-blue-400"
                    >
                      {ticket.status}
                    </Badge>
                  </div>
                  <p className="mt-1.5 text-sm leading-snug">{ticket.subject}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No support tickets in this user&apos;s history.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}