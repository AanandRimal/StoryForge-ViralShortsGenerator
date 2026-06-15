"use client";

import { useCallback, useEffect, useState } from "react";
import styles from "./RenderPanel.module.css";

export function RenderPanel({
  videoId,
  initialVideoPath,
  initialThumbnailPath,
  initialDuration,
  initialStatus,
  hasAudio: initialHasAudio,
  hasVisuals: initialHasVisuals,
}: {
  videoId: string;
  initialVideoPath: string | null;
  initialThumbnailPath: string | null;
  initialDuration: number | null;
  initialStatus: string;
  hasAudio: boolean;
  hasVisuals: boolean;
}) {
  const [videoPath, setVideoPath] = useState(initialVideoPath);
  const [thumbnailPath, setThumbnailPath] = useState(initialThumbnailPath);
  const [duration, setDuration] = useState(initialDuration);
  const [status, setStatus] = useState(initialStatus);
  const [rendering, setRendering] = useState(initialStatus === "RENDERING");
  const [error, setError] = useState("");
  const [hasAudio, setHasAudio] = useState(initialHasAudio);
  const [hasVisuals, setHasVisuals] = useState(initialHasVisuals);

  const canRender = hasAudio && hasVisuals;
  const isReady = status === "READY" && !!videoPath;

  const pollStatus = useCallback(async () => {
    const res = await fetch(`/api/videos/${videoId}/status`);
    const data = await res.json();
    if (!res.ok) return;

    const v = data.video;
    setStatus(v.status);
    setHasAudio(!!v.audioPath);
    setHasVisuals(!!v.visualsJson?.scenes?.length);
    if (v.videoPath) setVideoPath(v.videoPath);
    if (v.durationSeconds) setDuration(v.durationSeconds);
    if (v.errorMessage) setError(v.errorMessage);

    return v.status as string;
  }, [videoId]);

  useEffect(() => {
    setHasAudio(initialHasAudio);
    setHasVisuals(initialHasVisuals);
  }, [initialHasAudio, initialHasVisuals]);

  useEffect(() => {
    if (initialHasAudio && initialHasVisuals) return;
    void pollStatus();
  }, [initialHasAudio, initialHasVisuals, pollStatus]);

  useEffect(() => {
    if (!rendering) return;

    const interval = setInterval(async () => {
      const s = await pollStatus();
      if (s && s !== "RENDERING") setRendering(false);
    }, 3000);

    return () => clearInterval(interval);
  }, [rendering, pollStatus]);

  async function handleRender() {
    setRendering(true);
    setError("");

    try {
      const res = await fetch(`/api/videos/${videoId}/render`, {
        method: "POST",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Render failed");

      setVideoPath(data.render.video_path);
      setThumbnailPath(data.render.thumbnail_path);
      setDuration(data.render.duration_seconds);
      setStatus(data.video.status);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Render failed");
      setStatus("FAILED");
    } finally {
      setRendering(false);
    }
  }

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h2 className={styles.heading}>Final Video</h2>
        {isReady && <span className={styles.badge}>1080×1920 · Ready</span>}
      </div>

      <div className={styles.specs}>
        <span className={styles.spec}>📐 9:16 vertical</span>
        <span className={styles.spec}>🎬 Zoompan motion</span>
        <span className={styles.spec}>🔤 Devanagari captions</span>
        <span className={styles.spec}>🔊 Voiceover mixed</span>
      </div>

      {!canRender && (
        <p className={styles.prereq}>
          Generate voice and fetch visuals before rendering the final video.
        </p>
      )}

      {error && <p className={styles.error}>{error}</p>}

      <button
        type="button"
        className={styles.renderBtn}
        onClick={handleRender}
        disabled={rendering || !canRender}
      >
        {rendering
          ? "Rendering… (may take 2–3 min)"
          : videoPath
            ? "↻ Re-render Video"
            : "Render Final Video →"}
      </button>

      {status === "RENDERING" && (
        <p className={styles.hint}>
          Concatenating clips, mixing audio, and burning Devanagari captions…
        </p>
      )}

      {videoPath && (
        <div className={styles.preview}>
          <span className={styles.previewLabel}>Preview</span>
          <video
            className={styles.video}
            src={videoPath}
            poster={thumbnailPath ?? undefined}
            controls
            playsInline
          />
          <div className={styles.metaRow}>
            {duration && <span>Duration: {Math.round(duration)}s</span>}
            <span>Status: {status}</span>
          </div>
        </div>
      )}

      <p className={styles.phaseNote}>
        Publishing to TikTok, Instagram, YouTube, Facebook — Phase 6.
      </p>
    </div>
  );
}
