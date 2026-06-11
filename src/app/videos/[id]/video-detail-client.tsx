"use client";

import { useState } from "react";
import { ScriptViewer } from "@/components/generate/ScriptViewer";
import type { ScriptJson } from "@/types/script";
import styles from "./video.module.css";

export function VideoDetailClient({
  videoId,
  initialScript,
  accentColor,
  topic,
}: {
  videoId: string;
  initialScript: ScriptJson;
  accentColor: string;
  topic: string;
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Regeneration failed");
    } finally {
      setRegenerating(false);
    }
  }

  return (
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

      <p className={styles.phaseNote}>
        Voice generation, visuals, and rendering — Phase 3 onwards.
      </p>
    </div>
  );
}
