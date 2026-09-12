"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function TicketReply({ ticketId }: { ticketId: string }) {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (!message.trim()) return;
    toast.success("Reply sent", {
      description: `Your response on ${ticketId} was delivered to the user.`,
    });
    setMessage("");
  };

  return (
    <div className="space-y-3">
      <Textarea
        placeholder="Write a reply to the user…"
        className="min-h-24 resize-y"
        value={message}
        onChange={(event) => setMessage(event.target.value)}
      />
      <div className="flex justify-end">
        <Button size="sm" onClick={handleSend} disabled={!message.trim()}>
          <Send className="size-4" />
          Send reply
        </Button>
      </div>
    </div>
  );
}