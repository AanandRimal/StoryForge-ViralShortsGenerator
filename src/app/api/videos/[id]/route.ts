import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { generateScript } from "@/lib/script-generator";
import type { ScriptJson, VideoLanguage } from "@/types/script";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error } = await requireAuth();
  if (error) return error;

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
          language: true,
        },
      },
      creator: { select: { name: true, email: true } },
    },
  });

  if (!video) {
    return NextResponse.json({ error: "Video not found" }, { status: 404 });
  }

  return NextResponse.json({ video });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const action = body.action as string | undefined;

  if (action !== "regenerate-script") {
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }

  const video = await prisma.video.findUnique({
    where: { id },
    include: { niche: true },
  });

  if (!video) {
    return NextResponse.json({ error: "Video not found" }, { status: 404 });
  }

  const existingScript = video.scriptJson as ScriptJson | null;
  const topic = body.topic ?? video.title ?? "Regenerate script";
  const language = (body.language ?? existingScript?.language ?? video.niche.language) as VideoLanguage;

  await prisma.video.update({
    where: { id },
    data: { status: "SCRIPTING", errorMessage: null },
  });

  try {
    const script = await generateScript({
      niche: {
        systemPrompt: video.niche.systemPrompt,
        nameEn: video.niche.nameEn,
        defaultVoiceId: video.niche.defaultVoiceId,
      },
      topic,
      language,
    });

    const durationSeconds = script.scenes.reduce((sum, s) => sum + s.duration_seconds, 0);

    const updated = await prisma.video.update({
      where: { id },
      data: {
        title: script.title,
        scriptJson: script,
        durationSeconds,
        status: "PENDING",
        audioPath: null,
        voiceId: null,
        voiceProvider: null,
      },
      include: {
        niche: {
          select: { slug: true, nameEn: true, nameNe: true, emoji: true, captionColor: true },
        },
      },
    });

    return NextResponse.json({ video: updated, script });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Script regeneration failed";
    await prisma.video.update({
      where: { id },
      data: { status: "FAILED", errorMessage: message },
    });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
