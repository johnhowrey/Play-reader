export interface Script {
  id: string;
  title: string;
  source: "fountain" | "plaintext" | "scrivener";
  characters: Character[];
  lines: ScriptLine[];
  createdAt: number;
  updatedAt: number;
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
