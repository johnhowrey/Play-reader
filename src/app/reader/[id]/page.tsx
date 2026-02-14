"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { getScript, saveScript } from "@/lib/storage";
import { BrowserTTSProvider } from "@/lib/tts";
import type { TTSVoice } from "@/lib/tts";
import { PlaybackEngine, PlaybackState } from "@/lib/tts/playback";
import type { Script, Annotation } from "@/lib/types";
import VoiceAssigner from "@/components/VoiceAssigner";
import PlaybackControls from "@/components/PlaybackControls";
import AnnotationMarker from "@/components/AnnotationMarker";
import NotePanel from "@/components/NotePanel";

type SidePanel = "none" | "notes";

export default function ReaderPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [script, setScript] = useState<Script | null>(null);
  const [loading, setLoading] = useState(true);
  const [voices, setVoices] = useState<TTSVoice[]>([]);
  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    status: "idle",
    currentLineIndex: -1,
    currentCharIndex: 0,
    currentCharLength: 0,
  });
  const [rate, setRate] = useState(1.0);
  const [stageDirectionVoiceId, setStageDirectionVoiceId] = useState("");
  const [sidePanel, setSidePanel] = useState<SidePanel>("none");

  const providerRef = useRef<BrowserTTSProvider | null>(null);
  const engineRef = useRef<PlaybackEngine | null>(null);
  const lineRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const scriptContainerRef = useRef<HTMLDivElement>(null);

  // Load script
  useEffect(() => {
    (async () => {
      try {
        const s = await getScript(id);
        if (s) {
          setScript(s);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // Init TTS
  useEffect(() => {
    const provider = new BrowserTTSProvider();
    providerRef.current = provider;
    const engine = new PlaybackEngine(provider);
    engineRef.current = engine;

    provider.getVoices().then(setVoices);

    const unsub = engine.subscribe(setPlaybackState);

    return () => {
      unsub();
      engine.destroy();
    };
  }, []);

  // Keep engine in sync with script lines and voice assignments
  useEffect(() => {
    if (!engineRef.current || !script) return;
    engineRef.current.setLines(script.lines);
    engineRef.current.setVoiceMap(script.characters, stageDirectionVoiceId);
  }, [script, stageDirectionVoiceId]);

  useEffect(() => {
    if (!engineRef.current) return;
    engineRef.current.setOptions({ rate });
  }, [rate]);

  // Auto-scroll to current line
  useEffect(() => {
    if (playbackState.currentLineIndex < 0 || !script) return;
    const line = script.lines[playbackState.currentLineIndex];
    if (!line) return;
    const el = lineRefs.current.get(line.id);
    if (el && scriptContainerRef.current) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [playbackState.currentLineIndex, script]);

  // Media Session API
  useEffect(() => {
    if (!("mediaSession" in navigator) || !script) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: script.title,
      artist: "Play Reader",
    });

    navigator.mediaSession.setActionHandler("play", () => {
      if (playbackState.status === "paused") {
        engineRef.current?.resume();
      } else if (playbackState.status === "idle") {
        engineRef.current?.play(0);
      }
    });
    navigator.mediaSession.setActionHandler("pause", () => {
      engineRef.current?.pause();
    });
    navigator.mediaSession.setActionHandler("stop", () => {
      engineRef.current?.stop();
    });
    navigator.mediaSession.setActionHandler("previoustrack", () => {
      handleSkipBack();
    });
    navigator.mediaSession.setActionHandler("nexttrack", () => {
      handleSkipForward();
    });
  }, [script, playbackState.status]);

  const handleAssignVoice = useCallback((charName: string, voiceId: string) => {
    setScript((prev) => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        characters: prev.characters.map((c) =>
          c.name === charName ? { ...c, voiceId } : c
        ),
        updatedAt: Date.now(),
      };
      saveScript(updated);
      return updated;
    });
  }, []);

  const handleAddAnnotation = useCallback(
    (lineId: string, text: string, type: Annotation["type"]) => {
      setScript((prev) => {
        if (!prev) return prev;
        const annotation: Annotation = {
          id: crypto.randomUUID(),
          text,
          type,
          timestamp: Date.now(),
        };
        const updated = {
          ...prev,
          lines: prev.lines.map((l) =>
            l.id === lineId
              ? { ...l, annotations: [...l.annotations, annotation] }
              : l
          ),
          updatedAt: Date.now(),
        };
        saveScript(updated);
        return updated;
      });
    },
    []
  );

  const handleDeleteAnnotation = useCallback(
    (lineId: string, annotationId: string) => {
      setScript((prev) => {
        if (!prev) return prev;
        const updated = {
          ...prev,
          lines: prev.lines.map((l) =>
            l.id === lineId
              ? {
                  ...l,
                  annotations: l.annotations.filter(
                    (a) => a.id !== annotationId
                  ),
                }
              : l
          ),
          updatedAt: Date.now(),
        };
        saveScript(updated);
        return updated;
      });
    },
    []
  );

  const handlePlay = () => engineRef.current?.play(0);
  const handlePause = () => engineRef.current?.pause();
  const handleResume = () => engineRef.current?.resume();
  const handleStop = () => engineRef.current?.stop();

  const handleSkipBack = () => {
    const idx = playbackState.currentLineIndex;
    if (idx > 0) engineRef.current?.skipToLine(idx - 1);
  };

  const handleSkipForward = () => {
    const idx = playbackState.currentLineIndex;
    if (script && idx < script.lines.length - 1) {
      engineRef.current?.skipToLine(idx + 1);
    }
  };

  const handleLineClick = (index: number) => {
    if (playbackState.status !== "idle") {
      engineRef.current?.skipToLine(index);
    }
  };

  const handleGoToLine = (lineIndex: number) => {
    if (!script) return;
    const line = script.lines[lineIndex];
    if (!line) return;
    const el = lineRefs.current.get(line.id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    setSidePanel("none");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted">Loading...</p>
      </div>
    );
  }

  if (!script) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-muted">Script not found.</p>
        <button
          onClick={() => router.push("/")}
          className="text-accent hover:underline text-sm"
        >
          Go home
        </button>
      </div>
    );
  }

  const colorMap = new Map(script.characters.map((c) => [c.name, c.color]));

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                engineRef.current?.stop();
                router.push("/");
              }}
              className="text-sm text-muted hover:text-foreground"
            >
              &larr;
            </button>
            <h1 className="font-semibold text-sm truncate max-w-[200px] sm:max-w-none">
              {script.title}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidePanel(sidePanel === "notes" ? "none" : "notes")}
              className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                sidePanel === "notes"
                  ? "bg-accent text-white"
                  : "text-muted hover:bg-surface-hover"
              }`}
            >
              Notes
              {script.lines.some((l) => l.annotations.length > 0) && (
                <span className="ml-1 w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main content area */}
      <div className="flex-1 flex max-w-5xl mx-auto w-full">
        {/* Script view */}
        <div
          className={`flex-1 overflow-y-auto ${sidePanel !== "none" ? "lg:mr-80" : ""}`}
          ref={scriptContainerRef}
        >
          {/* Voice assigner */}
          <div className="px-4 py-4">
            <VoiceAssigner
              characters={script.characters}
              voices={voices}
              stageDirectionVoiceId={stageDirectionVoiceId}
              onAssign={handleAssignVoice}
              onStageDirectionVoiceChange={setStageDirectionVoiceId}
            />
          </div>

          {/* Script lines */}
          <div className="px-4 pb-48 space-y-1">
            {script.lines.map((line, index) => {
              const isActive = playbackState.currentLineIndex === index;
              const isPast =
                playbackState.currentLineIndex > index &&
                playbackState.status !== "idle";

              return (
                <div
                  key={line.id}
                  ref={(el) => {
                    if (el) lineRefs.current.set(line.id, el);
                  }}
                  onClick={() => handleLineClick(index)}
                  className={`group flex items-start gap-2 py-1.5 px-3 rounded-lg transition-all cursor-pointer ${
                    isActive
                      ? "bg-accent/10 ring-1 ring-accent/30"
                      : isPast
                      ? "opacity-50"
                      : "hover:bg-surface-hover"
                  }`}
                >
                  {/* Line content */}
                  <div className="flex-1 min-w-0">
                    <ScriptLineContent
                      line={line}
                      colorMap={colorMap}
                      isActive={isActive}
                    />
                  </div>

                  {/* Annotation button */}
                  <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <AnnotationMarker
                      lineId={line.id}
                      annotations={line.annotations}
                      onAdd={handleAddAnnotation}
                      onDelete={handleDeleteAnnotation}
                    />
                  </div>

                  {/* Show annotation marker if has annotations (always visible) */}
                  {line.annotations.length > 0 && (
                    <div className="flex-shrink-0 group-hover:hidden">
                      <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xs">
                        {line.annotations.length}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Side panel for notes */}
        {sidePanel === "notes" && (
          <div className="hidden lg:block fixed right-0 top-[49px] bottom-0 w-80 border-l border-border bg-background overflow-y-auto p-4">
            <NotePanel
              lines={script.lines}
              onGoToLine={handleGoToLine}
              onDelete={handleDeleteAnnotation}
            />
          </div>
        )}
      </div>

      {/* Mobile notes panel (bottom sheet style) */}
      {sidePanel === "notes" && (
        <div className="lg:hidden fixed inset-x-0 bottom-0 top-1/2 bg-background border-t border-border rounded-t-2xl overflow-y-auto p-4 z-30 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Notes</h3>
            <button
              onClick={() => setSidePanel("none")}
              className="text-muted hover:text-foreground text-sm"
            >
              Close
            </button>
          </div>
          <NotePanel
            lines={script.lines}
            onGoToLine={handleGoToLine}
            onDelete={handleDeleteAnnotation}
          />
        </div>
      )}

      {/* Playback controls — fixed at bottom */}
      <div className="fixed bottom-0 inset-x-0 z-20 bg-background/90 backdrop-blur-sm border-t border-border p-4">
        <div className="max-w-2xl mx-auto">
          <PlaybackControls
            state={playbackState}
            rate={rate}
            totalLines={script.lines.length}
            onPlay={handlePlay}
            onPause={handlePause}
            onResume={handleResume}
            onStop={handleStop}
            onRateChange={setRate}
            onSkipBack={handleSkipBack}
            onSkipForward={handleSkipForward}
          />
        </div>
      </div>
    </div>
  );
}

function ScriptLineContent({
  line,
  colorMap,
  isActive,
}: {
  line: Script["lines"][number];
  colorMap: Map<string, string>;
  isActive: boolean;
}) {
  switch (line.type) {
    case "scene_heading":
      return (
        <div className="pt-6 first:pt-0">
          <p className={`text-xs font-bold uppercase tracking-wider ${isActive ? "text-accent" : "text-muted"}`}>
            {line.text}
          </p>
        </div>
      );

    case "act_heading":
      return (
        <div className="pt-8 first:pt-0 text-center">
          <p className={`text-sm font-bold uppercase tracking-widest ${isActive ? "text-accent" : ""}`}>
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
          <p className={`text-sm leading-relaxed ${isActive ? "font-medium" : ""}`}>
            {line.text}
          </p>
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
        <p className={`text-sm leading-relaxed ${isActive ? "" : "text-foreground/80"}`}>
          {line.text}
        </p>
      );

    default:
      return <p className="text-sm">{line.text}</p>;
  }
}
