import Link from "next/link";
import { AppHeader } from "@/components/layout/AppHeader";
import { prisma } from "@/lib/prisma";
import styles from "./generate.module.css";

export default async function GeneratePage({
  searchParams,
}: {
  searchParams: Promise<{ niche?: string }>;
}) {
  const { niche: nicheSlug } = await searchParams;
  const niche = nicheSlug
    ? await prisma.niche.findUnique({ where: { slug: nicheSlug } })
    : null;

  return (
    <>
      <AppHeader />
      <main className={styles.main}>
        <Link href="/" className={styles.back}>
          ← Back to niches
        </Link>
        <h1 className={styles.title}>Generation Wizard</h1>
        {niche ? (
          <div className={`glass-panel ${styles.nicheSelected}`}>
            <span className={styles.emoji}>{niche.emoji}</span>
            <div>
              <h2>{niche.nameEn}</h2>
              <p className={styles.nameNe}>{niche.nameNe}</p>
            </div>
          </div>
        ) : (
          <p className={styles.hint}>Select a niche from the home page to begin.</p>
        )}
        <p className={styles.comingSoon}>
          Phase 2 coming next: topic selection, script generation with Claude Haiku,
          and the full 5-step wizard.
        </p>
      </main>
    </>
  );
}
