import type { ScriptJson } from "@/types/script";
import styles from "./ScriptViewer.module.css";

export function ScriptViewer({ script, accentColor }: { script: ScriptJson; accentColor?: string }) {
  const totalSeconds = script.scenes.reduce((sum, s) => sum + s.duration_seconds, 0);

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>{script.title}</h3>
          <p className={styles.meta}>
            {script.language.toUpperCase()} · {script.scenes.length} scenes · ~{Math.round(totalSeconds)}s
          </p>
        </div>
        <span
          className={styles.thumbText}
          style={{ borderColor: accentColor ?? "var(--accent-purple)" }}
        >
          {script.thumbnail_text}
        </span>
      </div>

      <div className={styles.hookBox}>
        <span className={styles.label}>Hook</span>
        <p className={styles.devanagari}>{script.hook}</p>
      </div>

      <div className={styles.scenes}>
        {script.scenes.map((scene) => (
          <div key={scene.scene_number} className={styles.scene}>
            <div className={styles.sceneHeader}>
              <span className={styles.sceneNum}>Scene {scene.scene_number}</span>
              <span className={styles.sceneDuration}>{scene.duration_seconds}s</span>
              <span className={styles.visualKeyword}>{scene.visual_keyword}</span>
            </div>
            <p className={styles.devanagari}>{scene.text}</p>
          </div>
        ))}
      </div>

      <div className={styles.footer}>
        <div>
          <span className={styles.label}>CTA</span>
          <p className={styles.devanagari}>{script.cta}</p>
        </div>
        <div className={styles.hashtags}>
          {script.hashtags.map((tag) => (
            <span key={tag} className={styles.tag}>
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
