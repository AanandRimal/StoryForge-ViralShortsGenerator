import Link from "next/link";
import { AppHeader } from "@/components/layout/AppHeader";
import { StatsRow } from "@/components/home/StatsRow";
import { NicheGrid } from "@/components/home/NicheGrid";
import { RecentVideos } from "@/components/home/RecentVideos";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getDashboardStats } from "@/lib/stats";
import styles from "./home.module.css";

export default async function HomePage() {
  const session = await auth();
  const userId = session?.user?.id as string;
  const isAdmin = session?.user?.role === "ADMIN";
  const firstName = session?.user?.name?.split(" ")[0] ?? "Creator";

  const [stats, niches, recentVideos] = await Promise.all([
    getDashboardStats(isAdmin ? undefined : userId),
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
      where: isAdmin ? {} : { creatorId: userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        status: true,
        thumbnailPath: true,
        createdAt: true,
        niche: { select: { emoji: true, nameEn: true } },
        creator: { select: { name: true } },
      },
    }),
  ]);

  const recentWithUrls = recentVideos.map((v) => ({
    ...v,
    thumbnailUrl: v.thumbnailPath ? `/api/videos/${v.id}/thumbnail` : null,
  }));

  return (
    <>
      <AppHeader />
      <main className={styles.main}>
        <div className={styles.hero}>
          <div className={styles.heroContent}>
            <p className={styles.heroEyebrow}>
              <span>✦</span> Welcome back
            </p>
            <h1 className={styles.heroTitle}>{firstName}&apos;s Studio</h1>
            <p className={styles.heroSubtitle}>
              Generate viral 60–90s shorts for Nepali, Hindi &amp; English audiences — scripts, voices, visuals, auto-rendered.
            </p>
          </div>
          <div className={styles.heroActions}>
            <Link href="/queue" className="btn-ghost">View Queue</Link>
            <Link href="/generate" className="btn-primary">+ New Video</Link>
          </div>
        </div>
        <StatsRow stats={stats} />
        <NicheGrid niches={niches} />
        <RecentVideos videos={recentWithUrls} isAdmin={isAdmin} />
      </main>
    </>
  );
}
