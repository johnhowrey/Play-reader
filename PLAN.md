# Play Reader — Implementation Plan

## Overview
A Progressive Web App (PWA) for playwrights to hear their scripts read aloud with
distinct character voices, synced text display, and annotation capabilities.
Mobile-first responsive design, starting with free browser TTS.

## Tech Stack
- **Framework:** Next.js 14 (App Router) + TypeScript
- **Styling:** Tailwind CSS
- **Storage:** IndexedDB (via idb) for scripts, annotations, settings
- **TTS:** Browser Web Speech API (V1), provider abstraction for future APIs
- **PWA:** next-pwa for service worker, manifest, offline support
- **Parsing:** Custom Fountain parser + plain text convention parser

## Architecture

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout, PWA meta tags
│   ├── page.tsx            # Home — project list / import
│   ├── reader/[id]/
│   │   └── page.tsx        # Main reader/playback view
│   └── api/
│       └── tts/route.ts    # Future: proxy for TTS API keys
├── components/
│   ├── ScriptImporter.tsx  # File upload, paste, .scriv picker
│   ├── ScriptView.tsx      # Scrolling script display w/ highlighting
│   ├── PlaybackControls.tsx# Play/pause/stop, speed, voice assignment
│   ├── VoiceAssigner.tsx   # Map characters → voices
│   ├── AnnotationMarker.tsx# Inline annotation UI
│   └── NotePanel.tsx       # Side/bottom panel for notes list
├── lib/
│   ├── parsers/
│   │   ├── fountain.ts     # Fountain format parser
│   │   ├── plaintext.ts    # Plain text play script parser
│   │   └── scrivener.ts    # .scriv bundle reader
│   ├── tts/
│   │   ├── provider.ts     # TTSProvider interface
│   │   ├── browser.ts      # Web Speech API implementation
│   │   └── openai.ts       # Future: OpenAI-compatible (Gradient AI)
│   ├── storage.ts          # IndexedDB wrapper for projects/annotations
│   └── types.ts            # Shared types: Script, Character, Line, Annotation
└── public/
    ├── manifest.json       # PWA manifest
    └── icons/              # App icons
```

## Data Model (types.ts)

```typescript
interface Script {
  id: string;
  title: string;
  characters: Character[];
  lines: ScriptLine[];
  createdAt: Date;
  updatedAt: Date;
}

interface Character {
  name: string;
  voiceId: string;       // mapped to a TTS voice
  color: string;         // for visual distinction
}

interface ScriptLine {
  id: string;
  type: 'dialogue' | 'stage_direction' | 'scene_heading' | 'act_heading';
  character?: string;    // who speaks (for dialogue)
  text: string;
  annotations: Annotation[];
}

interface Annotation {
  id: string;
  text: string;
  type: 'note' | 'revisit' | 'voice_note';
  timestamp: Date;
}

interface TTSProvider {
  name: string;
  getVoices(): Promise<Voice[]>;
  speak(text: string, voiceId: string, rate: number): Promise<void>;
  pause(): void;
  resume(): void;
  stop(): void;
}
```

## Implementation Steps

### Phase 1: Project Scaffolding
- [x] Initialize Next.js project with TypeScript + Tailwind
- [x] Set up project structure (directories, base files)
- [x] Configure PWA (manifest.json, service worker, meta tags)
- [x] Set up IndexedDB storage layer

### Phase 2: Script Parsing
- [ ] Define core types (Script, Character, ScriptLine, Annotation)
- [ ] Build Fountain format parser
- [ ] Build plain text parser (ALL CAPS character names, dialogue conventions)
- [ ] Build ScriptImporter component (paste, file upload)

### Phase 3: TTS Engine
- [ ] Define TTSProvider interface
- [ ] Implement BrowserTTSProvider (Web Speech API)
- [ ] Build VoiceAssigner component (character → voice mapping)
- [ ] Implement playback queue (walk through lines, switch voices per character)

### Phase 4: Reader UI
- [ ] Build ScriptView with line-by-line highlighting during playback
- [ ] Build PlaybackControls (play/pause/stop, speed slider)
- [ ] Auto-scroll to current line during playback
- [ ] Media Session API integration (lock screen controls)
- [ ] Responsive layout — mobile-first with large touch targets

### Phase 5: Annotations
- [ ] Build AnnotationMarker (tap a line to add a note)
- [ ] Build NotePanel (view all notes for current script)
- [ ] Flag/color system for "revisit" markers
- [ ] Persist annotations to IndexedDB

### Phase 6: Polish & PWA
- [ ] Offline support (cached scripts play without network)
- [ ] Home screen installability
- [ ] Background audio playback
- [ ] Export annotations as text/markdown

## Future (V2+)
- ElevenLabs / OpenAI / Gradient AI TTS providers (BYOK model)
- Voice note recording + Whisper transcription
- .scriv bundle direct reading
- Multi-user / sharing
- DigitalOcean App Platform deployment
