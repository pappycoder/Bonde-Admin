"use client";

import { cn } from "cn";
import { MoreHorizontal } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import {
  restoreAdminUser,
  suspendAdminUser,
  type AdminUser,
  type AdminUserStatus,
} from "@/lib/api/admin";
import { ApiError } from "@/lib/api-client";
import { formatMoney, initialsOf, shortId, timeAgo } from "@/lib/format";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const STATUS_CLASSES: Record<AdminUserStatus, string> = {
  active:
    "border-transparent bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  pending:
    "border-transparent bg-amber-500/10 text-amber-600 dark:text-amber-400",
  suspended: "border-transparent bg-red-500/10 text-red-600 dark:text-red-400",
};

/**
 * Users grid with inline moderation. Suspending deactivates the user's account
 * and wallet, so it is confirmed; restoring is reversible and runs directly.
 * `onChanged` lets the owning panel refetch after a write.
 */
export function UsersTable({
  users,
  onChanged,
}: {
  users: AdminUser[];
  onChanged?: () => void;
}) {
  const [suspending, setSuspending] = useState<AdminUser | null>(null);
  const [acting, setActing] = useState(false);

  async function handleSuspend() {
    if (!suspending) return;
    setActing(true);
    try {
      await suspendAdminUser(suspending.id);
      toast.success("User suspended", {
        description: `${suspending.fullName} can no longer transact.`,
      });
      setSuspending(null);
      onChanged?.();
    } catch (e) {
      toast.error(
        e instanceof ApiError ? e.message : "Could not suspend this user",
      );
    } finally {
      setActing(false);
    }
  }

  async function handleRestore(user: AdminUser) {
    setActing(true);
    try {
      await restoreAdminUser(user.id);
      toast.success("User restored", {
        description: `${user.fullName} can transact again.`,
      });
      onChanged?.();
    } catch (e) {
      toast.error(
        e instanceof ApiError ? e.message : "Could not restore this user",
      );
    } finally {
      setActing(false);
    }
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>User</TableHead>
            <TableHead className="hidden md:table-cell">Balance</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden lg:table-cell">Last updated</TableHead>
            <TableHead className="w-16" aria-label="Actions" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user, index) => (
            <motion.tr
              key={user.id}
              data-slot="table-row"
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{
                duration: 0.4,
                delay: index * 0.04,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <TableCell>
                <Link
                  href={`/users/${user.id}`}
                  className="flex items-center gap-3"
                >
                  <Avatar className="size-8">
                    <AvatarFallback className="text-xs">
                      {initialsOf(user.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium">{user.fullName}</span>
                    <span className="text-xs text-muted-foreground">
                      {user.email} · {shortId(user.id)}
                    </span>
                  </div>
                </Link>
              </TableCell>
              <TableCell className="hidden font-medium tabular-nums md:table-cell">
                {formatMoney(user.balance, user.currency)}
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={cn(
                    "border-transparent capitalize",
                    STATUS_CLASSES[user.status],
                  )}
                >
                  {user.status}
                </Badge>
              </TableCell>
              <TableCell className="hidden whitespace-nowrap text-muted-foreground lg:table-cell">
                {timeAgo(user.lastActiveAt)}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7"
                      aria-label="User actions"
                    >
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={`/users/${user.id}`}>View details</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {user.status === "suspended" ? (
                      <DropdownMenuItem
                        disabled={acting}
                        onSelect={() => void handleRestore(user)}
                      >
                        Restore access
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem
                        variant="destructive"
                        onSelect={() => setSuspending(user)}
                      >
                        Suspend user
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </motion.tr>
          ))}
        </TableBody>
      </Table>

      <AlertDialog
        open={suspending !== null}
        onOpenChange={(open) => {
          if (!open && !acting) setSuspending(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Suspend {suspending?.fullName}?</AlertDialogTitle>
            <AlertDialogDescription>
              Their account and wallet will be deactivated, blocking all
              deposits, withdrawals and transfers. You can restore access at any
              time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={acting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={acting}
              onClick={(event) => {
                // Keep the dialog mounted so the action button can show progress.
                event.preventDefault();
                void handleSuspend();
              }}
            >
              Suspend
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
