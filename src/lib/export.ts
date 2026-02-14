import type { Script } from "./types";

export function exportAnnotationsAsMarkdown(script: Script): string {
  const lines: string[] = [];
  lines.push(`# Notes: ${script.title}`);
  lines.push(`Exported ${new Date().toLocaleDateString()}`);
  lines.push("");

  const revisits: string[] = [];
  const notes: string[] = [];

  for (let i = 0; i < script.lines.length; i++) {
    const line = script.lines[i];
    if (line.annotations.length === 0) continue;

    for (const a of line.annotations) {
      const context = line.character
        ? `**${line.character}**: "${line.text.slice(0, 80)}${line.text.length > 80 ? "..." : ""}"`
        : `"${line.text.slice(0, 80)}${line.text.length > 80 ? "..." : ""}"`;

      const entry = `- ${a.text}\n  - *Line ${i + 1}* — ${context}`;

      if (a.type === "revisit") {
        revisits.push(entry);
      } else {
        notes.push(entry);
      }
    }
  }

  if (revisits.length > 0) {
    lines.push("## Flagged for Revisit");
    lines.push("");
    lines.push(...revisits);
    lines.push("");
  }

  if (notes.length > 0) {
    lines.push("## Notes");
    lines.push("");
    lines.push(...notes);
    lines.push("");
  }

  if (revisits.length === 0 && notes.length === 0) {
    lines.push("*No annotations yet.*");
  }

  return lines.join("\n");
}

export function downloadText(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
