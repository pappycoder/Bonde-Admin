"use client";

import * as React from "react";

import {
  fetchMe,
  login as loginRequest,
  toAuthUser,
  type AuthUser,
} from "@/lib/auth/auth-api";
import {
  clearSession,
  loadSession,
  saveSession,
} from "@/lib/auth/session";

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateProfileDisplay: (input: { name?: string; avatarUrl?: string | null }) => void;
}

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

  async function login(
    email: string,
    password: string,
    remember = true,
  ): Promise<void> {
    const session = await loginRequest(email, password);
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
  }

  function logout(): void {
    clearSession();
    setUser(null);
  }

  async function refreshUser(): Promise<void> {
    const principal = await fetchMe();
    setUser(toAuthUser(principal));
  }

  function updateProfileDisplay(input: {
    name?: string;
    avatarUrl?: string | null;
  }): void {
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
        avatarUrl: input.avatarUrl !== undefined ? input.avatarUrl : current.avatarUrl,
      };
    });
  }

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      logout,
      refreshUser,
      updateProfileDisplay,
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}