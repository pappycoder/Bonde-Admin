"use client";

import { useEffect } from "react";

import { ErrorState } from "@/components/data/state";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surfaces the real cause in dev; the boundary keeps the user on a page
    // instead of a blank screen when a render throws.
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col gap-4 py-16">
      <ErrorState
        message={
          error.message ||
          "This section failed to render. Try again, or reload the page."
        }
        onRetry={reset}
      />
    </div>
  );
}
