"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./categories.module.css";

type Niche = {
  id: string;
  slug: string;
  nameEn: string;
  nameNe: string;
  emoji: string;
  language: string;
  isActive: boolean;
  sortOrder: number;
  voiceTone: string;
  _count: { videos: number };
};

export function CategoriesClient({ niches: initial }: { niches: Niche[] }) {
  const router = useRouter();
  const [niches, setNiches] = useState(initial);
  const [toggling, setToggling] = useState<string | null>(null);

  async function toggleActive(slug: string, current: boolean) {
    setToggling(slug);
    try {
      const res = await fetch(`/api/admin/categories/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !current }),
      });
      if (!res.ok) throw new Error();

      setNiches((prev) =>
        prev.map((n) => (n.slug === slug ? { ...n, isActive: !current } : n)),
      );
      router.refresh();
    } catch {
      alert("Failed to update category");
    } finally {
      setToggling(null);
    }
  }

  return (
    <div className={styles.grid}>
      {niches.map((niche) => (
        <div
          key={niche.id}
          className={`${styles.card} ${!niche.isActive ? styles.cardInactive : ""}`}
        >
          <div className={styles.cardTop}>
            <span className={styles.emoji}>{niche.emoji}</span>
            <button
              type="button"
              className={`${styles.toggle} ${niche.isActive ? styles.toggleOn : styles.toggleOff}`}
              onClick={() => toggleActive(niche.slug, niche.isActive)}
              disabled={toggling === niche.slug}
              aria-label={niche.isActive ? "Deactivate" : "Activate"}
            >
              <span className={styles.toggleKnob} />
            </button>
          </div>

          <div className={styles.cardInfo}>
            <p className={styles.nameEn}>{niche.nameEn}</p>
            <p className={styles.nameNe}>{niche.nameNe}</p>
            <div className={styles.tags}>
              <span className={styles.tag}>{niche.language}</span>
              <span className={styles.tag}>{niche._count.videos} videos</span>
              <span className={`${styles.statusDot} ${niche.isActive ? styles.dotActive : styles.dotInactive}`} />
              <span className={styles.statusText}>{niche.isActive ? "Active" : "Hidden"}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
