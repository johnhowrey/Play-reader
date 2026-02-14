"use client";

import { useState, useEffect } from "react";

const SHORTCUTS = [
  { key: "Space", action: "Play / Pause" },
  { key: "Escape", action: "Stop playback" },
  { key: "←", action: "Previous line" },
  { key: "→", action: "Next line" },
  { key: "↑", action: "Speed up" },
  { key: "↓", action: "Slow down" },
  { key: "?", action: "Toggle this help" },
];

export default function KeyboardHelp() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }
      if (e.key === "?") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Don't render on touch-only devices
  if (typeof window !== "undefined" && "ontouchstart" in window && !window.matchMedia("(pointer: fine)").matches) {
    return null;
  }

  return (
    <>
      {/* Small "?" button — desktop only */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="hidden sm:flex fixed bottom-4 right-4 z-10 w-8 h-8 items-center justify-center rounded-full bg-surface border border-border text-muted text-xs hover:bg-surface-hover transition-colors"
        title="Keyboard shortcuts (?)"
      >
        ?
      </button>

      {/* Modal overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-surface border border-border rounded-2xl shadow-2xl p-6 w-80 max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Keyboard Shortcuts</h2>
              <button
                onClick={() => setOpen(false)}
                className="text-muted hover:text-foreground text-sm p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              {SHORTCUTS.map((s) => (
                <div key={s.key} className="flex items-center justify-between">
                  <span className="text-sm">{s.action}</span>
                  <kbd className="px-2 py-1 bg-background border border-border rounded text-xs font-mono">
                    {s.key}
                  </kbd>
                </div>
              ))}
            </div>

            <p className="text-xs text-muted text-center mt-4">
              Press <kbd className="px-1 py-0.5 bg-background border border-border rounded text-xs font-mono">?</kbd> to toggle
            </p>
          </div>
        </div>
      )}
    </>
  );
}
