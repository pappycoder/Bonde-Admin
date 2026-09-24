"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

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
import { useAuth } from "@/lib/auth/auth-provider";

export function LogoutDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { logout } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  function handleSignOut() {
    setSubmitting(true);
    logout();
    toast.success("Signed out", {
      description: "You have been signed out of Bonde Admin.",
    });
    router.push("/login");
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Sign out of Bonde Admin?</AlertDialogTitle>
          <AlertDialogDescription>
            You&apos;ll need to sign in again to manage the console.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
          <AlertDialogAction disabled={submitting} onClick={handleSignOut}>
            Sign out
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}