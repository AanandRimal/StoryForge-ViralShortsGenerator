"use client";

import { useState } from "react";
import { ScriptViewer } from "@/components/generate/ScriptViewer";
import { VoicePanel } from "@/components/videos/VoicePanel";
import { VisualsPanel } from "@/components/videos/VisualsPanel";
import type { ScriptJson } from "@/types/script";
import type { VisualsJson } from "@/types/visuals";
import styles from "./video.module.css";

export function VideoDetailClient({
  videoId,
  initialScript,
  accentColor,
  topic,
  initialAudioPath,
  initialVoiceId,
  initialProvider,
  nicheDefaultVoice,
  initialStatus,
  initialVisuals,
  initialVisualStyle,
}: {
  videoId: string;
  initialScript: ScriptJson;
  accentColor: string;
  topic: string;
  initialAudioPath: string | null;
  initialVoiceId: string | null;
  initialProvider: string | null;
  nicheDefaultVoice: string;
  initialStatus: string;
  initialVisuals: VisualsJson | null;
  initialVisualStyle: string | null;
}) {
  const [script, setScript] = useState(initialScript);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState("");

  async function handleRegenerate() {
    setRegenerating(true);
    setError("");

    try {
      const res = await fetch(`/api/videos/${videoId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "regenerate-script",
          topic,
          language: script.language,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Regeneration failed");

      setScript(data.script);
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Regeneration failed");
    } finally {
      setRegenerating(false);
    }
  }

  return (
    <>
      <VoicePanel
        videoId={videoId}
        script={script}
        initialAudioPath={initialAudioPath}
        initialVoiceId={initialVoiceId}
        initialProvider={initialProvider}
        nicheDefaultVoice={nicheDefaultVoice}
        initialStatus={initialStatus}
      />

      <VisualsPanel
        videoId={videoId}
        initialVisuals={initialVisuals}
        initialStyle={initialVisualStyle}
        initialStatus={initialStatus}
      />

      <div className={styles.scriptArea}>
        <div className={styles.scriptToolbar}>
          <h2 className={styles.scriptHeading}>Script</h2>
          <button
            type="button"
            className={styles.regenBtn}
            onClick={handleRegenerate}
            disabled={regenerating}
          >
            {regenerating ? "Regenerating…" : "↻ Regenerate Script"}
          </button>
        </div>

        {error && <p className={styles.regenError}>{error}</p>}

        <div className={`glass-panel ${styles.scriptPanel}`}>
          <ScriptViewer script={script} accentColor={accentColor} />
        </div>
      </div>
    </>
  );
}
