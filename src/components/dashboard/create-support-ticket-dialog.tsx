"use client";

import { useState } from "react";
import { Loader2, TicketPlus } from "lucide-react";
import { toast } from "sonner";

import {
  createAdminSupportTicket,
  type SupportTicketPriority,
} from "@/lib/api/admin";
import { ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const PRIORITIES: { value: SupportTicketPriority; label: string }[] = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "URGENT", label: "Urgent" },
];

/**
 * Opens a support ticket on a user's behalf — for calls taken over the phone or
 * escalations raised out of band. The ticket lands in the shared inbox as
 * OPEN with this admin as the author, so it is triaged like any other.
 */
export function CreateSupportTicketDialog({
  userId,
  userName,
}: {
  userId: string;
  userName: string;
}) {
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState<SupportTicketPriority>("MEDIUM");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setSubject("");
    setMessage("");
    setPriority("MEDIUM");
    setError(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedSubject = subject.trim();
    if (!trimmedSubject || saving) return;

    setSaving(true);
    setError(null);
    try {
      await createAdminSupportTicket({
        userId,
        subject: trimmedSubject,
        priority,
        message: message.trim() || undefined,
      });
      toast.success("Ticket opened", {
        description: `Logged against ${userName} and added to the support inbox.`,
      });
      setOpen(false);
      reset();
    } catch (e) {
      setError(
        e instanceof ApiError ? e.message : "Could not open this ticket",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <TicketPlus className="size-4" />
          Open ticket
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Open a support ticket</SheetTitle>
          <SheetDescription>
            Raise a ticket for {userName}. It enters the shared inbox as open,
            so another agent can pick it up.
          </SheetDescription>
        </SheetHeader>

        <form
          id="create-ticket-form"
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col gap-4 overflow-y-auto px-4"
        >
          <div className="space-y-2">
            <Label htmlFor="ticket-subject">Subject</Label>
            <Input
              id="ticket-subject"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              placeholder="Withdrawal blocked — account under review"
              maxLength={255}
              required
              disabled={saving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ticket-priority">Priority</Label>
            <Select
              value={priority}
              onValueChange={(value) =>
                setPriority(value as SupportTicketPriority)
              }
            >
              <SelectTrigger id="ticket-priority" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRIORITIES.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ticket-message">First message</Label>
            <Textarea
              id="ticket-message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="What happened, and what the user was told."
              maxLength={4000}
              className="min-h-32 resize-y"
              disabled={saving}
            />
            <p className="text-xs text-muted-foreground">
              Optional, but it saves the next agent a call.
            </p>
          </div>

          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}
        </form>

        {/* The native form attribute submits the form from outside its subtree. */}
        <SheetFooter>
          <Button
            type="submit"
            form="create-ticket-form"
            disabled={saving || !subject.trim()}
          >
            {saving ? <Loader2 className="animate-spin" /> : null}
            Open ticket
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
