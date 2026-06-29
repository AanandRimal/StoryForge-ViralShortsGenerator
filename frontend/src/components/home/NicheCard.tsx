import type { CSSProperties } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
  if (language === "hindi")   return { flag: "🇮🇳", label: "Hindi" };
  if (language === "english") return { flag: "🇬🇧", label: "English" };
  if (language === "mixed")   return { flag: "🌐",  label: "Mixed" };
  return                             { flag: "🇳🇵", label: "Nepali" };
}

export function NicheCard({ niche }: { niche: NicheCardData }) {
  const badge = languageBadge(niche.language);
  const hook = niche.exampleHooks[0] ?? "";

  return (
    <Card
      className={cn(styles.card, "hover:-translate-y-[3px] hover:shadow-[0_12px_40px_rgba(0,0,0,0.35)]")}
      style={{ "--niche-accent": niche.captionColor } as CSSProperties}
    >
      <div className={styles.accentLine} />

      <div className={styles.top}>
        <span className={styles.emoji}>{niche.emoji}</span>
        <Badge variant="secondary">
          {badge.flag} {badge.label}
        </Badge>
      </div>

      <div className={styles.titles}>
        <h3 className={styles.nameEn}>{niche.nameEn}</h3>
        <p className={styles.nameNe}>{niche.nameNe}</p>
      </div>

      <p className={styles.hook}>&ldquo;{hook}&rdquo;</p>

      <Button asChild variant="outline" size="sm" className={styles.cta}>
        <Link href={`/generate?niche=${niche.slug}`}>Create Video →</Link>
      </Button>
    </Card>
  );
}
