"use client";

import { useCallback, useEffect, useState } from "react";
import { VOICE_OPTIONS, defaultVoiceForLanguage } from "@/lib/voices";
import type { ScriptJson } from "@/types/script";
import styles from "./VoicePanel.module.css";

export function VoicePanel({
  videoId,
  script,
  initialAudioPath,
  initialVoiceId,
  initialProvider,
  nicheDefaultVoice,
  initialStatus,
  onAudioChange,
}: {
  videoId: string;
  script: ScriptJson;
  initialAudioPath: string | null;
  initialVoiceId: string | null;
  initialProvider: string | null;
  nicheDefaultVoice: string;
  initialStatus: string;
  onAudioChange?: (audioPath: string | null) => void;
}) {
  const [selectedVoice, setSelectedVoice] = useState(
    initialVoiceId ?? defaultVoiceForLanguage(script.language, nicheDefaultVoice),
  );
  const [audioPath, setAudioPath] = useState(initialAudioPath);
  const [provider, setProvider] = useState(initialProvider);
  const [status, setStatus] = useState(initialStatus);
  const [generating, setGenerating] = useState(initialStatus === "VOICING");
  const [error, setError] = useState("");

  const pollStatus = useCallback(async () => {
    const res = await fetch(`/api/videos/${videoId}/status`);
    const data = await res.json();
    if (!res.ok) return;

    const v = data.video;
    setStatus(v.status);
    if (v.audioPath) {
      setAudioPath(v.audioPath);
      onAudioChange?.(v.audioPath);
    }
    if (v.voiceProvider) setProvider(v.voiceProvider);
    if (v.voiceId) setSelectedVoice(v.voiceId);
    if (v.errorMessage) setError(v.errorMessage);

    return v.status as string;
  }, [videoId, onAudioChange]);

  useEffect(() => {
    if (!generating) return;

    const interval = setInterval(async () => {
      const s = await pollStatus();
      if (s && s !== "VOICING") {
        setGenerating(false);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [generating, pollStatus]);

  async function handleGenerate() {
    setGenerating(true);
    setError("");

    try {
      const res = await fetch(`/api/videos/${videoId}/voice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voiceId: selectedVoice }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Voice generation failed");

      const newAudioPath = data.audioUrl ?? `/api/videos/${videoId}/audio`;
      setAudioPath(newAudioPath);
      onAudioChange?.(newAudioPath);
      setProvider(data.provider);
      setStatus(data.video.status);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Voice generation failed");
      setStatus("FAILED");
    } finally {
      setGenerating(false);
    }
  }

  const relevantVoices = VOICE_OPTIONS.filter((v) => {
    if (script.language === "mixed") return true;
    return v.language === script.language;
  });

  const voices = relevantVoices.length > 0 ? relevantVoices : VOICE_OPTIONS;

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h2 className={styles.heading}>Voice</h2>
        {provider && (
          <span className={styles.providerBadge}>
            via {provider === "google" ? "Google Cloud TTS" : "edge-tts fallback"}
          </span>
        )}
      </div>

      <div className={styles.voiceGrid}>
        {voices.map((voice) => (
          <button
            key={voice.id}
            type="button"
            className={`${styles.voiceCard} ${selectedVoice === voice.id ? styles.voiceCardActive : ""}`}
            onClick={() => setSelectedVoice(voice.id)}
            disabled={generating}
          >
            <span className={styles.voiceLabel}>{voice.label}</span>
            <span className={styles.voiceDesc}>{voice.description}</span>
            <span className={styles.voiceId}>{voice.id}</span>
          </button>
        ))}
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <button
        type="button"
        className={styles.generateBtn}
        onClick={handleGenerate}
        disabled={generating}
      >
        {generating
          ? "Generating voiceover…"
          : audioPath
            ? "↻ Regenerate Voice"
            : "Generate Voice →"}
      </button>

      {audioPath && !generating && (
        <div className={styles.player}>
          <span className={styles.playerLabel}>Preview</span>
          <audio controls src={audioPath} className={styles.audio}>
            Your browser does not support audio playback.
          </audio>
        </div>
      )}

      {status === "VOICING" && (
        <p className={styles.statusHint}>Status: Voicing — converting script to speech…</p>
      )}
    </div>
  );
}
