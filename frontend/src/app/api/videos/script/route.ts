import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { generateScript } from "@/lib/pipeline/script-generation/script-generator";
import type { VideoLanguage } from "@/types/script";

function parseLanguage(value: unknown): VideoLanguage {
  if (value === "hindi" || value === "english") return value;
  return "nepali";
}

export async function POST(request: Request) {
  const { session, error } = await requireAuth();
  if (error) return error;

  let body: { nicheSlug?: string; topic?: string; language?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { nicheSlug, topic } = body;
  if (!nicheSlug || !topic?.trim()) {
    return NextResponse.json(
      { error: "nicheSlug and topic are required" },
      { status: 400 },
    );
  }

  const language = parseLanguage(body.language);

  const niche = await prisma.niche.findUnique({ where: { slug: nicheSlug } });
  if (!niche) {
    return NextResponse.json({ error: "Niche not found" }, { status: 404 });
  }

  const video = await prisma.video.create({
    data: {
      nicheId: niche.id,
      creatorId: session!.user!.id,
      status: "SCRIPTING",
      title: topic.trim().slice(0, 120),
    },
  });

  try {
    const script = await generateScript({
      niche: {
        systemPrompt: niche.systemPrompt,
        nameEn: niche.nameEn,
        defaultVoiceId: niche.defaultVoiceId,
      },
      topic: topic.trim(),
      language,
    });

    const durationSeconds = script.scenes.reduce(
      (sum, s) => sum + s.duration_seconds,
      0,
    );

    const updated = await prisma.video.update({
      where: { id: video.id },
      data: {
        title: script.title,
        scriptJson: script,
        durationSeconds,
        status: "PENDING",
        errorMessage: null,
      },
      include: {
        niche: {
          select: { slug: true, nameEn: true, nameNe: true, emoji: true, captionColor: true },
        },
      },
    });

    await prisma.topicIdea.updateMany({
      where: {
        nicheId: niche.id,
        title: { contains: topic.trim().slice(0, 40), mode: "insensitive" },
        isUsed: false,
      },
      data: { isUsed: true },
    });

    return NextResponse.json({ video: updated, script });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Script generation failed";

    await prisma.video.update({
      where: { id: video.id },
      data: { status: "FAILED", errorMessage: message },
    });

    console.error("Script generation error:", err);
    return NextResponse.json({ error: message, videoId: video.id }, { status: 500 });
  }
}
