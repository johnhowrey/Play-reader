import Link from "next/link";

export default function DocsOverview() {
  return (
    <>
      <h1>Play Reader</h1>
      <p className="text-lg text-muted">
        A progressive web app for writers to hear their scripts read aloud
        with distinct character voices, synced text display, and annotation
        capabilities. Works for playwrights, screenwriters, audiobook authors,
        voice actors, podcast producers, and anyone working with dialogue.
      </p>

      <h2>What is Play Reader?</h2>
      <p>
        Play Reader takes your screenplay, stage play, or any dialogue-driven
        script, automatically detects all the characters, assigns unique voices
        to each one, and reads the entire script aloud — switching voices as
        characters speak. You see the script scroll in sync with the audio,
        and you can annotate any line with notes or &quot;revisit&quot; flags as
        you listen.
      </p>

      <h2>Key Capabilities</h2>
      <ul>
        <li><strong>Multi-format import</strong> — Fountain (.fountain), plain text (.txt), and Scrivener (.scriv) project bundles</li>
        <li><strong>Automatic character detection</strong> — Identifies every speaking character and counts their lines</li>
        <li><strong>Multi-voice TTS</strong> — Each character gets a distinct voice via browser Speech Synthesis</li>
        <li><strong>Synced playback</strong> — Script auto-scrolls and highlights the current line</li>
        <li><strong>Annotations</strong> — Add notes and &quot;revisit&quot; flags to any line while listening</li>
        <li><strong>Accounts &amp; sync</strong> — Free trial, Pro upgrade, cloud sync across devices (coming soon)</li>
        <li><strong>Offline-capable PWA</strong> — Install on your home screen, works without internet</li>
        <li><strong>Cross-platform</strong> — Mobile (iOS/Android), tablet, and desktop</li>
      </ul>

      <h2>Quick Links</h2>
      <ul>
        <li><Link href="/docs/getting-started">Getting Started</Link> — Import your first script in 30 seconds</li>
        <li><Link href="/docs/features">Features</Link> — Complete feature reference</li>
        <li><Link href="/docs/script-formats">Script Formats</Link> — Supported formats and formatting conventions</li>
        <li><Link href="/docs/architecture">Architecture</Link> — Technical deep-dive for developers</li>
        <li><Link href="/docs/api">API &amp; Extensibility</Link> — TTS provider interface and storage layer</li>
      </ul>

      <h2>Technology</h2>
      <p>
        Built with Next.js, TypeScript, and Tailwind CSS. Core processing happens
        client-side. Data is stored locally in IndexedDB with optional cloud sync
        for Pro users. TTS uses the browser&apos;s built-in Web Speech API (free,
        no API key required), with an extensible provider system for future
        premium voices.
      </p>
    </>
  );
}
