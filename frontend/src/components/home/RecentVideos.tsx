import Link from "next/link";
import Image from "next/image";
import styles from "./RecentVideos.module.css";

type RecentVideo = {
  id: string;
  title: string | null;
  status: string;
  createdAt: Date;
  thumbnailUrl: string | null;
  niche: { emoji: string; nameEn: string };
  creator: { name: string };
};

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  PENDING: { label: "Pending", className: styles.statusPending },
  SCRIPTING: { label: "Scripting", className: styles.statusScripting },
  VOICING: { label: "Voicing", className: styles.statusScripting },
  FETCHING_VISUALS: { label: "Fetching", className: styles.statusScripting },
  RENDERING: { label: "Rendering", className: styles.statusRendering },
  READY: { label: "Ready", className: styles.statusReady },
  PUBLISHING: { label: "Publishing", className: styles.statusRendering },
  PUBLISHED: { label: "Published", className: styles.statusPublished },
  FAILED: { label: "Failed", className: styles.statusFailed },
};

export function RecentVideos({
  videos,
  isAdmin = false,
}: {
  videos: RecentVideo[];
  isAdmin?: boolean;
}) {
  if (videos.length === 0) {
    return (
      <section className={styles.section}>
        <h2 className={styles.title}>Recent Videos</h2>
        <div className={`glass-panel ${styles.empty}`}>
          <span className={styles.emptyIcon}>🎥</span>
          <p>No videos yet. Pick a niche above and create your first viral short!</p>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>Recent Videos</h2>
        <Link href="/queue" className={styles.viewAll}>
          View all →
        </Link>
      </div>
      <div className={styles.scroll}>
        {videos.map((video) => {
          const status = STATUS_STYLES[video.status] ?? STATUS_STYLES.PENDING;
          return (
            <Link
              key={video.id}
              href={`/videos/${video.id}`}
              className={styles.card}
            >
              <div className={styles.thumb}>
                {video.thumbnailUrl ? (
                  <Image
                    src={video.thumbnailUrl}
                    alt={video.title ?? "Video thumbnail"}
                    fill
                    sizes="80px"
                    className={styles.thumbImg}
                    unoptimized
                  />
                ) : (
                  <span className={styles.thumbEmoji}>{video.niche.emoji}</span>
                )}
              </div>
              <div className={styles.info}>
                <p className={styles.videoTitle}>
                  {video.title ?? "Untitled video"}
                </p>
                <p className={styles.nicheName}>{video.niche.nameEn}</p>
                {isAdmin && (
                  <p className={styles.creatorName}>{video.creator.name}</p>
                )}
                <span className={`${styles.status} ${status.className}`}>
                  {status.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
