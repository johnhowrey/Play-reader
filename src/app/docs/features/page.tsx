export default function Features() {
  return (
    <>
      <h1>Features</h1>

      <h2>Script Import</h2>
      <h3>File Upload</h3>
      <ul>
        <li>Drag-and-drop or file picker</li>
        <li>Supports <code>.fountain</code>, <code>.txt</code>, <code>.text</code>, <code>.spmd</code></li>
        <li>Auto-detects format (Fountain vs. plain text) based on content</li>
      </ul>

      <h3>Paste Text</h3>
      <ul>
        <li>Paste any script text directly</li>
        <li>Format auto-detected</li>
        <li>Helpful placeholder shows formatting examples</li>
      </ul>

      <h3>Scrivener Import</h3>
      <ul>
        <li>Select <code>.scriv</code> folder via directory picker</li>
        <li>Reads <code>.scrivx</code> project file for document order</li>
        <li>Extracts plain text content from each document</li>
        <li>Falls back to concatenating all text files if structure isn&apos;t recognized</li>
        <li>RTF-only projects should export via Scrivener&apos;s Compile or Sync feature first</li>
      </ul>

      <h2>Character Detection</h2>
      <ul>
        <li>Automatically identifies all speaking characters during parsing</li>
        <li>Counts dialogue lines per character</li>
        <li>Assigns unique colors for visual distinction</li>
        <li>Shows proportion bars — instantly see who dominates the script</li>
        <li>Characters sorted by line count (lead roles at top)</li>
      </ul>

      <h2>Text-to-Speech Playback</h2>
      <h3>Voice System</h3>
      <ul>
        <li>Uses the browser&apos;s built-in Web Speech Synthesis API — free, no API key</li>
        <li>Auto-assigns voices to characters (alternating male/female)</li>
        <li>Manual voice reassignment per character</li>
        <li>Voice preview — test any voice before committing</li>
        <li>Separate narrator voice for stage directions</li>
        <li>Gender detection from voice names for smarter defaults</li>
      </ul>

      <h3>Playback Controls</h3>
      <ul>
        <li>Play / Pause / Stop</li>
        <li>Skip forward / back (line by line)</li>
        <li>Speed control: 0.5x to 2.0x (0.1x increments)</li>
        <li>Jump to any line by clicking/tapping it during playback</li>
        <li>Toggle: skip stage directions</li>
        <li>Toggle: skip action lines</li>
      </ul>

      <h3>Synced Display</h3>
      <ul>
        <li>Current line highlighted with accent ring</li>
        <li>Auto-scroll keeps current line centered</li>
        <li>Past lines dim during playback for visual flow</li>
        <li>Word-level boundary events (provider-dependent)</li>
      </ul>

      <h2>Annotations</h2>
      <ul>
        <li><strong>Notes</strong> — add text comments to any line</li>
        <li><strong>Revisit flags</strong> — amber markers for &quot;come back to this&quot;</li>
        <li>Notes panel — desktop sidebar or mobile bottom sheet</li>
        <li>Flagged lines shown separately at top of notes list</li>
        <li>Click a note to jump to its line in the script</li>
        <li>Export all notes as Markdown with line context</li>
        <li>Annotations persist in IndexedDB with the script</li>
      </ul>

      <h2>Input Methods</h2>
      <h3>Desktop (Keyboard + Mouse/Trackpad)</h3>
      <ul>
        <li>Full keyboard shortcuts (press <code>?</code> to see all)</li>
        <li>Click any line to jump during playback</li>
        <li>Hover to reveal annotation buttons</li>
        <li>Cmd/Ctrl + Enter to submit notes</li>
        <li>Notes panel as persistent sidebar</li>
      </ul>

      <h3>Mobile (Touch)</h3>
      <ul>
        <li>44px minimum tap targets throughout</li>
        <li>Annotation buttons always visible (no hover required)</li>
        <li>Swipe left/right on script area to skip lines</li>
        <li>Bottom sheet for notes panel</li>
        <li>Safe area insets for notched devices</li>
        <li>Lock screen controls via Media Session API</li>
        <li>Active scale feedback on buttons</li>
      </ul>

      <h3>Tablet</h3>
      <ul>
        <li>Responsive layout adapts between mobile and desktop modes</li>
        <li>Sidebar notes panel on landscape, bottom sheet on portrait</li>
        <li>Both touch and keyboard input supported</li>
      </ul>

      <h2>Session Persistence</h2>
      <ul>
        <li><strong>Playback position saved</strong> — resume where you left off when reopening a script</li>
        <li><strong>Settings persist</strong> — speed, skip toggles, narrator voice remembered across sessions</li>
        <li><strong>Voice assignments saved</strong> — character voice mappings stored with each script</li>
        <li><strong>Tap any line to play from there</strong> — works even when playback is idle</li>
      </ul>

      <h2>Progressive Web App</h2>
      <ul>
        <li>Installable on home screen (iOS, Android, desktop)</li>
        <li>Standalone display mode — no browser chrome</li>
        <li>Web app manifest with icons and theme color</li>
        <li>Service worker with offline caching (network-first for pages, cache-first for assets)</li>
        <li>Background audio keep-alive — TTS continues when phone is locked</li>
        <li>Media Session API for lock screen playback controls</li>
      </ul>

      <h2>Accounts &amp; Subscriptions</h2>
      <h3>Free Trial</h3>
      <ul>
        <li>30-day trial starts automatically on first import</li>
        <li>Full access during trial — 1 script, browser voices, Markdown export</li>
        <li>Trial status badge visible in the header</li>
        <li>After trial expires: scripts become read-only (view + listen, no new annotations)</li>
      </ul>

      <h3>Pro Plan</h3>
      <ul>
        <li>Unlimited scripts</li>
        <li>Premium TTS voices (API-based providers coming soon)</li>
        <li>Cloud sync — access scripts from any device</li>
        <li>Export to Markdown, PDF, and Final Draft (.fdx)</li>
      </ul>

      <h3>Account Management</h3>
      <ul>
        <li>Sign in with Google, Apple, or email</li>
        <li>Account page shows tier, trial status, and upgrade option</li>
        <li>Local scripts migrate to your account on first sign-in</li>
        <li>Sign out returns to local-only mode</li>
      </ul>

      <h2>Data &amp; Privacy</h2>
      <ul>
        <li>All processing happens client-side in the browser</li>
        <li>Scripts stored locally in IndexedDB — always available offline</li>
        <li>Optional cloud sync for Pro users (scripts encrypted in transit)</li>
        <li>Preferences stored in localStorage</li>
        <li>Delete scripts any time from the home screen</li>
        <li>No tracking or analytics</li>
      </ul>
    </>
  );
}
