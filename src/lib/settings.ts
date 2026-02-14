/**
 * Lightweight settings persistence using localStorage.
 * Used for preferences that don't need IndexedDB's structure
 * (voice assignments are saved on the Script object in IDB).
 */

const PREFIX = "play-reader:";

export interface PlaybackSettings {
  rate: number;
  skipStageDirections: boolean;
  skipActions: boolean;
  stageDirectionVoiceId: string;
}

const DEFAULT_PLAYBACK: PlaybackSettings = {
  rate: 1.0,
  skipStageDirections: false,
  skipActions: false,
  stageDirectionVoiceId: "",
};

export function getPlaybackSettings(): PlaybackSettings {
  try {
    const raw = localStorage.getItem(`${PREFIX}playback`);
    if (raw) {
      return { ...DEFAULT_PLAYBACK, ...JSON.parse(raw) };
    }
  } catch {
    // localStorage not available
  }
  return { ...DEFAULT_PLAYBACK };
}

export function savePlaybackSettings(settings: Partial<PlaybackSettings>) {
  try {
    const current = getPlaybackSettings();
    const merged = { ...current, ...settings };
    localStorage.setItem(`${PREFIX}playback`, JSON.stringify(merged));
  } catch {
    // localStorage not available
  }
}

export function getLastPosition(scriptId: string): number {
  try {
    const raw = localStorage.getItem(`${PREFIX}position:${scriptId}`);
    return raw ? parseInt(raw, 10) : 0;
  } catch {
    return 0;
  }
}

export function saveLastPosition(scriptId: string, lineIndex: number) {
  try {
    localStorage.setItem(`${PREFIX}position:${scriptId}`, String(lineIndex));
  } catch {
    // noop
  }
}
