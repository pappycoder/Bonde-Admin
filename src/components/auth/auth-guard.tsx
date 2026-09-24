"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

import { useAuth } from "@/lib/auth/auth-provider";

/**
 * Client-side route guard for the authenticated area. Bounces unauthenticated
 * sessions and USER-role sessions (no admin access) back to /login once the
 * session has been restored by the AuthProvider.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { loading, user } = useAuth();
  const router = useRouter();
  const notified = useRef(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role === "USER") {
      if (!notified.current) {
        notified.current = true;
        toast.error("Not authorized", {
          description: "Your account does not have admin access.",
        });
      }
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading || !user || user.role === "USER") return null;
  return <>{children}</>;
}