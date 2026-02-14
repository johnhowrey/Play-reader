export default function Architecture() {
  return (
    <>
      <h1>Architecture</h1>
      <p>
        Play Reader is a client-side Next.js application. All script processing,
        TTS, and storage happen in the browser — there is no backend server.
      </p>

      <h2>Tech Stack</h2>
      <table>
        <thead>
          <tr><th>Layer</th><th>Technology</th></tr>
        </thead>
        <tbody>
          <tr><td>Framework</td><td>Next.js 16 (App Router)</td></tr>
          <tr><td>Language</td><td>TypeScript</td></tr>
          <tr><td>Styling</td><td>Tailwind CSS v4</td></tr>
          <tr><td>Storage</td><td>IndexedDB (raw API)</td></tr>
          <tr><td>TTS</td><td>Web Speech Synthesis API</td></tr>
          <tr><td>PWA</td><td>Web App Manifest + viewport meta</td></tr>
        </tbody>
      </table>

      <h2>Directory Structure</h2>
      <pre><code>{`src/
├── app/                         # Next.js App Router
│   ├── layout.tsx               # Root layout, PWA meta
│   ├── page.tsx                 # Home — script list + import
│   ├── reader/[id]/page.tsx     # Reader — playback + annotations
│   └── docs/                    # Documentation pages
│       ├── layout.tsx           # Docs sidebar navigation
│       ├── page.tsx             # Overview
│       ├── getting-started/
│       ├── features/
│       ├── script-formats/
│       ├── architecture/
│       └── api/
├── components/
│   ├── ScriptImporter.tsx       # File upload, paste, folder picker
│   ├── ScriptPreview.tsx        # Formatted read-only script view
│   ├── CastList.tsx             # Character list with stats
│   ├── VoiceAssigner.tsx        # Character → voice mapping UI
│   ├── PlaybackControls.tsx     # Transport + speed + filter toggles
│   ├── AnnotationMarker.tsx     # Per-line note add/view
│   ├── NotePanel.tsx            # All-notes sidebar/sheet
│   └── KeyboardHelp.tsx         # Shortcut overlay (desktop)
├── hooks/
│   └── useSwipeGesture.ts       # Touch swipe detection
├── lib/
│   ├── types.ts                 # Core data model
│   ├── storage.ts               # IndexedDB CRUD operations
│   ├── settings.ts              # localStorage preferences + position
│   ├── export.ts                # Annotation → Markdown export
│   ├── parsers/
│   │   ├── index.ts             # Re-exports
│   │   ├── fountain.ts          # Fountain format parser
│   │   ├── plaintext.ts         # Plain text play parser
│   │   └── scrivener.ts         # .scriv bundle reader
│   └── tts/
│       ├── index.ts             # Re-exports
│       ├── provider.ts          # TTSProvider interface
│       ├── browser.ts           # Web Speech API implementation
│       └── playback.ts          # PlaybackEngine (line sequencer)
├── hooks/
│   ├── useSwipeGesture.ts       # Touch swipe detection
│   └── useBackgroundAudio.ts    # Silent audio keep-alive for mobile
└── public/
    ├── sw.js                    # Service worker (offline caching)
    ├── manifest.json            # PWA manifest
    └── icons/                   # App icons`}</code></pre>

      <h2>Data Model</h2>
      <pre><code>{`interface Script {
  id: string;              // crypto.randomUUID()
  title: string;
  source: "fountain" | "plaintext" | "scrivener";
  characters: Character[];
  lines: ScriptLine[];
  createdAt: number;       // Date.now() timestamp
  updatedAt: number;
}

interface Character {
  name: string;
  voiceId: string;         // maps to SpeechSynthesisVoice.voiceURI
  color: string;           // hex color for UI
  lineCount: number;       // dialogue lines spoken
}

interface ScriptLine {
  id: string;
  type: "dialogue" | "stage_direction" | "scene_heading"
      | "act_heading" | "action" | "transition" | "parenthetical";
  character?: string;      // for dialogue/parenthetical
  text: string;
  annotations: Annotation[];
}

interface Annotation {
  id: string;
  text: string;
  type: "note" | "revisit" | "voice_note";
  timestamp: number;
}`}</code></pre>

      <h2>Parsing Pipeline</h2>
      <ol>
        <li><strong>Input</strong> — raw text string from file, paste, or Scrivener extraction</li>
        <li><strong>Format detection</strong> — score content for Fountain indicators</li>
        <li><strong>Parser</strong> — splits text into typed <code>ScriptLine[]</code> objects</li>
        <li><strong>Character extraction</strong> — builds <code>Character[]</code> from dialogue attribution</li>
        <li><strong>Result</strong> — <code>ParseResult &#123; title, characters, lines &#125;</code></li>
      </ol>

      <h2>TTS Architecture</h2>
      <p>The TTS system has three layers:</p>
      <ol>
        <li>
          <strong>TTSProvider interface</strong> — abstract contract with
          <code>speak()</code>, <code>pause()</code>, <code>resume()</code>,
          <code>stop()</code>, and voice listing
        </li>
        <li>
          <strong>BrowserTTSProvider</strong> — implementation using
          <code>SpeechSynthesis</code> and <code>SpeechSynthesisUtterance</code>
        </li>
        <li>
          <strong>PlaybackEngine</strong> — orchestrator that walks through
          script lines, resolves character→voice mappings, and calls the
          provider sequentially
        </li>
      </ol>
      <p>
        The provider interface is designed so that future implementations (e.g.,
        OpenAI TTS, ElevenLabs) can be swapped in without changing any UI code.
      </p>

      <h2>Storage</h2>
      <p>
        Scripts are stored in IndexedDB with the database name <code>play-reader</code>,
        version 1. A single object store <code>scripts</code> holds full
        <code>Script</code> objects keyed by <code>id</code>, with an index on
        <code>updatedAt</code> for sorted listing.
      </p>
      <p>
        The storage layer is a thin async wrapper around the raw IndexedDB API
        — no external dependencies. Operations: <code>saveScript</code>,
        <code>getScript</code>, <code>getAllScripts</code>, <code>deleteScript</code>.
      </p>

      <h3>Settings (localStorage)</h3>
      <p>
        User preferences are stored in <code>localStorage</code> under the
        <code>play-reader:</code> prefix:
      </p>
      <ul>
        <li><code>play-reader:playback</code> — rate, skip toggles, narrator voice ID</li>
        <li><code>play-reader:position:&#123;scriptId&#125;</code> — last playback line index per script</li>
      </ul>

      <h2>Offline &amp; PWA</h2>
      <p>
        The service worker (<code>public/sw.js</code>) uses a split caching strategy:
      </p>
      <ul>
        <li><strong>Static assets</strong> (JS, CSS, icons, manifest) — cache-first with network update</li>
        <li><strong>HTML pages</strong> — network-first with cache fallback</li>
        <li><strong>Everything else</strong> — network with cache fallback</li>
      </ul>
      <p>
        Scripts are stored in IndexedDB, which persists independently of the service
        worker cache. This means imported scripts are available offline regardless
        of cache state.
      </p>

      <h3>Background Audio</h3>
      <p>
        On mobile, browsers may suspend Web Speech when the page is backgrounded.
        The <code>useBackgroundAudio</code> hook plays a silent <code>AudioContext</code>
        buffer while TTS is active, keeping the page in a &quot;playing audio&quot; state
        that prevents suspension.
      </p>

      <h2>Responsive Design</h2>
      <p>The app uses a mobile-first approach with these breakpoints:</p>
      <table>
        <thead>
          <tr><th>Breakpoint</th><th>Behavior</th></tr>
        </thead>
        <tbody>
          <tr><td>&lt; 640px (sm)</td><td>Mobile layout: annotation buttons always visible, bottom sheet for notes, swipe gestures active</td></tr>
          <tr><td>640px–1024px</td><td>Tablet: hybrid — touch-friendly targets with more screen real estate</td></tr>
          <tr><td>&gt; 1024px (lg)</td><td>Desktop: sidebar notes panel, hover-reveal annotations, keyboard shortcuts, <code>?</code> help overlay</td></tr>
        </tbody>
      </table>
    </>
  );
}
