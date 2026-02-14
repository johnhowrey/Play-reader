import { ParseResult, ScriptLine, Character, CHARACTER_COLORS } from "../types";

/**
 * Parse a plain text play script.
 *
 * Conventions detected:
 * - Character names: ALL CAPS followed by a colon, or ALL CAPS alone on a line
 *   followed by indented dialogue on the next line(s)
 * - Stage directions: text in [brackets] or (parentheses) on their own line
 * - Scene/Act headings: lines starting with ACT, SCENE, or all caps short lines
 * - Everything else: dialogue continuation or action
 */
export function parsePlainText(text: string): ParseResult {
  const rawLines = text.replace(/\r\n/g, "\n").split("\n");
  const scriptLines: ScriptLine[] = [];
  const characterMap = new Map<string, number>();

  let title = "Untitled Script";
  let lineId = 0;
  let i = 0;

  const getId = () => `line-${lineId++}`;

  // Try to detect title from first non-empty line if it looks like a title
  for (let j = 0; j < Math.min(5, rawLines.length); j++) {
    const l = rawLines[j].trim();
    if (l && !isStageDirection(l) && !isCharacterName(l) && !isHeading(l)) {
      title = l;
      i = j + 1;
      // Skip blank lines after title
      while (i < rawLines.length && rawLines[i].trim() === "") i++;
      break;
    }
  }

  while (i < rawLines.length) {
    const line = rawLines[i];
    const trimmed = line.trim();

    // Skip empty lines
    if (trimmed === "") {
      i++;
      continue;
    }

    // Act/Scene headings
    if (isHeading(trimmed)) {
      const type = /^ACT\b/i.test(trimmed) ? "act_heading" as const : "scene_heading" as const;
      scriptLines.push({
        id: getId(),
        type,
        text: trimmed,
        annotations: [],
      });
      i++;
      continue;
    }

    // Stage directions in brackets or parentheses (full line)
    if (isStageDirection(trimmed)) {
      scriptLines.push({
        id: getId(),
        type: "stage_direction",
        text: trimmed.replace(/^[\[\(]|[\]\)]$/g, "").trim(),
        annotations: [],
      });
      i++;
      continue;
    }

    // "CHARACTER: dialogue" format (most common in plain text plays)
    const colonMatch = trimmed.match(/^([A-Z][A-Z0-9 .'-]{1,30}):\s*(.*)$/);
    if (colonMatch) {
      const charName = colonMatch[1].trim();
      let dialogue = colonMatch[2].trim();
      i++;

      // Continuation lines (indented or non-empty until next character/blank)
      while (i < rawLines.length) {
        const next = rawLines[i];
        const nextTrimmed = next.trim();
        if (nextTrimmed === "") break;
        if (isCharacterName(nextTrimmed) || isHeading(nextTrimmed) || isStageDirection(nextTrimmed)) break;
        // Check if next line starts a new "NAME:" pattern
        if (/^[A-Z][A-Z0-9 .'-]{1,30}:\s/.test(nextTrimmed)) break;

        dialogue += " " + nextTrimmed;
        i++;
      }

      if (dialogue) {
        characterMap.set(charName, (characterMap.get(charName) || 0) + 1);
        scriptLines.push({
          id: getId(),
          type: "dialogue",
          character: charName,
          text: dialogue,
          annotations: [],
        });
      }
      continue;
    }

    // ALL CAPS name on its own line, followed by dialogue on next line(s)
    if (isCharacterName(trimmed) && i + 1 < rawLines.length) {
      const charName = trimmed.replace(/[:\s]+$/, "").trim();
      i++;

      // Collect dialogue lines
      let dialogue = "";
      while (i < rawLines.length) {
        const next = rawLines[i];
        const nextTrimmed = next.trim();
        if (nextTrimmed === "") break;
        if (isCharacterName(nextTrimmed) || isHeading(nextTrimmed)) break;

        if (isStageDirection(nextTrimmed)) {
          // Inline stage direction within dialogue
          if (dialogue) {
            characterMap.set(charName, (characterMap.get(charName) || 0) + 1);
            scriptLines.push({
              id: getId(),
              type: "dialogue",
              character: charName,
              text: dialogue,
              annotations: [],
            });
            dialogue = "";
          }
          scriptLines.push({
            id: getId(),
            type: "stage_direction",
            character: charName,
            text: nextTrimmed.replace(/^[\[\(]|[\]\)]$/g, "").trim(),
            annotations: [],
          });
          i++;
          continue;
        }

        dialogue += (dialogue ? " " : "") + nextTrimmed;
        i++;
      }

      if (dialogue) {
        characterMap.set(charName, (characterMap.get(charName) || 0) + 1);
        scriptLines.push({
          id: getId(),
          type: "dialogue",
          character: charName,
          text: dialogue,
          annotations: [],
        });
      }
      continue;
    }

    // Default: action/description
    scriptLines.push({
      id: getId(),
      type: "action",
      text: trimmed,
      annotations: [],
    });
    i++;
  }

  const characters: Character[] = Array.from(characterMap.entries()).map(
    ([name, count], idx) => ({
      name,
      voiceId: "",
      color: CHARACTER_COLORS[idx % CHARACTER_COLORS.length],
      lineCount: count,
    })
  );

  characters.sort((a, b) => b.lineCount - a.lineCount);

  return { title, characters, lines: scriptLines };
}

function isCharacterName(line: string): boolean {
  // ALL CAPS, 2-30 chars, may have trailing colon, not a heading
  const cleaned = line.replace(/[:\s]+$/, "");
  if (cleaned.length < 2 || cleaned.length > 35) return false;
  if (/^(ACT|SCENE|PROLOGUE|EPILOGUE|INTERMISSION)\b/i.test(cleaned)) return false;
  return /^[A-Z][A-Z0-9 .'-]+$/.test(cleaned);
}

function isHeading(line: string): boolean {
  return /^(ACT\s+[IVXLCDM0-9]+|SCENE\s+[IVXLCDM0-9]+|PROLOGUE|EPILOGUE|INTERMISSION)/i.test(line);
}

function isStageDirection(line: string): boolean {
  return (line.startsWith("[") && line.endsWith("]")) ||
         (line.startsWith("(") && line.endsWith(")"));
}
