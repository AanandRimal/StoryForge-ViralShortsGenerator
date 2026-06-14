"use client";

import { useCallback, useEffect, useState } from "react";
import type { VisualsJson, VisualStyle } from "@/types/visuals";
import styles from "./VisualsPanel.module.css";

const STYLE_OPTIONS: { value: VisualStyle; label: string; desc: string }[] = [
  {
    value: "PEXELS",
    label: "Pexels Stock Video",
    desc: "Free vertical clips — recommended, no ban risk",
  },
  {
    value: "MIXED",
    label: "Mixed (Pexels + AI fallback)",
    desc: "Pexels first, Replicate AI image if clip not found",
  },
];

export function VisualsPanel({
  videoId,
  initialVisuals,
  initialStyle,
  initialStatus,
}: {
  videoId: string;
  initialVisuals: VisualsJson | null;
  initialStyle: string | null;
  initialStatus: string;
}) {
  const [style, setStyle] = useState<VisualStyle>(
    (initialStyle as VisualStyle) ?? "PEXELS",
  );
  const [visuals, setVisuals] = useState<VisualsJson | null>(initialVisuals);
  const [status, setStatus] = useState(initialStatus);
  const [fetching, setFetching] = useState(initialStatus === "FETCHING_VISUALS");
  const [error, setError] = useState("");

  const pollStatus = useCallback(async () => {
    const res = await fetch(`/api/videos/${videoId}/status`);
    const data = await res.json();
    if (!res.ok) return;
    setStatus(data.video.status);
    if (data.video.visualsJson) setVisuals(data.video.visualsJson);
    if (data.video.errorMessage) setError(data.video.errorMessage);
    return data.video.status as string;
  }, [videoId]);

  useEffect(() => {
    if (!fetching) return;
    const interval = setInterval(async () => {
      const s = await pollStatus();
      if (s && s !== "FETCHING_VISUALS") setFetching(false);
    }, 3000);
    return () => clearInterval(interval);
  }, [fetching, pollStatus]);

  async function handleFetch() {
    setFetching(true);
    setError("");

    try {
      const res = await fetch(`/api/videos/${videoId}/visuals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ style }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Visual fetch failed");

      setVisuals(data.visuals);
      setStatus(data.video.status);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Visual fetch failed");
      setStatus("FAILED");
    } finally {
      setFetching(false);
    }
  }

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h2 className={styles.heading}>Visuals</h2>
        {visuals && (
          <span className={styles.badge}>
            {visuals.scenes.length} scenes · {visuals.style}
          </span>
        )}
      </div>

      <div className={styles.styleGrid}>
        {STYLE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={`${styles.styleCard} ${style === opt.value ? styles.styleCardActive : ""}`}
            onClick={() => setStyle(opt.value)}
            disabled={fetching}
          >
            <span className={styles.styleLabel}>{opt.label}</span>
            <span className={styles.styleDesc}>{opt.desc}</span>
          </button>
        ))}
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <button
        type="button"
        className={styles.fetchBtn}
        onClick={handleFetch}
        disabled={fetching}
      >
        {fetching
          ? "Fetching visuals… (this may take 1–2 min)"
          : visuals
            ? "↻ Refetch Visuals"
            : "Fetch Scene Clips →"}
      </button>

      {status === "FETCHING_VISUALS" && (
        <p className={styles.hint}>
          Downloading Pexels clips, trimming, and applying color grades per scene…
        </p>
      )}

      {visuals && visuals.scenes.length > 0 && (
        <div className={styles.sceneList}>
          {visuals.scenes.map((scene) => (
            <div key={scene.scene_number} className={styles.sceneRow}>
              <div className={styles.sceneInfo}>
                <span className={styles.sceneNum}>Scene {scene.scene_number}</span>
                <span className={styles.sceneKeyword}>{scene.keyword}</span>
                <span className={styles.sceneSource}>
                  {scene.source === "pexels" ? "📹 Pexels" : "🎨 AI + motion"}
                  {scene.pexels_id ? ` #${scene.pexels_id}` : ""}
                </span>
              </div>
              <video
                className={styles.scenePreview}
                src={scene.clip_path}
                muted
                loop
                playsInline
                onMouseEnter={(e) => e.currentTarget.play()}
                onMouseLeave={(e) => {
                  e.currentTarget.pause();
                  e.currentTarget.currentTime = 0;
                }}
              />
            </div>
          ))}
        </div>
      )}

      <p className={styles.phaseNote}>
        FFmpeg final render with captions — Phase 5.
      </p>
    </div>
  );
}
