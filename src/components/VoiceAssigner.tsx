"use client";

import { useState, useEffect } from "react";
import type { Character } from "@/lib/types";
import type { TTSVoice } from "@/lib/tts";

interface VoiceAssignerProps {
  characters: Character[];
  voices: TTSVoice[];
  stageDirectionVoiceId: string;
  onAssign: (charName: string, voiceId: string) => void;
  onStageDirectionVoiceChange: (voiceId: string) => void;
}

export default function VoiceAssigner({
  characters,
  voices,
  stageDirectionVoiceId,
  onAssign,
  onStageDirectionVoiceChange,
}: VoiceAssignerProps) {
  const [expanded, setExpanded] = useState(false);
  const [testingVoice, setTestingVoice] = useState<string | null>(null);

  // Group voices by language for easier browsing
  const englishVoices = voices.filter((v) => v.lang.startsWith("en"));
  const otherVoices = voices.filter((v) => !v.lang.startsWith("en"));

  const testVoice = (voiceId: string) => {
    if (typeof window === "undefined") return;
    setTestingVoice(voiceId);
    const synth = window.speechSynthesis;
    synth.cancel();
    const utt = new SpeechSynthesisUtterance("To be, or not to be.");
    const voice = synth.getVoices().find((v) => v.voiceURI === voiceId);
    if (voice) utt.voice = voice;
    utt.onend = () => setTestingVoice(null);
    utt.onerror = () => setTestingVoice(null);
    synth.speak(utt);
  };

  // Auto-assign voices on first render if characters have no voice
  useEffect(() => {
    if (voices.length === 0) return;
    const unassigned = characters.filter((c) => !c.voiceId);
    if (unassigned.length === 0) return;

    // Try to spread across available voices
    const maleVoices = englishVoices.filter((v) => v.gender === "male");
    const femaleVoices = englishVoices.filter((v) => v.gender === "female");
    const allEnglish = englishVoices.length > 0 ? englishVoices : voices;

    let maleIdx = 0;
    let femaleIdx = 0;
    let genericIdx = 0;

    for (const char of unassigned) {
      // Alternate male/female voices, then cycle
      let voiceId: string;
      if (maleVoices.length > 0 && femaleVoices.length > 0) {
        // Alternate
        if (genericIdx % 2 === 0 && maleIdx < maleVoices.length) {
          voiceId = maleVoices[maleIdx++ % maleVoices.length].id;
        } else if (femaleIdx < femaleVoices.length) {
          voiceId = femaleVoices[femaleIdx++ % femaleVoices.length].id;
        } else {
          voiceId = allEnglish[genericIdx % allEnglish.length].id;
        }
      } else {
        voiceId = allEnglish[genericIdx % allEnglish.length].id;
      }
      genericIdx++;
      onAssign(char.name, voiceId);
    }

    // Assign stage direction voice if not set
    if (!stageDirectionVoiceId && allEnglish.length > 0) {
      onStageDirectionVoiceChange(allEnglish[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voices.length]);

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-surface-hover transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="font-medium">Voice Casting</span>
          <span className="text-xs text-muted bg-background px-2 py-0.5 rounded-full">
            {characters.length} roles
          </span>
        </div>
        <span className="text-muted text-sm">{expanded ? "▲" : "▼"}</span>
      </button>

      {expanded && (
        <div className="border-t border-border p-4 space-y-3">
          {/* Stage direction narrator */}
          <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
            <div className="w-4 h-4 rounded-full bg-muted flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-muted">Narrator (Stage Directions)</p>
            </div>
            <VoiceSelect
              voices={englishVoices.length > 0 ? englishVoices : voices}
              otherVoices={otherVoices}
              value={stageDirectionVoiceId}
              onChange={onStageDirectionVoiceChange}
              onTest={testVoice}
              testingVoice={testingVoice}
            />
          </div>

          {/* Character voices */}
          {characters.map((char) => (
            <div
              key={char.name}
              className="flex items-center gap-3 p-3 bg-background rounded-lg"
            >
              <div
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: char.color }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{char.name}</p>
                <p className="text-xs text-muted">{char.lineCount} lines</p>
              </div>
              <VoiceSelect
                voices={englishVoices.length > 0 ? englishVoices : voices}
                otherVoices={otherVoices}
                value={char.voiceId}
                onChange={(v) => onAssign(char.name, v)}
                onTest={testVoice}
                testingVoice={testingVoice}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function VoiceSelect({
  voices,
  otherVoices,
  value,
  onChange,
  onTest,
  testingVoice,
}: {
  voices: TTSVoice[];
  otherVoices: TTSVoice[];
  value: string;
  onChange: (id: string) => void;
  onTest: (id: string) => void;
  testingVoice: string | null;
}) {
  return (
    <div className="flex items-center gap-1.5 flex-shrink-0">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-surface border border-border rounded-md px-2 py-1.5 text-xs max-w-[160px] focus:outline-none focus:ring-1 focus:ring-accent"
      >
        <option value="">Select voice...</option>
        {voices.length > 0 && (
          <optgroup label="English">
            {voices.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} {v.gender === "female" ? "♀" : v.gender === "male" ? "♂" : ""}
              </option>
            ))}
          </optgroup>
        )}
        {otherVoices.length > 0 && (
          <optgroup label="Other Languages">
            {otherVoices.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} ({v.lang})
              </option>
            ))}
          </optgroup>
        )}
      </select>
      <button
        onClick={() => value && onTest(value)}
        disabled={!value || testingVoice === value}
        className="p-1.5 text-xs rounded-md hover:bg-surface-hover disabled:opacity-40 transition-colors"
        title="Test voice"
      >
        {testingVoice === value ? "..." : "▶"}
      </button>
    </div>
  );
}
