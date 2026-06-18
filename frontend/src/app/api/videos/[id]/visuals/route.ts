import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { fetchVisualsForVideo } from "@/lib/pipelines/visuals/visual-pipeline";
import { clearVisualsForVideo } from "@/lib/visual-storage";
import type { ScriptJson } from "@/types/script";
import type { VisualStyle } from "@/types/visuals";

function parseStyle(value: unknown): VisualStyle {
  if (value === "MIXED" || value === "AI") return value;
  return "PEXELS";
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const style = parseStyle(body.style);

  const video = await prisma.video.findUnique({
    where: { id },
    include: { niche: true },
  });

  if (!video) {
    return NextResponse.json({ error: "Video not found" }, { status: 404 });
  }

  const script = video.scriptJson as ScriptJson | null;
  if (!script?.scenes?.length) {
    return NextResponse.json(
      { error: "Video has no script — generate a script first" },
      { status: 400 },
    );
  }

  await prisma.video.update({
    where: { id },
    data: { status: "FETCHING_VISUALS", errorMessage: null, visualStyle: style },
  });

  try {
    await clearVisualsForVideo(id);

    const visuals = await fetchVisualsForVideo({
      videoId: id,
      nicheSlug: video.niche.slug,
      script,
      style,
    });

    const updated = await prisma.video.update({
      where: { id },
      data: {
        visualsJson: visuals,
        visualStyle: style,
        status: "PENDING",
        errorMessage: null,
      },
    });

    return NextResponse.json({ video: updated, visuals });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Visual pipeline failed";

    await prisma.video.update({
      where: { id },
      data: { status: "FAILED", errorMessage: message },
    });

    console.error("Visual pipeline error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
