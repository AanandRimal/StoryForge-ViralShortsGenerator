"use client";

import { Fragment, useState } from "react";
import { ScriptViewer } from "@/components/generate/ScriptViewer";
import { VoicePanel } from "@/components/videos/VoicePanel";
import { VisualsPanel } from "@/components/videos/VisualsPanel";
import { RenderPanel } from "@/components/videos/RenderPanel";
import type { ScriptJson } from "@/types/script";
import type { VisualsJson } from "@/types/visuals";
import styles from "./video.module.css";

const STEPS = [
  { key: "voice", label: "Voice" },
  { key: "visuals", label: "Visuals" },
  { key: "render", label: "Render" },
];

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
  initialVideoPath,
  initialThumbnailPath,
  initialDuration,
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
  initialVideoPath: string | null;
  initialThumbnailPath: string | null;
  initialDuration: number | null;
}) {
  const [script, setScript] = useState(initialScript);
  const [audioPath, setAudioPath] = useState(initialAudioPath);
  const [visuals, setVisuals] = useState(initialVisuals);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState("");

  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(() => {
    if (initialVideoPath) return 3;
    if (initialVisuals?.scenes?.length) return 3;
    if (initialAudioPath) return 2;
    return 1;
  });

  const stepDone: boolean[] = [
    !!audioPath,
    !!(visuals?.scenes?.length),
    !!initialVideoPath,
  ];

  function handleAudioChange(path: string | null) {
    setAudioPath(path);
    if (path) setActiveStep((s) => (Math.max(s, 2) as 1 | 2 | 3));
  }

  function handleVisualsChange(v: VisualsJson | null) {
    setVisuals(v);
    if (v?.scenes?.length) setActiveStep((s) => (Math.max(s, 3) as 1 | 2 | 3));
  }

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
    <div className={styles.layout}>
      {/* LEFT: Script viewer */}
      <div className={styles.mainCol}>
        <div className={styles.scriptArea}>
          <div className={styles.scriptToolbar}>
            <h2 className={styles.scriptHeading}>Script</h2>
            <button
              type="button"
              className={styles.regenBtn}
              onClick={handleRegenerate}
              disabled={regenerating}
            >
              {regenerating ? "Regenerating…" : "↻ Regenerate"}
            </button>
          </div>

          {error && <p className={styles.regenError}>{error}</p>}

          <div className={`glass-panel ${styles.scriptPanel}`}>
            <ScriptViewer script={script} accentColor={accentColor} />
          </div>
        </div>
      </div>

      {/* RIGHT: Stepped workflow card */}
      <div className={styles.sideCol}>
        <div className={styles.stepsCard}>

          {/* Step tab navigator */}
          <div className={styles.stepper}>
            {STEPS.map((step, i) => (
              <Fragment key={step.key}>
                <button
                  type="button"
                  className={`${styles.stepBtn} ${
                    activeStep === i + 1 ? styles.stepActive : ""
                  } ${stepDone[i] && activeStep !== i + 1 ? styles.stepDone : ""}`}
                  onClick={() => setActiveStep((i + 1) as 1 | 2 | 3)}
                >
                  <span className={styles.stepCircle}>
                    {stepDone[i] && activeStep !== i + 1 ? "✓" : i + 1}
                  </span>
                  <span className={styles.stepLabel}>{step.label}</span>
                </button>
                {i < 2 && (
                  <div
                    className={`${styles.stepConnector} ${
                      stepDone[i] ? styles.stepConnectorDone : ""
                    }`}
                  />
                )}
              </Fragment>
            ))}
          </div>

          {/* Active panel — all three stay mounted, CSS hides inactive ones */}
          <div className={styles.stepBody}>
            <div className={activeStep !== 1 ? styles.panelHidden : undefined}>
              <VoicePanel
                videoId={videoId}
                script={script}
                initialAudioPath={audioPath}
                initialVoiceId={initialVoiceId}
                initialProvider={initialProvider}
                nicheDefaultVoice={nicheDefaultVoice}
                initialStatus={initialStatus}
                onAudioChange={handleAudioChange}
              />
            </div>
            <div className={activeStep !== 2 ? styles.panelHidden : undefined}>
              <VisualsPanel
                videoId={videoId}
                initialVisuals={visuals}
                initialStyle={initialVisualStyle}
                initialStatus={initialStatus}
                onVisualsChange={handleVisualsChange}
              />
            </div>
            <div className={activeStep !== 3 ? styles.panelHidden : undefined}>
              <RenderPanel
                videoId={videoId}
                initialVideoPath={initialVideoPath}
                initialThumbnailPath={initialThumbnailPath}
                initialDuration={initialDuration}
                initialStatus={initialStatus}
                hasAudio={!!audioPath}
                hasVisuals={!!visuals?.scenes?.length}
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
