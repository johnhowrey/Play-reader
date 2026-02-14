import { ParseResult, ScriptLine, Character, CHARACTER_COLORS } from "../types";

/**
 * Parse Fountain screenplay format.
 * Spec: https://fountain.io/syntax
 *
 * Key conventions:
 * - Scene headings start with INT., EXT., EST., INT./EXT., or a forced .heading
 * - Character names are ALL CAPS on their own line before dialogue
 * - Parentheticals are wrapped in ( )
 * - Transitions end with TO: or are forced with >
 * - Action is everything else
 * - Title page is key:value pairs at the top
 */
export function parseFountain(text: string): ParseResult {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const scriptLines: ScriptLine[] = [];
  const characterMap = new Map<string, number>();

  let title = "Untitled Script";
  let i = 0;
  let lineId = 0;

  // Parse title page (key: value pairs at the start)
  if (lines.length > 0 && /^[A-Za-z ]+:/.test(lines[0])) {
    while (i < lines.length && lines[i].trim() !== "") {
      const match = lines[i].match(/^(Title|title)\s*:\s*(.+)/);
      if (match) {
        title = match[2].trim();
      }
      i++;
    }
    // Skip blank line after title page
    while (i < lines.length && lines[i].trim() === "") i++;
  }

  const getId = () => `line-${lineId++}`;

  while (i < lines.length) {
    const line = lines[i].trim();

    // Skip empty lines
    if (line === "") {
      i++;
      continue;
    }

    // Scene headings: INT. EXT. EST. INT./EXT. or forced with leading .
    if (/^(INT\.|EXT\.|EST\.|INT\.\/EXT\.|I\/E\.)/.test(line.toUpperCase()) ||
        (line.startsWith(".") && line.length > 1 && !line.startsWith(".."))) {
      const headingText = line.startsWith(".") ? line.slice(1) : line;
      scriptLines.push({
        id: getId(),
        type: "scene_heading",
        text: headingText.trim(),
        annotations: [],
      });
      i++;
      continue;
    }

    // Transitions: end with TO: or forced with >
    if ((line.toUpperCase().endsWith("TO:") && line === line.toUpperCase()) ||
        (line.startsWith(">") && !line.endsWith("<"))) {
      const transText = line.startsWith(">") ? line.slice(1).trim() : line;
      scriptLines.push({
        id: getId(),
        type: "transition",
        text: transText,
        annotations: [],
      });
      i++;
      continue;
    }

    // Character + dialogue block
    // Character name: all caps, possibly with (V.O.) (O.S.) (CONT'D), followed by dialogue
    const charMatch = line.match(/^([A-Z][A-Z0-9 .'-]+?)(\s*\(.*\))?\s*$/);
    if (charMatch && line === line.toUpperCase() && i + 1 < lines.length && lines[i + 1].trim() !== "") {
      const charName = charMatch[1].trim();
      const extension = charMatch[2]?.trim() || "";
      i++;

      // Track character
      characterMap.set(charName, (characterMap.get(charName) || 0));

      // Collect dialogue and parentheticals until blank line
      while (i < lines.length && lines[i].trim() !== "") {
        const dLine = lines[i].trim();

        if (dLine.startsWith("(") && dLine.endsWith(")")) {
          scriptLines.push({
            id: getId(),
            type: "parenthetical",
            character: charName,
            text: dLine,
            annotations: [],
          });
        } else {
          characterMap.set(charName, (characterMap.get(charName) || 0) + 1);
          scriptLines.push({
            id: getId(),
            type: "dialogue",
            character: charName,
            text: dLine + (extension ? ` ${extension}` : ""),
            annotations: [],
          });
        }
        i++;
      }
      continue;
    }

    // Centered text (between > and <) — treat as action
    if (line.startsWith(">") && line.endsWith("<")) {
      scriptLines.push({
        id: getId(),
        type: "action",
        text: line.slice(1, -1).trim(),
        annotations: [],
      });
      i++;
      continue;
    }

    // Everything else is action
    scriptLines.push({
      id: getId(),
      type: "action",
      text: line,
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

  // Sort characters by line count descending
  characters.sort((a, b) => b.lineCount - a.lineCount);

  return { title, characters, lines: scriptLines };
}
