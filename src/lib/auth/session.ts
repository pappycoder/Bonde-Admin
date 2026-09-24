export interface SessionUser {
  id: string;
  email: string;
  phone: string | null;
}

export interface Session {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: SessionUser;
  remember?: boolean;
  issuedAt: number;
}

const SESSION_KEY = "bonde.session";
const RESET_TOKEN_KEY = "bonde.resetToken";
const RESET_EMAIL_KEY = "bonde.resetEmail";

function storageFor(remember: boolean): Storage | null {
  if (typeof window === "undefined") return null;
  return remember ? window.localStorage : window.sessionStorage;
}

export function saveSession(next: Omit<Session, "issuedAt">): void {
  const session: Session = { ...next, issuedAt: Date.now() };
  const remember = next.remember !== false;
  storageFor(remember)?.setItem(SESSION_KEY, JSON.stringify(session));
  const other: Storage | null = remember ? window.sessionStorage : window.localStorage;
  other?.removeItem(SESSION_KEY);
}

export function loadSession(): Session | null {
  if (typeof window === "undefined") return null;
  const raw =
    window.localStorage.getItem(SESSION_KEY) ??
    window.sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SESSION_KEY);
  window.sessionStorage.removeItem(SESSION_KEY);
}

export function getAccessToken(): string | null {
  return loadSession()?.accessToken ?? null;
}

export function getRefreshToken(): string | null {
  return loadSession()?.refreshToken ?? null;
}

export function isSessionExpired(session: Session): boolean {
  return Date.now() >= session.issuedAt + session.expiresIn * 1000;
}

export function saveResetToken(token: string): void {
  window.sessionStorage.setItem(RESET_TOKEN_KEY, token);
}

export function loadResetToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(RESET_TOKEN_KEY);
}

export function clearResetToken(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(RESET_TOKEN_KEY);
}

export function saveResetEmail(email: string): void {
  window.sessionStorage.setItem(RESET_EMAIL_KEY, email);
}

export function loadResetEmail(): string | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(RESET_EMAIL_KEY);
}

export function clearResetEmail(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(RESET_EMAIL_KEY);
}