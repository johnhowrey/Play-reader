export default function ApiDocs() {
  return (
    <>
      <h1>API &amp; Extensibility</h1>
      <p>
        Play Reader is designed with clean interfaces for extending the TTS
        system, adding new parsers, and integrating with external services.
      </p>

      <h2>TTS Provider Interface</h2>
      <p>
        All TTS implementations conform to the <code>TTSProvider</code> interface,
        making it straightforward to add new voice providers:
      </p>
      <pre><code>{`interface TTSVoice {
  id: string;
  name: string;
  lang: string;
  gender?: "male" | "female" | "neutral";
}

interface TTSProvider {
  readonly name: string;

  // List available voices
  getVoices(): Promise<TTSVoice[]>;

  // Speak text with a specific voice
  speak(text: string, voiceId: string,
        rate: number, pitch: number): Promise<void>;

  // Playback control
  pause(): void;
  resume(): void;
  stop(): void;

  // State
  readonly isSpeaking: boolean;
  readonly isPaused: boolean;

  // Callbacks
  onEnd: (() => void) | null;
  onBoundary: ((charIndex: number,
                charLength: number) => void) | null;
}`}</code></pre>

      <h3>Adding a New TTS Provider</h3>
      <p>To add a new provider (e.g., OpenAI TTS, ElevenLabs):</p>
      <ol>
        <li>Create a new file in <code>src/lib/tts/</code> (e.g., <code>openai.ts</code>)</li>
        <li>Implement the <code>TTSProvider</code> interface</li>
        <li>The <code>speak()</code> method should return a Promise that resolves when the utterance finishes</li>
        <li>Call <code>onEnd</code> when speech completes and <code>onBoundary</code> for word-level tracking</li>
        <li>Export from <code>src/lib/tts/index.ts</code></li>
        <li>Add a provider selector in the reader UI</li>
      </ol>

      <h3>Example: API-based Provider Skeleton</h3>
      <pre><code>{`export class OpenAITTSProvider implements TTSProvider {
  readonly name = "OpenAI";
  private apiKey: string;
  private audio: HTMLAudioElement | null = null;

  onEnd: (() => void) | null = null;
  onBoundary: (() => void) | null = null;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getVoices(): Promise<TTSVoice[]> {
    return [
      { id: "alloy", name: "Alloy", lang: "en", gender: "neutral" },
      { id: "echo", name: "Echo", lang: "en", gender: "male" },
      { id: "fable", name: "Fable", lang: "en", gender: "female" },
      // ... etc
    ];
  }

  async speak(text: string, voiceId: string,
              rate: number): Promise<void> {
    // Call API, get audio blob, play via HTMLAudioElement
    // Resolve promise when audio ends
  }

  // ... pause, resume, stop using this.audio
}`}</code></pre>

      <h2>Parser Interface</h2>
      <p>All parsers return the same <code>ParseResult</code> type:</p>
      <pre><code>{`interface ParseResult {
  title: string;
  characters: Character[];
  lines: ScriptLine[];
}`}</code></pre>
      <p>To add a new parser (e.g., Final Draft <code>.fdx</code>):</p>
      <ol>
        <li>Create <code>src/lib/parsers/fdx.ts</code></li>
        <li>Export a function: <code>parseFDX(xmlString: string): ParseResult</code></li>
        <li>Add the format to <code>ScriptImporter</code>&apos;s file accept list</li>
        <li>Add detection logic in the file upload handler</li>
      </ol>

      <h2>Storage API</h2>
      <pre><code>{`// Save or update a script
saveScript(script: Script): Promise<void>

// Get a script by ID
getScript(id: string): Promise<Script | undefined>

// Get all scripts (optionally filtered by userId)
getAllScripts(userId?: string): Promise<Script[]>

// Delete a script
deleteScript(id: string): Promise<void>

// Sync helpers
getUnsyncedScripts(userId: string): Promise<Script[]>
markSynced(id: string): Promise<void>
migrateLocalScriptsToUser(userId: string): Promise<void>`}</code></pre>
      <p>
        The storage layer uses IndexedDB directly (no library dependency). The
        database is <code>play-reader</code> v2 with a single <code>scripts</code> store,
        indexed on <code>updatedAt</code> and <code>userId</code>. All reads normalize
        v1 data with safe defaults for <code>userId</code>, <code>syncedAt</code>, and <code>isExpired</code>.
      </p>

      <h2>Auth &amp; Feature Gating</h2>
      <pre><code>{`// Auth context (wrap app in AuthProvider)
const { user, tier, isTrialActive, isTrialExpired, login, logout } = useAuth();

// Feature gating hook
const { canImportScript, isReadOnly, canUsePremiumVoices } = useFeatureGate();

// FeatureGate component
<FeatureGate check={(limits) => limits.cloudSync} fallback={<UpgradePrompt />}>
  <SyncButton />
</FeatureGate>`}</code></pre>

      <h2>REST API Routes (Stubs)</h2>
      <p>
        API routes are defined as Next.js App Router route handlers. Currently stubs
        — replace with real implementations when connecting a backend.
      </p>
      <h3>Auth — <code>/api/auth</code></h3>
      <ul>
        <li><code>POST</code> — Login/register (body: provider, token/email)</li>
        <li><code>GET</code> — Get current user from session</li>
        <li><code>DELETE</code> — Logout (clear session)</li>
      </ul>
      <h3>Sync — <code>/api/sync</code></h3>
      <ul>
        <li><code>POST</code> — Push local scripts to cloud</li>
        <li><code>GET ?userId=xxx</code> — Pull scripts from cloud</li>
      </ul>
      <h3>Subscription — <code>/api/subscription</code></h3>
      <ul>
        <li><code>POST</code> — Create/update subscription (Stripe/App Store)</li>
        <li><code>GET ?userId=xxx</code> — Check subscription status</li>
        <li><code>DELETE</code> — Cancel subscription</li>
      </ul>

      <h2>Export API</h2>
      <pre><code>{`// Generate Markdown from a script's annotations
exportAnnotationsAsMarkdown(script: Script): string

// Trigger a file download in the browser
downloadText(content: string, filename: string): void`}</code></pre>

      <h2>PlaybackEngine</h2>
      <p>The engine manages the line-by-line reading loop:</p>
      <pre><code>{`const engine = new PlaybackEngine(provider);
engine.setLines(script.lines);
engine.setVoiceMap(script.characters, narratorVoiceId);
engine.setOptions({ rate: 1.0, skipStageDirections: false });

// Subscribe to state changes
const unsub = engine.subscribe((state) => {
  console.log(state.status);          // "idle" | "playing" | "paused"
  console.log(state.currentLineIndex); // which line is speaking
});

engine.play(0);     // start from first line
engine.pause();
engine.resume();
engine.skipToLine(10);
engine.stop();
engine.destroy();   // cleanup
unsub();            // unsubscribe`}</code></pre>

      <h2>Future Extensibility</h2>
      <p>The architecture is designed for these planned additions:</p>
      <ul>
        <li><strong>BYOK TTS providers</strong> — bring your own API key for premium voices (OpenAI, ElevenLabs, Gradient AI)</li>
        <li><strong>Voice note recording</strong> — record audio annotations, optionally transcribe with Whisper</li>
        <li><strong>Final Draft (.fdx) import</strong> — parse the XML-based industry format</li>
        <li><strong>Collaboration</strong> — share scripts and annotations via shareable links</li>
        <li><strong>Cloud sync backend</strong> — connect API stubs to real database (Supabase, Planetscale, etc.)</li>
        <li><strong>Payment integration</strong> — Stripe for web, App Store / Google Play for mobile</li>
        <li><strong>OAuth providers</strong> — connect auth stubs to real Google/Apple OAuth flows</li>
      </ul>
    </>
  );
}
