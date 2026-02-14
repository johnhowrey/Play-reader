import { TTSProvider, TTSVoice } from "./provider";

export class BrowserTTSProvider implements TTSProvider {
  readonly name = "Browser";
  private synth: SpeechSynthesis;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private _isSpeaking = false;
  private _isPaused = false;

  onEnd: (() => void) | null = null;
  onBoundary: ((charIndex: number, charLength: number) => void) | null = null;

  constructor() {
    this.synth = window.speechSynthesis;
  }

  get isSpeaking() {
    return this._isSpeaking;
  }

  get isPaused() {
    return this._isPaused;
  }

  async getVoices(): Promise<TTSVoice[]> {
    // Voices may load asynchronously in some browsers
    let voices = this.synth.getVoices();
    if (voices.length === 0) {
      voices = await new Promise<SpeechSynthesisVoice[]>((resolve) => {
        const handler = () => {
          const v = this.synth.getVoices();
          if (v.length > 0) {
            this.synth.removeEventListener("voiceschanged", handler);
            resolve(v);
          }
        };
        this.synth.addEventListener("voiceschanged", handler);
        // Fallback timeout
        setTimeout(() => resolve(this.synth.getVoices()), 1000);
      });
    }

    return voices.map((v) => ({
      id: v.voiceURI,
      name: v.name,
      lang: v.lang,
      gender: guessGender(v.name),
    }));
  }

  speak(text: string, voiceId: string, rate: number, pitch: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.stop();

      const utterance = new SpeechSynthesisUtterance(text);
      const voices = this.synth.getVoices();
      const voice = voices.find((v) => v.voiceURI === voiceId);
      if (voice) utterance.voice = voice;

      utterance.rate = rate;
      utterance.pitch = pitch;

      utterance.onend = () => {
        this._isSpeaking = false;
        this._isPaused = false;
        this.currentUtterance = null;
        this.onEnd?.();
        resolve();
      };

      utterance.onerror = (e) => {
        this._isSpeaking = false;
        this._isPaused = false;
        this.currentUtterance = null;
        // "interrupted" and "canceled" are not real errors
        if (e.error === "interrupted" || e.error === "canceled") {
          resolve();
        } else {
          reject(new Error(`TTS error: ${e.error}`));
        }
      };

      utterance.onboundary = (e) => {
        this.onBoundary?.(e.charIndex, e.charLength || 1);
      };

      this.currentUtterance = utterance;
      this._isSpeaking = true;
      this._isPaused = false;
      this.synth.speak(utterance);
    });
  }

  pause() {
    if (this._isSpeaking && !this._isPaused) {
      this.synth.pause();
      this._isPaused = true;
    }
  }

  resume() {
    if (this._isPaused) {
      this.synth.resume();
      this._isPaused = false;
    }
  }

  stop() {
    this.synth.cancel();
    this._isSpeaking = false;
    this._isPaused = false;
    this.currentUtterance = null;
  }
}

function guessGender(name: string): "male" | "female" | "neutral" {
  const lower = name.toLowerCase();
  // Common female voice name indicators
  if (
    /samantha|victoria|karen|moira|tessa|fiona|kate|susan|allison|ava|zira|hazel|jenny|aria|sarah|ellen|nicky|joana|luciana|monica|paulina|kathy|vicki/i.test(lower)
  ) {
    return "female";
  }
  // Common male voice name indicators
  if (
    /daniel|alex|tom|fred|ralph|albert|bruce|junior|aaron|david|mark|james|rishi|oliver|liam|thomas|jacques|jorge|diego|luca|ivan/i.test(lower)
  ) {
    return "male";
  }
  if (/female/i.test(lower)) return "female";
  if (/male/i.test(lower)) return "male";
  return "neutral";
}
