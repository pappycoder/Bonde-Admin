"use client";

import * as React from "react";

import { ApiError } from "@/lib/api-client";

export interface UseApiResult<T> {
  data: T | null;
  error: ApiError | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

function asApiError(error: unknown): ApiError {
  return error instanceof ApiError
    ? error
    : new ApiError(0, "Something went wrong. Please try again.");
}

export function useApi<T>(
  fetcher: () => Promise<T>,
  deps: React.DependencyList,
): UseApiResult<T> {
  const [data, setData] = React.useState<T | null>(null);
  const [error, setError] = React.useState<ApiError | null>(null);
  const [loading, setLoading] = React.useState(true);

  const refresh = React.useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      setData(await fetcher());
    } catch (e) {
      setError(asApiError(e));
    } finally {
      setLoading(false);
    }
  }, [fetcher]);

  React.useEffect(() => {
    let cancelled = false;

    void (async () => {
      await Promise.resolve();
      if (cancelled) return;

      setError(null);
      setLoading(true);
      try {
        const result = await fetcher();
        if (!cancelled) setData(result);
      } catch (e) {
        if (!cancelled) setError(asApiError(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, error, loading, refresh };
}