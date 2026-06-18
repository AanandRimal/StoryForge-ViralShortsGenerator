import Link from "next/link";
import { AppHeader } from "@/components/layout/AppHeader";
import { GenerateWizard } from "@/components/generate/GenerateWizard";
import { prisma } from "@/lib/prisma";
import styles from "./generate.module.css";

export default async function GeneratePage({
  searchParams,
}: {
  searchParams: Promise<{ niche?: string }>;
}) {
  const { niche: nicheSlug } = await searchParams;

  const niches = await prisma.niche.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      slug: true,
      emoji: true,
      nameEn: true,
      nameNe: true,
      language: true,
      captionColor: true,
      exampleHooks: true,
    },
  });

  return (
    <>
      <AppHeader />
      <main className={styles.main}>
        <Link href="/" className={styles.back}>
          ← Back to niches
        </Link>
        <h1 className={styles.title}>Generation Wizard</h1>
        <GenerateWizard niches={niches} initialNicheSlug={nicheSlug} />
      </main>
    </>
  );
}
