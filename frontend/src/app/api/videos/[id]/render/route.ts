import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { renderVideoForVideo } from "@/lib/pipeline/audio-visual-render/render-pipeline";
import { clearRenderForVideo } from "@/lib/render-storage";
import type { ScriptJson } from "@/types/script";
import type { VisualsJson } from "@/types/visuals";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await params;

  const video = await prisma.video.findUnique({
    where: { id },
    include: { niche: true },
  });

  if (!video) {
    return NextResponse.json({ error: "Video not found" }, { status: 404 });
  }

  const script = video.scriptJson as ScriptJson | null;
  const visuals = video.visualsJson as VisualsJson | null;

  if (!script?.scenes?.length) {
    return NextResponse.json(
      { error: "Video has no script — generate a script first" },
      { status: 400 },
    );
  }

  if (!video.audioPath) {
    return NextResponse.json(
      { error: "Video has no voiceover — generate voice first" },
      { status: 400 },
    );
  }

  if (!visuals?.scenes?.length) {
    return NextResponse.json(
      { error: "Video has no visuals — fetch scene clips first" },
      { status: 400 },
    );
  }

  await prisma.video.update({
    where: { id },
    data: {
      status: "RENDERING",
      errorMessage: null,
      renderStartedAt: new Date(),
      renderEndedAt: null,
    },
  });

  try {
    await clearRenderForVideo(id);

    const result = await renderVideoForVideo({
      videoId: id,
      nicheSlug: video.niche.slug,
      captionColor: video.niche.captionColor,
      audioPath: video.audioPath,
      script,
      visuals,
    });

    const updated = await prisma.video.update({
      where: { id },
      data: {
        videoPath: result.video_path,
        thumbnailPath: result.thumbnail_path,
        durationSeconds: result.duration_seconds,
        status: "READY",
        errorMessage: null,
        renderEndedAt: new Date(),
      },
    });

    return NextResponse.json({ video: updated, render: result });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Video render failed";

    await prisma.video.update({
      where: { id },
      data: {
        status: "FAILED",
        errorMessage: message,
        renderEndedAt: new Date(),
      },
    });

    console.error("Render pipeline error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
