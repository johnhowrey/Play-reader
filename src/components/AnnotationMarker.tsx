"use client";

import { useState, useEffect, useRef } from "react";
import type { Annotation } from "@/lib/types";

interface AnnotationMarkerProps {
  lineId: string;
  annotations: Annotation[];
  onAdd: (lineId: string, text: string, type: Annotation["type"]) => void;
  onDelete: (lineId: string, annotationId: string) => void;
}

export default function AnnotationMarker({
  lineId,
  annotations,
  onAdd,
  onDelete,
}: AnnotationMarkerProps) {
  const [open, setOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [noteType, setNoteType] = useState<Annotation["type"]>("note");
  const panelRef = useRef<HTMLDivElement>(null);

  const handleSubmit = () => {
    if (!noteText.trim()) return;
    onAdd(lineId, noteText.trim(), noteType);
    setNoteText("");
    setOpen(false);
  };

  // Close panel on outside click/tap
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [open]);

  const hasAnnotations = annotations.length > 0;

  return (
    <div className="relative inline-flex" ref={panelRef}>
      {/* Touch-friendly button — always visible, min 44px tap target */}
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-sm transition-colors active:scale-95 ${
          hasAnnotations
            ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 hover:bg-amber-500/30"
            : "text-muted/60 hover:text-muted hover:bg-surface-hover"
        }`}
        aria-label={hasAnnotations ? `${annotations.length} note(s) — tap to view` : "Add note"}
      >
        {hasAnnotations ? (
          <span className="font-medium">{annotations.length}</span>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-12 z-30 w-80 max-w-[calc(100vw-2rem)] bg-surface border border-border rounded-xl shadow-xl p-4 space-y-3"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Existing annotations */}
          {annotations.map((a) => (
            <div
              key={a.id}
              className={`p-3 rounded-lg text-sm ${
                a.type === "revisit"
                  ? "bg-amber-500/10 border border-amber-500/20"
                  : "bg-background"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="flex-1">{a.text}</p>
                <button
                  onClick={() => onDelete(lineId, a.id)}
                  className="min-w-[36px] min-h-[36px] flex items-center justify-center text-muted hover:text-red-500 text-sm rounded-lg hover:bg-red-500/10 transition-colors"
                  aria-label="Delete note"
                >
                  ✕
                </button>
              </div>
              <div className="flex items-center gap-2 mt-1.5">
                <span className={`text-xs px-1.5 py-0.5 rounded ${
                  a.type === "revisit"
                    ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                    : "bg-muted/10 text-muted"
                }`}>
                  {a.type}
                </span>
                <span className="text-xs text-muted">
                  {new Date(a.timestamp).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}

          {/* New annotation form */}
          <div className="space-y-3 pt-1">
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Add a note..."
              rows={3}
              className="w-full bg-background border border-border rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit();
              }}
              autoFocus
            />
            <div className="flex items-center justify-between">
              <div className="flex gap-1">
                {(["note", "revisit"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setNoteType(t)}
                    className={`text-xs px-3 py-2 rounded-lg transition-colors min-h-[36px] ${
                      noteType === t
                        ? t === "revisit"
                          ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                          : "bg-accent/20 text-accent"
                        : "text-muted hover:bg-surface-hover"
                    }`}
                  >
                    {t === "revisit" ? "Flag Revisit" : "Note"}
                  </button>
                ))}
              </div>
              <button
                onClick={handleSubmit}
                disabled={!noteText.trim()}
                className="text-sm px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-40 transition-colors min-h-[36px]"
              >
                Add
              </button>
            </div>
          </div>

          {/* Keyboard hint — desktop only */}
          <p className="hidden sm:block text-xs text-muted text-center">
            Cmd/Ctrl + Enter to save
          </p>
        </div>
      )}
    </div>
  );
}
