import { ParseResult } from "../types";
import { parsePlainText } from "./plaintext";
import { parseFountain } from "./fountain";

/**
 * Parse a Scrivener .scriv bundle.
 *
 * A .scriv "file" is actually a directory containing:
 *   - *.scrivx — XML project file with document structure
 *   - Files/Data/{UUID}/content.rtf — RTF content per document
 *   - Files/Data/{UUID}/content.txt — sometimes plain text alternative
 *
 * Since browsers can't open directories directly, we handle two import modes:
 * 1. User selects the .scriv folder via directory picker (webkitdirectory)
 * 2. User provides individual .txt/.fountain files exported from Scrivener's
 *    "Sync with External Folder" feature
 *
 * For .scriv bundles, we read the .scrivx to find the Draft folder structure,
 * then concatenate text content from each document in order.
 */

export interface ScrivenerFile {
  path: string;
  content: string;
}

export async function parseScrivenerBundle(files: ScrivenerFile[]): Promise<ParseResult> {
  // Find the .scrivx project file
  const scrivxFile = files.find((f) => f.path.endsWith(".scrivx"));

  if (!scrivxFile) {
    // No .scrivx found — try to concatenate all text files
    return parseScrivenerTextFiles(files);
  }

  // Parse the .scrivx XML to get document order
  const docOrder = parseScrivxOrder(scrivxFile.content);

  // Map UUID → file content
  const contentMap = new Map<string, string>();
  for (const f of files) {
    // Match Files/Data/{UUID}/content.txt or similar
    const uuidMatch = f.path.match(/Files\/Data\/([A-F0-9-]+)\/(content\.txt|synopsis\.txt)/i);
    if (uuidMatch && f.path.endsWith("content.txt")) {
      contentMap.set(uuidMatch[1], f.content);
    }
  }

  // Also try to find .txt files directly in the bundle
  for (const f of files) {
    if (f.path.endsWith(".txt") && !f.path.endsWith("synopsis.txt") && !f.path.includes("Files/Data")) {
      // Standalone text file, use filename as key
      const name = f.path.split("/").pop() || f.path;
      contentMap.set(name, f.content);
    }
  }

  // Build full text from ordered documents
  let fullText = "";
  for (const uuid of docOrder) {
    const content = contentMap.get(uuid);
    if (content) {
      fullText += content + "\n\n";
    }
  }

  // If we couldn't match UUIDs to order, just concat all content
  if (!fullText.trim()) {
    fullText = Array.from(contentMap.values()).join("\n\n");
  }

  if (!fullText.trim()) {
    throw new Error("Could not read any text content from the Scrivener project. Make sure your Scrivener project contains plain text files (not RTF). Try using Scrivener's 'Sync with External Folder' to export as plain text first.");
  }

  // Detect if the text is Fountain format
  if (looksLikeFountain(fullText)) {
    return parseFountain(fullText);
  }

  return parsePlainText(fullText);
}

function parseScrivenerTextFiles(files: ScrivenerFile[]): ParseResult {
  const textFiles = files
    .filter((f) => f.path.endsWith(".txt") || f.path.endsWith(".fountain"))
    .sort((a, b) => a.path.localeCompare(b.path));

  if (textFiles.length === 0) {
    throw new Error("No readable text files found. Scrivener's native RTF format is not supported. Please use 'Compile' or 'Sync with External Folder' to export as plain text or Fountain format.");
  }

  const fullText = textFiles.map((f) => f.content).join("\n\n");

  if (looksLikeFountain(fullText)) {
    return parseFountain(fullText);
  }

  return parsePlainText(fullText);
}

function parseScrivxOrder(xml: string): string[] {
  // Simple XML parsing for the BinderItem structure
  // We look for BinderItem UUIDs in order, focusing on the Draft folder
  const uuids: string[] = [];

  // Find Draft/Manuscript binder items
  const draftMatch = xml.match(/<BinderItem[^>]*Type="DraftFolder"[^>]*>([\s\S]*?)<\/BinderItem>/);
  const section = draftMatch ? draftMatch[1] : xml;

  const itemRegex = /<BinderItem[^>]*UUID="([^"]+)"[^>]*Type="Text"[^>]*/g;
  let match;
  while ((match = itemRegex.exec(section)) !== null) {
    uuids.push(match[1]);
  }

  return uuids;
}

function looksLikeFountain(text: string): boolean {
  const lines = text.split("\n").slice(0, 50);
  let fountainScore = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (/^(INT\.|EXT\.|EST\.|INT\.\/EXT\.)/.test(trimmed.toUpperCase())) fountainScore += 3;
    if (/^Title:/.test(trimmed)) fountainScore += 2;
    if (/^(Author|Credit|Source|Draft date):/.test(trimmed)) fountainScore += 1;
  }

  return fountainScore >= 3;
}
