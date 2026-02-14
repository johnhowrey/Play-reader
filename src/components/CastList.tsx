"use client";

import type { Character } from "@/lib/types";

interface CastListProps {
  characters: Character[];
  totalLines: number;
}

export default function CastList({ characters, totalLines }: CastListProps) {
  if (characters.length === 0) return null;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="text-xl font-semibold">Cast of Characters</h2>
        <span className="text-sm text-muted">
          {characters.length} character{characters.length !== 1 ? "s" : ""} found
        </span>
      </div>

      <div className="space-y-2">
        {characters.map((char) => {
          const pct = totalLines > 0 ? Math.round((char.lineCount / totalLines) * 100) : 0;
          return (
            <div
              key={char.name}
              className="flex items-center gap-3 p-3 bg-surface rounded-lg border border-border"
            >
              {/* Color dot */}
              <div
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: char.color }}
              />

              {/* Name + line count */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-medium truncate">{char.name}</span>
                  <span className="text-xs text-muted flex-shrink-0">
                    {char.lineCount} line{char.lineCount !== 1 ? "s" : ""} ({pct}%)
                  </span>
                </div>

                {/* Proportion bar */}
                <div className="mt-1.5 h-1.5 bg-border rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.max(pct, 2)}%`,
                      backgroundColor: char.color,
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
