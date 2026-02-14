"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import ScriptImporter from "@/components/ScriptImporter";
import CastList from "@/components/CastList";
import ScriptPreview from "@/components/ScriptPreview";
import { saveScript, getAllScripts, deleteScript } from "@/lib/storage";
import type { Script, ParseResult } from "@/lib/types";

type View = "home" | "import" | "review";

export default function Home() {
  const router = useRouter();
  const [view, setView] = useState<View>("home");
  const [scripts, setScripts] = useState<Script[]>([]);
  const [pendingResult, setPendingResult] = useState<{
    result: ParseResult;
    source: Script["source"];
  } | null>(null);
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);

  const loadScripts = useCallback(async () => {
    try {
      const all = await getAllScripts();
      setScripts(all);
    } catch {
      // IndexedDB not available (SSR or private browsing)
    }
  }, []);

  useEffect(() => {
    loadScripts();
  }, [loadScripts]);

  const handleParsed = (result: ParseResult, source: Script["source"]) => {
    setPendingResult({ result, source });
    setView("review");
  };

  const handleSave = async () => {
    if (!pendingResult) return;
    const { result, source } = pendingResult;

    const script: Script = {
      id: crypto.randomUUID(),
      title: result.title,
      source,
      characters: result.characters,
      lines: result.lines,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await saveScript(script);
    setPendingResult(null);
    // Navigate directly to the reader
    router.push(`/reader/${script.id}`);
  };

  const handleDelete = async (id: string) => {
    await deleteScript(id);
    if (selectedScript?.id === id) setSelectedScript(null);
    loadScripts();
  };

  const dialogueLineCount = (s: Script | ParseResult) => {
    const lines = "lines" in s ? s.lines : [];
    return lines.filter((l) => l.type === "dialogue").length;
  };

  // Review screen after parsing
  if (view === "review" && pendingResult) {
    const { result } = pendingResult;
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
            <button
              onClick={() => { setView("import"); setPendingResult(null); }}
              className="text-sm text-muted hover:text-foreground"
            >
              &larr; Back
            </button>
            <h1 className="font-semibold truncate mx-4">{result.title}</h1>
            <button
              onClick={handleSave}
              className="py-2 px-5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors"
            >
              Save Script
            </button>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
          {/* Stats summary */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-surface border border-border rounded-xl p-4">
              <p className="text-2xl font-bold">{result.characters.length}</p>
              <p className="text-xs text-muted mt-1">Characters</p>
            </div>
            <div className="bg-surface border border-border rounded-xl p-4">
              <p className="text-2xl font-bold">{dialogueLineCount(result)}</p>
              <p className="text-xs text-muted mt-1">Dialogue Lines</p>
            </div>
            <div className="bg-surface border border-border rounded-xl p-4">
              <p className="text-2xl font-bold">{result.lines.length}</p>
              <p className="text-xs text-muted mt-1">Total Lines</p>
            </div>
          </div>

          <CastList
            characters={result.characters}
            totalLines={dialogueLineCount(result)}
          />

          <ScriptPreview
            lines={result.lines}
            characters={result.characters}
          />
        </main>
      </div>
    );
  }

  // Import screen
  if (view === "import") {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center">
            <button
              onClick={() => setView("home")}
              className="text-sm text-muted hover:text-foreground"
            >
              &larr; Back
            </button>
            <h1 className="font-semibold ml-4">Import Script</h1>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 py-8">
          <ScriptImporter onParsed={handleParsed} />
        </main>
      </div>
    );
  }

  // Home screen — project list
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold">Play Reader</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/docs")}
              className="py-2 px-3 text-sm text-muted hover:text-foreground transition-colors"
            >
              Docs
            </button>
            <button
              onClick={() => setView("import")}
              className="py-2 px-5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors"
            >
              + Import Script
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {scripts.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🎭</div>
            <h2 className="text-2xl font-semibold mb-2">No scripts yet</h2>
            <p className="text-muted mb-8 max-w-md mx-auto">
              Import a Fountain file, paste your script, or open a Scrivener
              project to hear your characters come to life.
            </p>
            <button
              onClick={() => setView("import")}
              className="py-3 px-8 bg-accent text-white rounded-xl font-medium hover:bg-accent/90 transition-colors"
            >
              Import Your First Script
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {scripts.map((script) => (
              <div
                key={script.id}
                className="flex items-center gap-4 p-4 bg-surface border border-border rounded-xl hover:bg-surface-hover transition-colors cursor-pointer"
                onClick={() => setSelectedScript(script)}
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{script.title}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-muted">
                      {script.characters.length} characters
                    </span>
                    <span className="text-xs text-muted">
                      {dialogueLineCount(script)} lines
                    </span>
                    <span className="text-xs text-muted">
                      {script.source}
                    </span>
                  </div>
                  {/* Character color dots */}
                  <div className="flex gap-1 mt-2">
                    {script.characters.slice(0, 8).map((c) => (
                      <div
                        key={c.name}
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: c.color }}
                        title={c.name}
                      />
                    ))}
                    {script.characters.length > 8 && (
                      <span className="text-xs text-muted ml-1">
                        +{script.characters.length - 8}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/reader/${script.id}`);
                    }}
                    className="py-1.5 px-3 bg-accent text-white rounded-lg text-xs font-medium hover:bg-accent/90 transition-colors"
                  >
                    Read
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(script.id);
                    }}
                    className="text-muted hover:text-red-500 text-sm p-2 transition-colors"
                    title="Delete script"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Selected script detail */}
        {selectedScript && (
          <div className="mt-8 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">{selectedScript.title}</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => router.push(`/reader/${selectedScript.id}`)}
                  className="py-2 px-5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors"
                >
                  Read Aloud
                </button>
                <button
                  onClick={() => setSelectedScript(null)}
                  className="text-sm text-muted hover:text-foreground p-2"
                >
                  ✕
                </button>
              </div>
            </div>

            <CastList
              characters={selectedScript.characters}
              totalLines={dialogueLineCount(selectedScript)}
            />

            <ScriptPreview
              lines={selectedScript.lines}
              characters={selectedScript.characters}
            />
          </div>
        )}
      </main>
    </div>
  );
}
