"use client";

import * as React from "react";

import { api, ApiError, type ApiList, type ListQuery } from "@/lib/api-client";

export interface UseListOptions {
  auth?: boolean;
  enabled?: boolean;
}

export interface UseListResult<T> {
  data: ApiList<T> | null;
  error: ApiError | null;
  loading: boolean;
  query: ListQuery;
  setQuery: React.Dispatch<React.SetStateAction<ListQuery>>;
  setPage: (page: number) => void;
  refresh: () => Promise<void>;
}

function asApiError(error: unknown): ApiError {
  return error instanceof ApiError
    ? error
    : new ApiError(0, "Something went wrong. Please try again.");
}

export function useList<T>(
  path: string,
  initialQuery: ListQuery = {},
  options: UseListOptions = {},
): UseListResult<T> {
  const { auth = true, enabled = true } = options;

  const [data, setData] = React.useState<ApiList<T> | null>(null);
  const [error, setError] = React.useState<ApiError | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [query, setQuery] = React.useState<ListQuery>(initialQuery);

  const setPage = React.useCallback((page: number) => {
    setQuery((prev) => ({ ...prev, page }));
  }, []);

  const encodedQuery = JSON.stringify(query);

  const refresh = React.useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      setData(await api.list<T>(path, JSON.parse(encodedQuery) as ListQuery, { auth }));
    } catch (e) {
      setError(asApiError(e));
    } finally {
      setLoading(false);
    }
  }, [path, encodedQuery, auth]);

  React.useEffect(() => {
    let cancelled = false;

    void (async () => {
      await Promise.resolve();
      if (cancelled) return;

      if (!enabled) {
        setLoading(false);
        return;
      }

      setError(null);
      setLoading(true);
      try {
        const result = await api.list<T>(
          path,
          JSON.parse(encodedQuery) as ListQuery,
          { auth },
        );
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
  }, [path, encodedQuery, auth, enabled]);

  return { data, error, loading, query, setQuery, setPage, refresh };
}