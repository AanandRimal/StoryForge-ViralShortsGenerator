import { AppHeader } from "@/components/layout/AppHeader";
import { StatsRow } from "@/components/home/StatsRow";
import { NicheGrid } from "@/components/home/NicheGrid";
import { RecentVideos } from "@/components/home/RecentVideos";
import { prisma } from "@/lib/prisma";
import { getDashboardStats } from "@/lib/stats";
import styles from "./home.module.css";

export default async function HomePage() {
  const [stats, niches, recentVideos] = await Promise.all([
    getDashboardStats(),
    prisma.niche.findMany({
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
    }),
    prisma.video.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        niche: { select: { emoji: true, nameEn: true } },
      },
    }),
  ]);

  return (
    <>
      <AppHeader />
      <main className={styles.main}>
        <div className={styles.hero}>
          <h1 className={styles.heroTitle}>Dashboard</h1>
          <p className={styles.heroSubtitle}>
            Generate viral 60–90s shorts in Nepali &amp; Hindi
          </p>
        </div>
        <StatsRow stats={stats} />
        <NicheGrid niches={niches} />
        <RecentVideos videos={recentVideos} />
      </main>
    </>
  );
}
