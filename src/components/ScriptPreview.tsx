"use client";

import type { ScriptLine, Character } from "@/lib/types";

interface ScriptPreviewProps {
  lines: ScriptLine[];
  characters: Character[];
  maxLines?: number;
}

export default function ScriptPreview({
  lines,
  characters,
  maxLines = 30,
}: ScriptPreviewProps) {
  const colorMap = new Map(characters.map((c) => [c.name, c.color]));
  const displayLines = lines.slice(0, maxLines);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Script Preview</h2>
      <div className="bg-surface border border-border rounded-xl p-4 space-y-3 max-h-96 overflow-y-auto">
        {displayLines.map((line) => (
          <ScriptLineView key={line.id} line={line} colorMap={colorMap} />
        ))}
        {lines.length > maxLines && (
          <p className="text-center text-muted text-sm py-2">
            ... and {lines.length - maxLines} more lines
          </p>
        )}
      </div>
    </div>
  );
}

function ScriptLineView({
  line,
  colorMap,
}: {
  line: ScriptLine;
  colorMap: Map<string, string>;
}) {
  switch (line.type) {
    case "scene_heading":
      return (
        <div className="pt-4 first:pt-0">
          <p className="text-xs font-bold uppercase tracking-wider text-muted">
            {line.text}
          </p>
        </div>
      );

    case "act_heading":
      return (
        <div className="pt-6 first:pt-0 text-center">
          <p className="text-sm font-bold uppercase tracking-widest">
            {line.text}
          </p>
        </div>
      );

    case "dialogue":
      return (
        <div className="pl-4">
          <p
            className="text-xs font-semibold uppercase tracking-wide mb-0.5"
            style={{ color: colorMap.get(line.character || "") || "inherit" }}
          >
            {line.character}
          </p>
          <p className="text-sm leading-relaxed">{line.text}</p>
        </div>
      );

    case "parenthetical":
      return (
        <div className="pl-8">
          <p className="text-sm italic text-muted">{line.text}</p>
        </div>
      );

    case "stage_direction":
      return (
        <div className="pl-2">
          <p className="text-sm italic text-muted">[{line.text}]</p>
        </div>
      );

    case "transition":
      return (
        <div className="text-right">
          <p className="text-xs font-bold uppercase tracking-wider text-muted">
            {line.text}
          </p>
        </div>
      );

    case "action":
      return (
        <p className="text-sm leading-relaxed text-foreground/80">
          {line.text}
        </p>
      );

    default:
      return <p className="text-sm">{line.text}</p>;
  }
}
