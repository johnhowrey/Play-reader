# Play Reader — Development Guide

## Quick Start

```bash
npm install
npm run dev     # dev server on localhost:3000
npm run build   # production build
npm run lint    # eslint
```

## Architecture

This is a **client-side Next.js 16 app** (App Router). No backend — all processing, storage, and TTS happen in the browser.

### Key Directories

- `src/app/` — Next.js pages (home, reader/[id], docs/*)
- `src/components/` — React components (all "use client")
- `src/lib/parsers/` — Script format parsers (fountain, plaintext, scrivener)
- `src/lib/tts/` — TTS provider interface + browser implementation + playback engine
- `src/lib/` — Core types, IndexedDB storage, settings, export
- `src/hooks/` — Custom React hooks (swipe gestures, background audio)
- `public/` — PWA manifest, service worker, icons

### Data Flow

1. Script imported → parsed into `ScriptLine[]` + `Character[]`
2. Saved to IndexedDB as a `Script` object
3. Reader page loads script, initializes `PlaybackEngine`
4. Engine walks lines, calls `BrowserTTSProvider.speak()` per line
5. UI subscribes to engine state for highlighting/scrolling

### Key Interfaces

- `TTSProvider` (`src/lib/tts/provider.ts`) — implement this to add new TTS backends
- `ParseResult` (`src/lib/types.ts`) — return type of all parsers
- `PlaybackEngine` (`src/lib/tts/playback.ts`) — line sequencer with subscribe pattern

## Conventions

- **TypeScript strict mode** — no `any`, no implicit types
- **Tailwind CSS v4** — utility-first, custom theme vars in globals.css
- **Mobile-first** — 44px min touch targets, no hover-only interactions
- **No external UI libraries** — vanilla Tailwind + inline SVG icons
- **IndexedDB for data, localStorage for preferences** — no cookies, no server
- **Client components throughout** — all pages use `"use client"`

## Documentation

Product and technical docs live at `src/app/docs/`. When adding features:
1. Update the relevant docs page(s)
2. Add the feature to `/docs/features/page.tsx`
3. If it adds a new API surface, update `/docs/api/page.tsx`
4. If it changes architecture, update `/docs/architecture/page.tsx`

## Testing

No test framework configured yet. To verify changes:
```bash
npm run build   # TypeScript + build verification
npm run lint    # ESLint
```
