import type { CSSProperties } from "react";
import Link from "next/link";
import styles from "./NicheCard.module.css";

export type NicheCardData = {
  id: string;
  slug: string;
  emoji: string;
  nameEn: string;
  nameNe: string;
  language: string;
  captionColor: string;
  exampleHooks: string[];
};

function languageBadge(language: string) {
  if (language === "hindi") return { flag: "🇮🇳", label: "HI" };
  if (language === "mixed") return { flag: "🇳🇵🇮🇳", label: "MIX" };
  return { flag: "🇳🇵", label: "NE" };
}

export function NicheCard({ niche }: { niche: NicheCardData }) {
  const badge = languageBadge(niche.language);
  const hook = niche.exampleHooks[0] ?? "";

  return (
    <article
      className={styles.card}
      style={{ "--niche-accent": niche.captionColor } as CSSProperties}
    >
      <div className={styles.top}>
        <span className={styles.emoji}>{niche.emoji}</span>
        <span className={styles.badge}>
          {badge.flag} {badge.label}
        </span>
      </div>

      <div className={styles.titles}>
        <h3 className={styles.nameEn}>{niche.nameEn}</h3>
        <p className={styles.nameNe}>{niche.nameNe}</p>
      </div>

      <p className={styles.hook}>&ldquo;{hook}&rdquo;</p>

      <Link href={`/generate?niche=${niche.slug}`} className={styles.cta}>
        Create Video
      </Link>
    </article>
  );
}
