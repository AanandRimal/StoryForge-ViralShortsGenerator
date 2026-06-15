import Link from "next/link";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/layout/AppHeader";
import { VideoDetailClient } from "./video-detail-client";
import { prisma } from "@/lib/prisma";
import type { ScriptJson } from "@/types/script";
import type { VisualsJson } from "@/types/visuals";
import styles from "./video.module.css";

export default async function VideoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const video = await prisma.video.findUnique({
    where: { id },
    include: {
      niche: {
        select: {
          slug: true,
          nameEn: true,
          nameNe: true,
          emoji: true,
          captionColor: true,
          defaultVoiceId: true,
        },
      },
    },
  });

  if (!video) notFound();

  const script = video.scriptJson as ScriptJson | null;
  const visuals = video.visualsJson as VisualsJson | null;

  return (
    <>
      <AppHeader />
      <main className={styles.main}>
        <Link href="/" className={styles.back}>
          ← Back to dashboard
        </Link>

        <div className={styles.header}>
          <div className={styles.nicheBadge}>
            <span>{video.niche.emoji}</span>
            <span>{video.niche.nameEn}</span>
          </div>
          <StatusBadge
            status={video.status}
            hasAudio={!!video.audioPath}
            hasVisuals={!!visuals?.scenes?.length}
            hasVideo={!!video.videoPath}
          />
        </div>

        <h1 className={styles.title}>
          {video.title ?? "Untitled video"}
        </h1>

        {video.errorMessage && (
          <div className={styles.errorBox}>
            <strong>Error:</strong> {video.errorMessage}
          </div>
        )}

        {script ? (
          <VideoDetailClient
            videoId={video.id}
            initialScript={script}
            accentColor={video.niche.captionColor}
            topic={video.title ?? ""}
            initialAudioPath={video.audioPath}
            initialVoiceId={video.voiceId}
            initialProvider={video.voiceProvider}
            nicheDefaultVoice={video.niche.defaultVoiceId}
            initialStatus={video.status}
            initialVisuals={visuals}
            initialVisualStyle={video.visualStyle}
            initialVideoPath={video.videoPath}
            initialThumbnailPath={video.thumbnailPath}
            initialDuration={video.durationSeconds}
          />
        ) : (
          <div className={`glass-panel ${styles.noScript}`}>
            <p>No script generated yet.</p>
            <Link href={`/generate?niche=${video.niche.slug}`} className={styles.generateLink}>
              Generate a script →
            </Link>
          </div>
        )}

        <div className={styles.meta}>
          <span>Created {video.createdAt.toLocaleDateString()}</span>
          {video.durationSeconds && (
            <span>~{Math.round(video.durationSeconds)}s duration</span>
          )}
        </div>
      </main>
    </>
  );
}

function StatusBadge({
  status,
  hasAudio,
  hasVisuals,
  hasVideo,
}: {
  status: string;
  hasAudio: boolean;
  hasVisuals: boolean;
  hasVideo: boolean;
}) {
  let pendingLabel = "Script Ready";
  if (hasVideo) pendingLabel = "Video Ready";
  else if (hasVisuals) pendingLabel = "Visuals Ready";
  else if (hasAudio) pendingLabel = "Voice Ready";

  const labels: Record<string, string> = {
    PENDING: pendingLabel,
    SCRIPTING: "Scripting",
    VOICING: "Voicing",
    FETCHING_VISUALS: "Fetching Visuals",
    RENDERING: "Rendering",
    READY: "Ready",
    PUBLISHING: "Publishing",
    PUBLISHED: "Published",
    FAILED: "Failed",
  };

  return (
    <span className={`${styles.status} ${styles[`status_${status}`] ?? ""}`}>
      {labels[status] ?? status}
    </span>
  );
}
