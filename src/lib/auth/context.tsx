"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { User, SubscriptionTier, TierLimits } from "../types";
import { TIER_LIMITS } from "../types";

// ─── Auth State ──────────────────────────────────────────────

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  tier: SubscriptionTier;
  limits: TierLimits;
  isTrialActive: boolean;
  isTrialExpired: boolean;
  trialDaysRemaining: number | null;
}

interface AuthActions {
  login: (provider: "google" | "apple" | "email", email?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  startTrial: () => void;
}

type AuthContextValue = AuthState & AuthActions;

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Local User (no account) ────────────────────────────────

const LOCAL_USER_KEY = "play-reader:user";

function getLocalUser(): User | null {
  try {
    const raw = localStorage.getItem(LOCAL_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveLocalUser(user: User) {
  try {
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
  } catch {
    // noop
  }
}

function createLocalUser(): User {
  const now = Date.now();
  return {
    id: "local",
    email: "",
    authProvider: "local",
    tier: "free",
    trialStartedAt: now,
    trialExpiresAt: now + 30 * 24 * 60 * 60 * 1000, // 30 days
    subscriptionExpiresAt: null,
    createdAt: now,
  };
}

// ─── Trial Logic ────────────────────────────────────────────

function computeTrialState(user: User | null) {
  if (!user) {
    return { isTrialActive: false, isTrialExpired: false, trialDaysRemaining: null };
  }

  if (user.tier === "pro") {
    return { isTrialActive: false, isTrialExpired: false, trialDaysRemaining: null };
  }

  if (!user.trialExpiresAt) {
    return { isTrialActive: false, isTrialExpired: false, trialDaysRemaining: null };
  }

  const now = Date.now();
  const remaining = user.trialExpiresAt - now;

  if (remaining > 0) {
    return {
      isTrialActive: true,
      isTrialExpired: false,
      trialDaysRemaining: Math.ceil(remaining / (24 * 60 * 60 * 1000)),
    };
  }

  return { isTrialActive: false, isTrialExpired: true, trialDaysRemaining: 0 };
}

// ─── Provider ───────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize: check for existing user
  useEffect(() => {
    const existing = getLocalUser();
    if (existing) {
      setUser(existing);
    }
    setIsLoading(false);
  }, []);

  const startTrial = useCallback(() => {
    const localUser = createLocalUser();
    saveLocalUser(localUser);
    setUser(localUser);
  }, []);

  const login = useCallback(async (provider: "google" | "apple" | "email", _email?: string) => {
    // TODO: Replace with real auth when backend is connected
    // For now, simulate login by creating/updating a local user
    const existing = getLocalUser();
    const now = Date.now();
    const authedUser: User = {
      id: existing?.id || crypto.randomUUID(),
      email: _email || "",
      authProvider: provider,
      tier: existing?.tier || "free",
      trialStartedAt: existing?.trialStartedAt || now,
      trialExpiresAt: existing?.trialExpiresAt || now + 30 * 24 * 60 * 60 * 1000,
      subscriptionExpiresAt: existing?.subscriptionExpiresAt || null,
      createdAt: existing?.createdAt || now,
    };
    saveLocalUser(authedUser);
    setUser(authedUser);

    // TODO: Call POST /api/auth/login with provider + token
    // TODO: Trigger initial cloud sync
  }, []);

  const logout = useCallback(async () => {
    // TODO: Call POST /api/auth/logout
    localStorage.removeItem(LOCAL_USER_KEY);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    // TODO: Call GET /api/auth/me to refresh user data from server
    // For now just re-read local
    const existing = getLocalUser();
    if (existing) setUser(existing);
  }, []);

  const trialState = computeTrialState(user);
  const tier = user?.tier || "free";

  const value: AuthContextValue = {
    user,
    isLoading,
    isAuthenticated: !!user && user.authProvider !== "local",
    tier,
    limits: TIER_LIMITS[tier],
    ...trialState,
    login,
    logout,
    refreshUser,
    startTrial,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Hook ───────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
