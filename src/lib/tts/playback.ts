import { TTSProvider } from "./provider";
import { ScriptLine, Character } from "../types";

export interface PlaybackState {
  status: "idle" | "playing" | "paused";
  currentLineIndex: number;
  currentCharIndex: number;
  currentCharLength: number;
}

export interface PlaybackOptions {
  rate: number;
  skipStageDirections: boolean;
  skipActions: boolean;
}

const DEFAULT_OPTIONS: PlaybackOptions = {
  rate: 1.0,
  skipStageDirections: false,
  skipActions: false,
};

export type PlaybackListener = (state: PlaybackState) => void;

/**
 * Manages walking through script lines, assigning the right voice per
 * character, and coordinating with the TTS provider.
 */
export class PlaybackEngine {
  private provider: TTSProvider;
  private lines: ScriptLine[] = [];
  private voiceMap = new Map<string, { voiceId: string; pitch: number }>();
  private stageDirectionVoiceId = "";
  private options: PlaybackOptions = { ...DEFAULT_OPTIONS };
  private _state: PlaybackState = {
    status: "idle",
    currentLineIndex: -1,
    currentCharIndex: 0,
    currentCharLength: 0,
  };
  private listeners = new Set<PlaybackListener>();
  private aborted = false;

  constructor(provider: TTSProvider) {
    this.provider = provider;
  }

  get state(): PlaybackState {
    return { ...this._state };
  }

  setLines(lines: ScriptLine[]) {
    this.lines = lines;
  }

  setVoiceMap(characters: Character[], stageDirectionVoiceId: string) {
    this.voiceMap.clear();
    for (const char of characters) {
      this.voiceMap.set(char.name, {
        voiceId: char.voiceId,
        pitch: 1.0,
      });
    }
    this.stageDirectionVoiceId = stageDirectionVoiceId;
  }

  setOptions(opts: Partial<PlaybackOptions>) {
    this.options = { ...this.options, ...opts };
  }

  subscribe(listener: PlaybackListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit() {
    const snapshot = this.state;
    for (const l of this.listeners) l(snapshot);
  }

  async play(startIndex = 0) {
    this.aborted = false;
    this._state.status = "playing";
    this._state.currentLineIndex = startIndex;
    this.emit();

    for (let i = startIndex; i < this.lines.length; i++) {
      if (this.aborted) break;

      const line = this.lines[i];
      this._state.currentLineIndex = i;
      this._state.currentCharIndex = 0;
      this._state.currentCharLength = 0;
      this.emit();

      // Skip based on options
      if (this.options.skipStageDirections && line.type === "stage_direction") continue;
      if (this.options.skipStageDirections && line.type === "parenthetical") continue;
      if (this.options.skipActions && line.type === "action") continue;

      // Determine voice
      let voiceId = this.stageDirectionVoiceId;
      let pitch = 1.0;

      if (line.character && this.voiceMap.has(line.character)) {
        const mapping = this.voiceMap.get(line.character)!;
        voiceId = mapping.voiceId;
        pitch = mapping.pitch;
      }

      // Build text to speak
      let textToSpeak = line.text;
      if (line.type === "scene_heading" || line.type === "act_heading") {
        textToSpeak = line.text;
      } else if (line.type === "stage_direction") {
        textToSpeak = `Stage direction: ${line.text}`;
      } else if (line.type === "transition") {
        textToSpeak = line.text;
      }

      if (!textToSpeak.trim()) continue;

      // Set up boundary tracking
      this.provider.onBoundary = (charIndex, charLength) => {
        this._state.currentCharIndex = charIndex;
        this._state.currentCharLength = charLength;
        this.emit();
      };

      try {
        await this.provider.speak(textToSpeak, voiceId, this.options.rate, pitch);
      } catch {
        // TTS error on a line — skip and continue
      }
    }

    if (!this.aborted) {
      this._state.status = "idle";
      this._state.currentLineIndex = -1;
      this.emit();
    }
  }

  pause() {
    if (this._state.status === "playing") {
      this.provider.pause();
      this._state.status = "paused";
      this.emit();
    }
  }

  resume() {
    if (this._state.status === "paused") {
      this.provider.resume();
      this._state.status = "playing";
      this.emit();
    }
  }

  stop() {
    this.aborted = true;
    this.provider.stop();
    this._state.status = "idle";
    this._state.currentLineIndex = -1;
    this.emit();
  }

  skipToLine(index: number) {
    if (index < 0 || index >= this.lines.length) return;
    const wasPlaying = this._state.status === "playing";
    this.stop();
    if (wasPlaying) {
      this.play(index);
    } else {
      this._state.currentLineIndex = index;
      this.emit();
    }
  }

  destroy() {
    this.stop();
    this.listeners.clear();
  }
}
