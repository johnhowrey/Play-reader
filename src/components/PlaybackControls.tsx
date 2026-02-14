"use client";

import type { PlaybackState } from "@/lib/tts/playback";

interface PlaybackControlsProps {
  state: PlaybackState;
  rate: number;
  totalLines: number;
  skipStageDirections: boolean;
  skipActions: boolean;
  onPlay: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onRateChange: (rate: number) => void;
  onSkipBack: () => void;
  onSkipForward: () => void;
  onToggleSkipStageDirections: () => void;
  onToggleSkipActions: () => void;
}

export default function PlaybackControls({
  state,
  rate,
  totalLines,
  skipStageDirections,
  skipActions,
  onPlay,
  onPause,
  onResume,
  onStop,
  onRateChange,
  onSkipBack,
  onSkipForward,
  onToggleSkipStageDirections,
  onToggleSkipActions,
}: PlaybackControlsProps) {
  const progress =
    state.currentLineIndex >= 0 && totalLines > 0
      ? ((state.currentLineIndex + 1) / totalLines) * 100
      : 0;

  return (
    <div className="bg-surface border border-border rounded-xl p-4">
      {/* Progress bar */}
      <div className="mb-4">
        <div className="h-1.5 bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-muted">
            {state.currentLineIndex >= 0
              ? `Line ${state.currentLineIndex + 1}`
              : "Ready"}
          </span>
          <span className="text-xs text-muted">
            {totalLines} lines
          </span>
        </div>
      </div>

      {/* Main controls — min 44px touch targets throughout */}
      <div className="flex items-center justify-center gap-2 sm:gap-4">
        <button
          onClick={onSkipBack}
          disabled={state.status === "idle"}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-surface-hover active:bg-surface-hover disabled:opacity-30 transition-colors"
          aria-label="Previous line"
        >
          <SkipBackIcon />
        </button>

        {state.status === "idle" ? (
          <button
            onClick={onPlay}
            className="min-w-[56px] min-h-[56px] flex items-center justify-center rounded-full bg-accent text-white hover:bg-accent/90 active:scale-95 transition-all"
            aria-label="Play"
          >
            <PlayIcon />
          </button>
        ) : state.status === "paused" ? (
          <button
            onClick={onResume}
            className="min-w-[56px] min-h-[56px] flex items-center justify-center rounded-full bg-accent text-white hover:bg-accent/90 active:scale-95 transition-all"
            aria-label="Resume"
          >
            <PlayIcon />
          </button>
        ) : (
          <button
            onClick={onPause}
            className="min-w-[56px] min-h-[56px] flex items-center justify-center rounded-full bg-accent text-white hover:bg-accent/90 active:scale-95 transition-all"
            aria-label="Pause"
          >
            <PauseIcon />
          </button>
        )}

        <button
          onClick={onSkipForward}
          disabled={state.status === "idle"}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-surface-hover active:bg-surface-hover disabled:opacity-30 transition-colors"
          aria-label="Next line"
        >
          <SkipForwardIcon />
        </button>

        {state.status !== "idle" && (
          <button
            onClick={onStop}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-surface-hover active:bg-surface-hover transition-colors"
            aria-label="Stop"
          >
            <StopIcon />
          </button>
        )}
      </div>

      {/* Speed + filter controls */}
      <div className="flex items-center justify-center gap-3 mt-4">
        <span className="text-xs text-muted w-12 text-right">Speed</span>
        <input
          type="range"
          min="0.5"
          max="2.0"
          step="0.1"
          value={rate}
          onChange={(e) => onRateChange(parseFloat(e.target.value))}
          className="flex-1 max-w-48 accent-accent"
        />
        <span className="text-xs font-mono w-10">{rate.toFixed(1)}x</span>
      </div>

      {/* Skip toggles */}
      <div className="flex items-center justify-center gap-3 mt-3">
        <button
          onClick={onToggleSkipStageDirections}
          className={`text-xs px-3 py-1 rounded-full transition-colors ${
            skipStageDirections
              ? "bg-accent/20 text-accent"
              : "bg-border/50 text-muted"
          }`}
        >
          {skipStageDirections ? "Skipping" : "Skip"} directions
        </button>
        <button
          onClick={onToggleSkipActions}
          className={`text-xs px-3 py-1 rounded-full transition-colors ${
            skipActions
              ? "bg-accent/20 text-accent"
              : "bg-border/50 text-muted"
          }`}
        >
          {skipActions ? "Skipping" : "Skip"} actions
        </button>
      </div>
    </div>
  );
}

function PlayIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 6h12v12H6z" />
    </svg>
  );
}

function SkipBackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" />
    </svg>
  );
}

function SkipForwardIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
    </svg>
  );
}
