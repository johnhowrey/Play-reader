"use client";

import type { ScriptLine, Annotation } from "@/lib/types";

interface NotePanelProps {
  lines: ScriptLine[];
  onGoToLine: (lineIndex: number) => void;
  onDelete: (lineId: string, annotationId: string) => void;
}

interface NoteEntry {
  lineIndex: number;
  lineId: string;
  lineText: string;
  character?: string;
  annotation: Annotation;
}

export default function NotePanel({ lines, onGoToLine, onDelete }: NotePanelProps) {
  // Collect all annotations across all lines
  const notes: NoteEntry[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const a of line.annotations) {
      notes.push({
        lineIndex: i,
        lineId: line.id,
        lineText: line.text,
        character: line.character,
        annotation: a,
      });
    }
  }

  const revisitNotes = notes.filter((n) => n.annotation.type === "revisit");
  const regularNotes = notes.filter((n) => n.annotation.type !== "revisit");

  if (notes.length === 0) {
    return (
      <div className="text-center py-8 text-muted text-sm">
        <p>No notes yet.</p>
        <p className="mt-1">Tap the + icon on any line to add a note.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between">
        <h3 className="font-medium">Notes</h3>
        <span className="text-xs text-muted">{notes.length} total</span>
      </div>

      {/* Revisit flags first */}
      {revisitNotes.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wider">
            Flagged for Revisit ({revisitNotes.length})
          </h4>
          {revisitNotes.map((n) => (
            <NoteCard
              key={n.annotation.id}
              note={n}
              onGoToLine={onGoToLine}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}

      {/* Regular notes */}
      {regularNotes.length > 0 && (
        <div className="space-y-2">
          {revisitNotes.length > 0 && (
            <h4 className="text-xs font-medium text-muted uppercase tracking-wider">
              Notes ({regularNotes.length})
            </h4>
          )}
          {regularNotes.map((n) => (
            <NoteCard
              key={n.annotation.id}
              note={n}
              onGoToLine={onGoToLine}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function NoteCard({
  note,
  onGoToLine,
  onDelete,
}: {
  note: NoteEntry;
  onGoToLine: (lineIndex: number) => void;
  onDelete: (lineId: string, annotationId: string) => void;
}) {
  const isRevisit = note.annotation.type === "revisit";

  return (
    <div
      className={`p-3 rounded-lg cursor-pointer transition-colors ${
        isRevisit
          ? "bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/15"
          : "bg-surface border border-border hover:bg-surface-hover"
      }`}
      onClick={() => onGoToLine(note.lineIndex)}
    >
      <p className="text-sm">{note.annotation.text}</p>
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-muted truncate max-w-[200px]">
          {note.character ? `${note.character}: ` : ""}
          {note.lineText.slice(0, 50)}{note.lineText.length > 50 ? "..." : ""}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(note.lineId, note.annotation.id);
          }}
          className="text-xs text-muted hover:text-red-500 ml-2"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
