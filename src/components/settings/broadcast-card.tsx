"use client";

import { useCallback, useState } from "react";
import { AlertCircle, Loader2, Megaphone, Send } from "lucide-react";
import { toast } from "sonner";

import {
  listBroadcasts,
  sendBroadcast,
  type Broadcast,
} from "@/lib/api/broadcasts";
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
import { Textarea } from "@/components/ui/textarea";
import { EmptyState, ErrorState, LoadingState } from "@/components/data/state";

const TITLE_MAX = 140;
const BODY_MAX = 1000;

function messageOf(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback;
}

/**
 * Admin-only broadcast composer. Delivery is in-app only: the message becomes a
 * notification row in every active profile's feed, with no email or push, and
 * it cannot be recalled once sent.
 */
export function BroadcastCard() {
  const {
    data,
    error: listError,
    loading: listLoading,
    refresh: loadBroadcasts,
  } = useApi<ApiList<Broadcast>>(
    useCallback(() => listBroadcasts({ pageSize: 5 }), []),
    [],
  );

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const ready = title.trim().length >= 3 && body.trim().length >= 3;

  const deliver = async () => {
    setSending(true);
    try {
      const result = await sendBroadcast({
        title: title.trim(),
        body: body.trim(),
      });
      toast.success("Broadcast delivered", {
        description: `Reached ${result.recipientCount} ${
          result.recipientCount === 1 ? "user" : "users"
        } in their notification feed.`,
      });
      setTitle("");
      setBody("");
      setConfirming(false);
      await loadBroadcasts();
    } catch (error) {
      toast.error("Could not send the broadcast", {
        description: messageOf(error, "Please try again."),
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Megaphone className="size-4" />
          Broadcast
        </CardTitle>
        <CardDescription>
          Post an announcement to every active account&apos;s in-app feed. No
          email or push, and it cannot be recalled.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="broadcast-title">Title</Label>
          <Input
            id="broadcast-title"
            placeholder="Scheduled maintenance on Sunday"
            maxLength={TITLE_MAX}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="broadcast-body">Message</Label>
          <Textarea
            id="broadcast-body"
            rows={4}
            placeholder="We will be down for 30 minutes while we upgrade."
            maxLength={BODY_MAX}
            value={body}
            onChange={(event) => setBody(event.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            {body.length}/{BODY_MAX}
          </p>
        </div>

        {confirming ? (
          <div className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm">
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-600" />
            <p>
              This lands in every active user&apos;s feed immediately. Send
              &ldquo;{title.trim()}&rdquo;?
            </p>
          </div>
        ) : null}
      </CardContent>
      <CardFooter className="justify-end gap-2">
        {confirming ? (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirming(false)}
            >
              Cancel
            </Button>
            <Button size="sm" disabled={sending} onClick={deliver}>
              {sending ? <Loader2 className="animate-spin" /> : <Send />}
              Send to everyone
            </Button>
          </>
        ) : (
          <Button
            size="sm"
            disabled={!ready}
            onClick={() => setConfirming(true)}
          >
            <Megaphone />
            Review broadcast
          </Button>
        )}
      </CardFooter>

      <CardContent className="border-t pt-4">
        <p className="mb-3 text-sm font-medium">Recently sent</p>
        {listLoading ? (
          <LoadingState label="Loading broadcasts…" className="py-6" />
        ) : listError ? (
          <ErrorState message={listError.message} onRetry={loadBroadcasts} />
        ) : (data?.items.length ?? 0) === 0 ? (
          <EmptyState
            title="No broadcasts yet"
            description="Anything you send will be listed here with its reach."
          />
        ) : (
          <ul className="space-y-2">
            {data!.items.map((broadcast) => (
              <li key={broadcast.id} className="rounded-lg border px-3 py-2">
                <p className="text-sm font-medium">{broadcast.title}</p>
                <p className="line-clamp-2 text-xs text-muted-foreground">
                  {broadcast.body}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {broadcast.recipientCount}{" "}
                  {broadcast.recipientCount === 1 ? "recipient" : "recipients"}{" "}
                  · {new Date(broadcast.createdAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
