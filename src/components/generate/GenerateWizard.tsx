"use client";

import { useCallback, useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import { ScriptViewer } from "./ScriptViewer";
import type { ScriptJson, TopicSuggestion, VideoLanguage } from "@/types/script";
import styles from "./GenerateWizard.module.css";

type NicheOption = {
  id: string;
  slug: string;
  emoji: string;
  nameEn: string;
  nameNe: string;
  language: string;
  captionColor: string;
  exampleHooks: string[];
};

type WizardStep = "niche" | "topic" | "script";

export function GenerateWizard({
  niches,
  initialNicheSlug,
}: {
  niches: NicheOption[];
  initialNicheSlug?: string;
}) {
  const [step, setStep] = useState<WizardStep>(initialNicheSlug ? "topic" : "niche");
  const [selectedSlug, setSelectedSlug] = useState(initialNicheSlug ?? "");
  const [language, setLanguage] = useState<VideoLanguage>("nepali");
  const [topics, setTopics] = useState<TopicSuggestion[]>([]);
  const [topicsLoading, setTopicsLoading] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [customTopic, setCustomTopic] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [script, setScript] = useState<ScriptJson | null>(null);
  const [videoId, setVideoId] = useState<string | null>(null);

  const selectedNiche = niches.find((n) => n.slug === selectedSlug);

  const effectiveTopic = customTopic.trim() || selectedTopic;

  const loadTopics = useCallback(
    async (refresh = false) => {
      if (!selectedSlug) return;
      setTopicsLoading(true);
      setError("");
      try {
        const url = `/api/niches/${selectedSlug}/topics?language=${language}${refresh ? "&refresh=true" : ""}`;
        const res = await fetch(url);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed to load topics");
        setTopics(data.topics);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load topics");
      } finally {
        setTopicsLoading(false);
      }
    },
    [selectedSlug, language],
  );

  useEffect(() => {
    if (step === "topic" && selectedSlug) {
      loadTopics();
    }
  }, [step, selectedSlug, language, loadTopics]);

  useEffect(() => {
    if (selectedNiche) {
      const defaultLang =
        selectedNiche.language === "hindi"
          ? "hindi"
          : selectedNiche.language === "mixed"
            ? "mixed"
            : "nepali";
      setLanguage(defaultLang);
    }
  }, [selectedNiche]);

  function handleNicheSelect(slug: string) {
    setSelectedSlug(slug);
    setSelectedTopic("");
    setCustomTopic("");
    setScript(null);
    setVideoId(null);
    setStep("topic");
  }

  async function handleGenerateScript() {
    if (!selectedSlug || !effectiveTopic) {
      setError("Please select or type a topic");
      return;
    }

    setGenerating(true);
    setError("");
    setScript(null);

    try {
      const res = await fetch("/api/videos/script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nicheSlug: selectedSlug,
          topic: effectiveTopic,
          language,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Script generation failed");

      setScript(data.script);
      setVideoId(data.video.id);
      setStep("script");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Script generation failed");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className={styles.wizard}>
      <div className={styles.steps}>
        <StepBadge num={1} label="Niche" active={step === "niche"} done={!!selectedSlug && step !== "niche"} />
        <StepLine done={!!selectedSlug} />
        <StepBadge num={2} label="Topic" active={step === "topic"} done={step === "script"} />
        <StepLine done={step === "script"} />
        <StepBadge num={3} label="Script" active={step === "script"} done={false} />
      </div>

      {step === "niche" && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Choose Your Niche</h2>
          <div className={styles.nicheGrid}>
            {niches.map((niche) => (
              <button
                key={niche.slug}
                type="button"
                className={`${styles.nicheCard} ${selectedSlug === niche.slug ? styles.nicheCardActive : ""}`}
                style={{ "--niche-accent": niche.captionColor } as CSSProperties}
                onClick={() => handleNicheSelect(niche.slug)}
              >
                <span className={styles.nicheEmoji}>{niche.emoji}</span>
                <span className={styles.nicheName}>{niche.nameEn}</span>
                <span className={styles.nicheNameNe}>{niche.nameNe}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {step === "topic" && selectedNiche && (
        <section className={styles.section}>
          <div className={`glass-panel ${styles.nicheBanner}`}>
            <span className={styles.nicheEmoji}>{selectedNiche.emoji}</span>
            <div>
              <h2>{selectedNiche.nameEn}</h2>
              <p className={styles.nicheNameNe}>{selectedNiche.nameNe}</p>
            </div>
            <button type="button" className={styles.changeBtn} onClick={() => setStep("niche")}>
              Change
            </button>
          </div>

          <div className={styles.langToggle}>
            <span className={styles.langLabel}>Language</span>
            {(["nepali", "hindi", "mixed"] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                className={`${styles.langBtn} ${language === lang ? styles.langBtnActive : ""}`}
                onClick={() => {
                  setLanguage(lang);
                  setSelectedTopic("");
                }}
              >
                {lang === "nepali" ? "🇳🇵 Nepali" : lang === "hindi" ? "🇮🇳 Hindi" : "🇳🇵🇮🇳 Mixed"}
              </button>
            ))}
          </div>

          <div className={styles.topicsSection}>
            <div className={styles.topicsHeader}>
              <h3>AI Topic Suggestions</h3>
              <button
                type="button"
                className={styles.reshuffleBtn}
                onClick={() => loadTopics(true)}
                disabled={topicsLoading}
              >
                {topicsLoading ? "Loading…" : "↻ Reshuffle"}
              </button>
            </div>

            {topicsLoading && topics.length === 0 ? (
              <div className={styles.topicsLoading}>Generating topic ideas…</div>
            ) : (
              <div className={styles.topicChips}>
                {topics.map((topic) => (
                  <button
                    key={topic.title}
                    type="button"
                    className={`${styles.topicChip} ${selectedTopic === topic.title ? styles.topicChipActive : ""}`}
                    onClick={() => {
                      setSelectedTopic(topic.title);
                      setCustomTopic("");
                    }}
                  >
                    <span className={styles.topicTitle}>{topic.title}</span>
                    <span className={styles.topicHook}>&ldquo;{topic.hookPreview}&rdquo;</span>
                    <span className={styles.topicScore}>🔥 {Math.round(topic.trendingScore)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className={styles.customTopic}>
            <label htmlFor="custom-topic">Or type your own topic</label>
            <input
              id="custom-topic"
              type="text"
              placeholder="e.g. Tata Group le Nepal ma k k control garcha"
              value={customTopic}
              onChange={(e) => {
                setCustomTopic(e.target.value);
                setSelectedTopic("");
              }}
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button
            type="button"
            className={styles.generateBtn}
            onClick={handleGenerateScript}
            disabled={generating || !effectiveTopic}
          >
            {generating ? "Generating script…" : "Generate Script →"}
          </button>

          <p className={styles.phaseNote}>
            Generate voice on the video detail page. Visuals and rendering — Phases 4–5.
          </p>
        </section>
      )}

      {step === "script" && script && selectedNiche && (
        <section className={styles.section}>
          <div className={styles.scriptSuccess}>
            <span className={styles.successIcon}>✓</span>
            <div>
              <h2>Script Generated</h2>
              <p>Your {script.scenes.length}-scene viral short script is ready</p>
            </div>
          </div>

          <div className={`glass-panel ${styles.scriptPanel}`}>
            <ScriptViewer script={script} accentColor={selectedNiche.captionColor} />
          </div>

          <div className={styles.scriptActions}>
            {videoId && (
              <Link href={`/videos/${videoId}`} className={styles.primaryAction}>
                View Video Detail →
              </Link>
            )}
            <button
              type="button"
              className={styles.secondaryAction}
              onClick={() => {
                setStep("topic");
                setScript(null);
              }}
            >
              Try Another Topic
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

function StepBadge({
  num,
  label,
  active,
  done,
}: {
  num: number;
  label: string;
  active: boolean;
  done: boolean;
}) {
  return (
    <div className={`${styles.stepBadge} ${active ? styles.stepActive : ""} ${done ? styles.stepDone : ""}`}>
      <span className={styles.stepNum}>{done ? "✓" : num}</span>
      <span className={styles.stepLabel}>{label}</span>
    </div>
  );
}

function StepLine({ done }: { done: boolean }) {
  return <div className={`${styles.stepLine} ${done ? styles.stepLineDone : ""}`} />;
}
