"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";

import { replyAdminSupportTicket } from "@/lib/api/admin";
import { ApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function TicketReply({
  ticketId,
  disabled = false,
  onSent,
}: {
  ticketId: string;
  disabled?: boolean;
  onSent?: () => void;
}) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    const body = message.trim();
    if (!body || sending) return;
    setSending(true);
    try {
      await replyAdminSupportTicket(ticketId, body);
      setMessage("");
      toast.success("Reply sent", {
        description: "Your response was delivered to the user.",
      });
      onSent?.();
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Could not send this reply");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-3">
      <Textarea
        placeholder={
          disabled ? "This ticket is resolved." : "Write a reply to the user…"
        }
        className="min-h-24 resize-y"
        value={message}
        disabled={disabled || sending}
        onChange={(event) => setMessage(event.target.value)}
      />
      <div className="flex justify-end">
        <Button
          size="sm"
          onClick={() => void handleSend()}
          disabled={disabled || sending || !message.trim()}
        >
          <Send className="size-4" />
          {sending ? "Sending…" : "Send reply"}
        </Button>
      </div>
    </div>
  );
}
