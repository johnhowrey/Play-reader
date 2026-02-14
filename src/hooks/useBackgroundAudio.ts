"use client";

import { useRef, useEffect } from "react";

/**
 * On mobile browsers, Web Speech API can be suspended when the page is
 * backgrounded. Playing a silent audio element keeps the page "active"
 * and allows TTS to continue from the lock screen.
 *
 * This hook creates a silent audio context that plays when TTS is active.
 */
export function useBackgroundAudio(isPlaying: boolean) {
  const contextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    if (!isPlaying) {
      // Stop silent audio
      if (sourceRef.current) {
        try { sourceRef.current.stop(); } catch { /* already stopped */ }
        sourceRef.current = null;
      }
      return;
    }

    // Create silent audio to keep the page active
    try {
      if (!contextRef.current) {
        contextRef.current = new AudioContext();
      }
      const ctx = contextRef.current;

      // Create 1 second of silence
      const buffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      source.connect(ctx.destination);
      source.start();
      sourceRef.current = source;
    } catch {
      // AudioContext not supported — TTS still works, just may pause in background
    }

    return () => {
      if (sourceRef.current) {
        try { sourceRef.current.stop(); } catch { /* noop */ }
        sourceRef.current = null;
      }
    };
  }, [isPlaying]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (contextRef.current) {
        contextRef.current.close().catch(() => {});
        contextRef.current = null;
      }
    };
  }, []);
}
