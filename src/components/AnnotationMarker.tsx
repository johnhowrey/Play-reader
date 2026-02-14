"use client";

import { useState } from "react";
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

  const handleSubmit = () => {
    if (!noteText.trim()) return;
    onAdd(lineId, noteText.trim(), noteType);
    setNoteText("");
    setOpen(false);
  };

  const hasAnnotations = annotations.length > 0;

  return (
    <div className="relative inline-flex">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition-colors ${
          hasAnnotations
            ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 hover:bg-amber-500/30"
            : "bg-transparent text-muted/40 hover:text-muted hover:bg-surface-hover"
        }`}
        title={hasAnnotations ? `${annotations.length} note(s)` : "Add note"}
      >
        {hasAnnotations ? annotations.length : "+"}
      </button>

      {open && (
        <div
          className="absolute right-0 top-8 z-20 w-72 bg-surface border border-border rounded-xl shadow-lg p-3 space-y-2"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Existing annotations */}
          {annotations.map((a) => (
            <div
              key={a.id}
              className={`p-2 rounded-lg text-sm ${
                a.type === "revisit"
                  ? "bg-amber-500/10 border border-amber-500/20"
                  : "bg-background"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="flex-1">{a.text}</p>
                <button
                  onClick={() => onDelete(lineId, a.id)}
                  className="text-muted hover:text-red-500 text-xs flex-shrink-0"
                >
                  ✕
                </button>
              </div>
              <div className="flex items-center gap-2 mt-1">
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
          <div className="space-y-2 pt-1">
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Add a note..."
              rows={2}
              className="w-full bg-background border border-border rounded-lg p-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-accent"
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit();
              }}
            />
            <div className="flex items-center justify-between">
              <div className="flex gap-1">
                {(["note", "revisit"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setNoteType(t)}
                    className={`text-xs px-2 py-1 rounded-md transition-colors ${
                      noteType === t
                        ? t === "revisit"
                          ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                          : "bg-accent/20 text-accent"
                        : "text-muted hover:bg-surface-hover"
                    }`}
                  >
                    {t === "revisit" ? "⚑ Revisit" : "Note"}
                  </button>
                ))}
              </div>
              <button
                onClick={handleSubmit}
                disabled={!noteText.trim()}
                className="text-xs px-3 py-1 bg-accent text-white rounded-md hover:bg-accent/90 disabled:opacity-40 transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
