export interface TTSVoice {
  id: string;
  name: string;
  lang: string;
  gender?: "male" | "female" | "neutral";
}

export interface TTSProvider {
  readonly name: string;
  getVoices(): Promise<TTSVoice[]>;
  speak(text: string, voiceId: string, rate: number, pitch: number): Promise<void>;
  pause(): void;
  resume(): void;
  stop(): void;
  readonly isSpeaking: boolean;
  readonly isPaused: boolean;
  onEnd: (() => void) | null;
  onBoundary: ((charIndex: number, charLength: number) => void) | null;
}
