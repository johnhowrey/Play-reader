// ─── User & Auth ────────────────────────────────────────────

export type SubscriptionTier = "free" | "pro";
export type AuthProvider = "local" | "google" | "apple" | "email";

export interface User {
  id: string;
  email: string;
  name?: string;
  authProvider: AuthProvider;
  tier: SubscriptionTier;
  trialStartedAt: number | null;   // null = never started
  trialExpiresAt: number | null;   // null = no active trial
  subscriptionExpiresAt: number | null; // null = no paid subscription
  createdAt: number;
}

export interface TierLimits {
  maxScripts: number;             // free = 1, pro = unlimited
  premiumVoices: boolean;         // free = no, pro = yes
  cloudSync: boolean;             // free = no, pro = yes
  exportFormats: string[];        // free = ["md"], pro = ["md", "pdf", "fdx"]
  trialDays: number;              // 30
}

export const TIER_LIMITS: Record<SubscriptionTier, TierLimits> = {
  free: {
    maxScripts: 1,
    premiumVoices: false,
    cloudSync: false,
    exportFormats: ["md"],
    trialDays: 30,
  },
  pro: {
    maxScripts: Infinity,
    premiumVoices: true,
    cloudSync: true,
    exportFormats: ["md", "pdf", "fdx"],
    trialDays: 0,
  },
};

// ─── Scripts ────────────────────────────────────────────────

export interface Script {
  id: string;
  userId: string;                // owner — "local" for unauthenticated
  title: string;
  source: "fountain" | "plaintext" | "scrivener";
  characters: Character[];
  lines: ScriptLine[];
  createdAt: number;
  updatedAt: number;
  syncedAt: number | null;       // null = never synced to cloud
  isExpired: boolean;            // true if trial expired (read-only mode)
}

export interface Character {
  name: string;
  voiceId: string;
  color: string;
  lineCount: number;
}

export type LineType =
  | "dialogue"
  | "stage_direction"
  | "scene_heading"
  | "act_heading"
  | "action"
  | "transition"
  | "parenthetical";

export interface ScriptLine {
  id: string;
  type: LineType;
  character?: string;
  text: string;
  annotations: Annotation[];
}

export interface Annotation {
  id: string;
  text: string;
  type: "note" | "revisit" | "voice_note";
  timestamp: number;
}

export interface ParseResult {
  title: string;
  characters: Character[];
  lines: ScriptLine[];
}

// Default character colors for visual distinction
export const CHARACTER_COLORS = [
  "#ef4444", // red
  "#3b82f6", // blue
  "#22c55e", // green
  "#f59e0b", // amber
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#14b8a6", // teal
  "#f97316", // orange
  "#6366f1", // indigo
  "#84cc16", // lime
  "#06b6d4", // cyan
  "#e11d48", // rose
];
