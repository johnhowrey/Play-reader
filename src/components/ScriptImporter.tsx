"use client";

import { useState, useRef } from "react";
import { parseFountain, parsePlainText, parseScrivenerBundle } from "@/lib/parsers";
import type { ScrivenerFile } from "@/lib/parsers";
import type { ParseResult } from "@/lib/types";

interface ScriptImporterProps {
  onParsed: (result: ParseResult, source: "fountain" | "plaintext" | "scrivener") => void;
}

type ImportMode = "paste" | "file" | "scrivener";

export default function ScriptImporter({ onParsed }: ScriptImporterProps) {
  const [mode, setMode] = useState<ImportMode>("file");
  const [pasteText, setPasteText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setError(null);

    try {
      // Check if this is a folder upload (Scrivener bundle)
      const files = Array.from(fileList);
      const hasScrivx = files.some((f) => f.name.endsWith(".scrivx"));

      if (hasScrivx || files.length > 1) {
        // Scrivener bundle
        const scrivFiles: ScrivenerFile[] = await Promise.all(
          files
            .filter((f) => f.name.endsWith(".txt") || f.name.endsWith(".fountain") || f.name.endsWith(".scrivx"))
            .map(async (f) => ({
              path: f.webkitRelativePath || f.name,
              content: await f.text(),
            }))
        );
        const result = await parseScrivenerBundle(scrivFiles);
        onParsed(result, "scrivener");
        return;
      }

      // Single file
      const file = files[0];
      const text = await file.text();
      const ext = file.name.split(".").pop()?.toLowerCase();

      if (ext === "fountain" || ext === "spmd") {
        onParsed(parseFountain(text), "fountain");
      } else {
        // Try to auto-detect: if it looks like Fountain, parse as Fountain
        if (looksLikeFountain(text)) {
          onParsed(parseFountain(text), "fountain");
        } else {
          onParsed(parsePlainText(text), "plaintext");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse file");
    }
  };

  const handlePaste = () => {
    if (!pasteText.trim()) return;
    setError(null);

    try {
      if (looksLikeFountain(pasteText)) {
        onParsed(parseFountain(pasteText), "fountain");
      } else {
        onParsed(parsePlainText(pasteText), "plaintext");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse text");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Mode tabs */}
      <div className="flex gap-1 mb-6 bg-surface rounded-lg p-1">
        {([
          ["file", "Upload File"],
          ["paste", "Paste Text"],
          ["scrivener", "Scrivener Folder"],
        ] as [ImportMode, string][]).map(([m, label]) => (
          <button
            key={m}
            onClick={() => { setMode(m); setError(null); }}
            className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-colors ${
              mode === m
                ? "bg-accent text-white"
                : "text-muted hover:text-foreground hover:bg-surface-hover"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* File upload */}
      {mode === "file" && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
            dragOver
              ? "border-accent bg-accent/5"
              : "border-border hover:border-accent/50 hover:bg-surface-hover"
          }`}
        >
          <div className="text-4xl mb-4">📄</div>
          <p className="text-lg font-medium mb-2">
            Drop your script here
          </p>
          <p className="text-muted text-sm">
            Supports .fountain, .txt, and plain text files
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".fountain,.txt,.text,.spmd"
            onChange={(e) => handleFileUpload(e.target.files)}
            className="hidden"
          />
        </div>
      )}

      {/* Paste text */}
      {mode === "paste" && (
        <div>
          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder={`Paste your script here...\n\nSupported formats:\n\nFountain:\n  INT. COFFEE SHOP - DAY\n  JOHN\n  Hello there!\n\nPlain text:\n  JOHN: Hello there!\n  MARY: Hi John!`}
            className="w-full h-64 bg-surface border border-border rounded-xl p-4 text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent placeholder:text-muted/50"
          />
          <button
            onClick={handlePaste}
            disabled={!pasteText.trim()}
            className="mt-4 w-full py-3 px-6 bg-accent text-white rounded-xl font-medium hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Parse Script
          </button>
        </div>
      )}

      {/* Scrivener folder */}
      {mode === "scrivener" && (
        <div
          onClick={() => folderInputRef.current?.click()}
          className="border-2 border-dashed border-border rounded-xl p-12 text-center cursor-pointer hover:border-accent/50 hover:bg-surface-hover transition-colors"
        >
          <div className="text-4xl mb-4">📁</div>
          <p className="text-lg font-medium mb-2">
            Select your .scriv folder
          </p>
          <p className="text-muted text-sm mb-4">
            Choose the .scriv folder from your Scrivener project
          </p>
          <p className="text-muted text-xs">
            Reads plain text content from the project structure.
            RTF-only projects should use Scrivener&apos;s Compile or
            &quot;Sync with External Folder&quot; to export as .txt first.
          </p>
          <input
            ref={folderInputRef}
            type="file"
            /* @ts-expect-error webkitdirectory is a non-standard attribute */
            webkitdirectory=""
            onChange={(e) => handleFileUpload(e.target.files)}
            className="hidden"
          />
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}

function looksLikeFountain(text: string): boolean {
  const lines = text.split("\n").slice(0, 50);
  let score = 0;
  for (const line of lines) {
    const t = line.trim();
    if (/^(INT\.|EXT\.|EST\.|INT\.\/EXT\.)/.test(t.toUpperCase())) score += 3;
    if (/^Title:/.test(t)) score += 2;
    if (/^(Author|Credit|Source|Draft date):/.test(t)) score += 1;
  }
  return score >= 3;
}
