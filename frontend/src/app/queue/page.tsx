import Link from "next/link";
import { AppHeader } from "@/components/layout/AppHeader";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import styles from "./queue.module.css";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  SCRIPTING: "Scripting",
  VOICING: "Voicing",
  FETCHING_VISUALS: "Fetching Visuals",
  RENDERING: "Rendering",
  READY: "Ready",
  PUBLISHING: "Publishing",
  PUBLISHED: "Published",
  FAILED: "Failed",
};

const STATUS_CLASS: Record<string, string> = {
  PENDING: styles.statusPending,
  SCRIPTING: styles.statusActive,
  VOICING: styles.statusActive,
  FETCHING_VISUALS: styles.statusActive,
  RENDERING: styles.statusRendering,
  READY: styles.statusReady,
  PUBLISHING: styles.statusActive,
  PUBLISHED: styles.statusPublished,
  FAILED: styles.statusFailed,
};

export default async function QueuePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; creator?: string }>;
}) {
  const session = await auth();
  const userId = session?.user?.id as string;
  const isAdmin = session?.user?.role === "ADMIN";
  const { status: filterStatus, creator: creatorFilter } = await searchParams;

  const where = {
    ...(isAdmin && creatorFilter
      ? { creatorId: creatorFilter }
      : isAdmin
        ? {}
        : { creatorId: userId }),
    ...(filterStatus ? { status: filterStatus as never } : {}),
  };

  const videos = await prisma.video.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      title: true,
      status: true,
      createdAt: true,
      durationSeconds: true,
      thumbnailPath: true,
      niche: { select: { emoji: true, nameEn: true } },
      creator: { select: { name: true } },
    },
  });

  const allStatuses = [
    "PENDING", "SCRIPTING", "VOICING", "FETCHING_VISUALS",
    "RENDERING", "READY", "PUBLISHING", "PUBLISHED", "FAILED",
  ];

  return (
    <>
      <AppHeader />
      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <h1 className={styles.title}>Video Queue</h1>
          <Link href="/generate" className={styles.newBtn}>
            + New Video
          </Link>
        </div>

        <div className={styles.filters}>
          <Link
            href="/queue"
            className={`${styles.filterChip} ${!filterStatus ? styles.filterActive : ""}`}
          >
            All
          </Link>
          {allStatuses.map((s) => (
            <Link
              key={s}
              href={`/queue?status=${s}`}
              className={`${styles.filterChip} ${filterStatus === s ? styles.filterActive : ""}`}
            >
              {STATUS_LABELS[s]}
            </Link>
          ))}
        </div>

        {videos.length === 0 ? (
          <div className={`glass-panel ${styles.empty}`}>
            <span className={styles.emptyIcon}>🎬</span>
            <p>No videos found{filterStatus ? ` with status "${STATUS_LABELS[filterStatus] ?? filterStatus}"` : ""}.</p>
            <Link href="/generate" className={styles.generateLink}>
              Generate your first video →
            </Link>
          </div>
        ) : (
          <div className={styles.table}>
            <div className={styles.tableHeader}>
              <span>Video</span>
              <span>Niche</span>
              {isAdmin && <span>Creator</span>}
              <span>Duration</span>
              <span>Created</span>
              <span>Status</span>
            </div>
            {videos.map((video) => (
              <Link
                key={video.id}
                href={`/videos/${video.id}`}
                className={styles.row}
              >
                <span className={styles.videoTitle}>
                  {video.thumbnailPath && (
                    <span className={styles.thumbDot} />
                  )}
                  {video.title ?? "Untitled"}
                </span>
                <span className={styles.niche}>
                  {video.niche.emoji} {video.niche.nameEn}
                </span>
                {isAdmin && (
                  <span className={styles.creator}>{video.creator.name}</span>
                )}
                <span className={styles.duration}>
                  {video.durationSeconds
                    ? `${Math.round(video.durationSeconds)}s`
                    : "—"}
                </span>
                <span className={styles.date}>
                  {new Date(video.createdAt).toLocaleDateString()}
                </span>
                <span
                  className={`${styles.statusBadge} ${STATUS_CLASS[video.status] ?? styles.statusPending}`}
                >
                  {STATUS_LABELS[video.status] ?? video.status}
                </span>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
