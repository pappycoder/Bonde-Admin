"use client";

import * as React from "react";

import {
  fetchMe,
  isMfaChallenge,
  login as loginRequest,
  toAuthUser,
  verifyLoginMfa,
  type AuthUser,
  type MfaChallenge,
} from "@/lib/auth/auth-api";
import { logoutSession } from "@/lib/api/security";
import {
  clearSession,
  loadSession,
  saveSession,
  type Session,
} from "@/lib/auth/session";

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (
    email: string,
    password: string,
    remember?: boolean,
  ) => Promise<LoginOutcome>;
  completeMfa: (
    challengeId: string,
    code: string,
    remember?: boolean,
  ) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateProfileDisplay: (input: {
    name?: string;
    avatarUrl?: string | null;
  }) => void;
}

/** A parked login still needs a code before the user is signed in. */
export type LoginOutcome =
  { status: "signed_in" } | { status: "mfa_required"; challenge: MfaChallenge };

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;

    async function restore() {
      if (!loadSession()) {
        if (!cancelled) setLoading(false);
        return;
      }
      try {
        const principal = await fetchMe();
        if (!cancelled) setUser(toAuthUser(principal));
      } catch {
        clearSession();
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void restore();
    return () => {
      cancelled = true;
    };
  }, []);

  /** Persists a session and resolves the signed-in user behind it. */
  const adoptSession = React.useCallback(
    async (session: Session, remember: boolean) => {
      saveSession({ ...session, remember });
      try {
        const principal = await fetchMe();
        setUser(toAuthUser(principal));
      } catch {
        setUser({
          id: session.user.id,
          email: session.user.email,
          phone: session.user.phone ?? null,
          name: session.user.email.split("@")[0] || "Bonde Admin",
          initials: session.user.email.slice(0, 2).toUpperCase(),
          role: "USER",
          avatarUrl: null,
        });
      }
    },
    [],
  );

  const login = React.useCallback(
    async (
      email: string,
      password: string,
      remember = true,
    ): Promise<LoginOutcome> => {
      const result = await loginRequest(email, password);
      // A second factor is on: the API parked the session, nothing is signed in yet.
      if (isMfaChallenge(result)) {
        return { status: "mfa_required", challenge: result };
      }
      await adoptSession(result, remember);
      return { status: "signed_in" };
    },
    [adoptSession],
  );

  /** Exchanges a parked login's challenge for the real session. */
  const completeMfa = React.useCallback(
    async (challengeId: string, code: string, remember = true) => {
      await adoptSession(await verifyLoginMfa(challengeId, code), remember);
    },
    [adoptSession],
  );

  const logout = React.useCallback(() => {
    // Best-effort: the API revokes this session server-side so other refreshes fail.
    void logoutSession().catch(() => undefined);
    clearSession();
    setUser(null);
  }, []);

  const refreshUser = React.useCallback(async () => {
    const principal = await fetchMe();
    setUser(toAuthUser(principal));
  }, []);

  const updateProfileDisplay = React.useCallback(
    (input: { name?: string; avatarUrl?: string | null }) => {
      setUser((current) => {
        if (!current) return current;
        const name = (input.name ?? current.name).trim() || current.name;
        const parts = name.split(" ").filter(Boolean);
        const initials =
          parts.length >= 2
            ? (parts[0][0] ?? "") + (parts[parts.length - 1][0] ?? "")
            : name.slice(0, 2);
        return {
          ...current,
          name,
          initials: initials.toUpperCase(),
          avatarUrl:
            input.avatarUrl !== undefined ? input.avatarUrl : current.avatarUrl,
        };
      });
    },
    [],
  );

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      completeMfa,
      logout,
      refreshUser,
      updateProfileDisplay,
    }),
    [
      user,
      loading,
      login,
      completeMfa,
      logout,
      refreshUser,
      updateProfileDisplay,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
