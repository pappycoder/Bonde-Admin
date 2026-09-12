"use client";

import { useState } from "react";
import { RotateCcw, Trash2, UserX } from "lucide-react";
import { toast } from "sonner";

import type { UserStatus } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";

export function UserDetailActions({
  userId,
  initialStatus,
}: {
  userId: string;
  initialStatus: UserStatus;
}) {
  const [status, setStatus] = useState<UserStatus>(initialStatus);
  const isSuspended = status === "suspended";

  const handleToggle = () => {
    const next = isSuspended ? "active" : "suspended";
    setStatus(next);
    toast.success(next === "suspended" ? "User suspended" : "User restored", {
      description: `${userId} is now ${next}.`,
    });
  };

  const handleDelete = () => {
    toast.error("User deleted", {
      description: `${userId} was removed from the platform.`,
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button size="sm" variant="outline" onClick={handleToggle}>
        {isSuspended ? (
          <RotateCcw className="size-4" />
        ) : (
          <UserX className="size-4" />
        )}
        {isSuspended ? "Restore user" : "Suspend user"}
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="text-destructive hover:text-destructive"
        onClick={handleDelete}
      >
        <Trash2 className="size-4" />
        Delete
      </Button>
    </div>
  );
}