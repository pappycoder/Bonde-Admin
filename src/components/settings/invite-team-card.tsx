"use client";

import { useCallback, useState } from "react";
import { Loader2, Mail, Send, UserPlus } from "lucide-react";
import { toast } from "sonner";

import {
  createInvite,
  listInvites,
  revokeInvite,
  type Invite,
  type InviteRole,
  type InviteStatus,
} from "@/lib/api/invites";
import { ApiError, type ApiList } from "@/lib/api-client";
import { useApi } from "@/hooks/use-api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { EmptyState, ErrorState, LoadingState } from "@/components/data/state";

const STATUS_VARIANT: Record<
  InviteStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  pending: "default",
  accepted: "secondary",
  revoked: "destructive",
  expired: "outline",
};

const STATUS_OPTIONS: { value: InviteStatus | "all"; label: string }[] = [
  { value: "all", label: "All invitations" },
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Accepted" },
  { value: "revoked", label: "Revoked" },
  { value: "expired", label: "Expired" },
];

function messageOf(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback;
}

/**
 * Admin-only invitation management. The single-use link is generated and
 * emailed by the API — this card never sees the token, so a lost email is fixed
 * by re-inviting the address (which replaces the live link).
 */
export function InviteTeamCard() {
  const [status, setStatus] = useState<InviteStatus | "all">("pending");
  const {
    data,
    error: listError,
    loading: listLoading,
    refresh: loadInvites,
  } = useApi<ApiList<Invite>>(
    useCallback(
      () =>
        listInvites({
          pageSize: 20,
          status: status === "all" ? undefined : status,
        }),
      [status],
    ),
    [status],
  );

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<InviteRole>("USER");
  const [sending, setSending] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const handleInvite = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSending(true);
    try {
      const invite = await createInvite({
        email,
        fullName: fullName || undefined,
        role,
      });
      toast.success("Invitation sent", {
        description: `${invite.email} can now set their own password. The link expires in 7 days.`,
      });
      setEmail("");
      setFullName("");
      setRole("USER");
      await loadInvites();
    } catch (error) {
      toast.error("Could not send the invitation", {
        description: messageOf(error, "Please try again."),
      });
    } finally {
      setSending(false);
    }
  };

  const handleRevoke = async (invite: Invite) => {
    setRevokingId(invite.id);
    try {
      await revokeInvite(invite.id);
      toast.success("Invitation revoked", { description: invite.email });
      await loadInvites();
    } catch (error) {
      toast.error("Could not revoke", {
        description: messageOf(error, "Please try again."),
      });
    } finally {
      setRevokingId(null);
    }
  };

  const invites = data?.items ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="size-4" />
          Invite team
        </CardTitle>
        <CardDescription>
          Send a single-use link. The invitee chooses their own password — the
          link expires after 7 days and can be used once.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="invite-team-form"
          onSubmit={handleInvite}
          className="grid gap-3 sm:grid-cols-2"
        >
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="invite-email">Email address</Label>
            <Input
              id="invite-email"
              type="email"
              required
              autoComplete="off"
              placeholder="teammate@bonde.app"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="invite-name">Full name (optional)</Label>
            <Input
              id="invite-name"
              autoComplete="off"
              placeholder="Amina Sule"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="invite-role">Role</Label>
            <Select
              value={role}
              onValueChange={(value) => setRole(value as InviteRole)}
            >
              <SelectTrigger id="invite-role" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USER">User</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="SUPER_ADMIN">Super admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </form>
      </CardContent>
      <CardFooter className="justify-end">
        <Button
          type="submit"
          form="invite-team-form"
          size="sm"
          disabled={sending || email.length === 0}
        >
          {sending ? <Loader2 className="animate-spin" /> : <Send />}
          Send invitation
        </Button>
      </CardFooter>

      <CardContent className="border-t pt-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="text-sm font-medium">Invitations</p>
          <Select
            value={status}
            onValueChange={(value) => setStatus(value as InviteStatus | "all")}
          >
            <SelectTrigger size="sm" className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {listLoading ? (
          <LoadingState label="Loading invitations…" className="py-6" />
        ) : listError ? (
          <ErrorState message={listError.message} onRetry={loadInvites} />
        ) : invites.length === 0 ? (
          <EmptyState
            title={`No ${status === "all" ? "" : status} invitations`}
            description="Invites you send will show up here until they are accepted, revoked or expire."
          />
        ) : (
          <ul className="space-y-2">
            {invites.map((invite) => (
              <li
                key={invite.id}
                className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {invite.fullName ?? invite.email}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {invite.fullName ? invite.email : invite.role} · invited by{" "}
                    {invite.inviterName ?? "an admin"}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge variant={STATUS_VARIANT[invite.status]}>
                    {invite.status === "pending" ? <Mail /> : null}
                    {invite.status}
                  </Badge>
                  {invite.status === "pending" ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={revokingId === invite.id}
                      onClick={() => handleRevoke(invite)}
                    >
                      {revokingId === invite.id ? (
                        <Loader2 className="animate-spin" />
                      ) : null}
                      Revoke
                    </Button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
