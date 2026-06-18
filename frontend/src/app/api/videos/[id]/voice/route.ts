import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { generateVoiceAudio } from "@/lib/pipeline/audio-generation/voice-engine";
import { defaultVoiceForLanguage } from "@/lib/voices";
import type { ScriptJson } from "@/types/script";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const voiceIdOverride = body.voiceId as string | undefined;

  const video = await prisma.video.findUnique({
    where: { id },
    include: { niche: true },
  });

  if (!video) {
    return NextResponse.json({ error: "Video not found" }, { status: 404 });
  }

  const script = video.scriptJson as ScriptJson | null;
  if (!script?.full_script) {
    return NextResponse.json(
      { error: "Video has no script — generate a script first" },
      { status: 400 },
    );
  }

  const voiceId =
    voiceIdOverride ??
    video.voiceId ??
    defaultVoiceForLanguage(script.language, video.niche.defaultVoiceId);

  await prisma.video.update({
    where: { id },
    data: { status: "VOICING", errorMessage: null, voiceId },
  });

  try {
    const { audioPath, provider } = await generateVoiceAudio({
      videoId: id,
      text: script.full_script,
      voiceId,
    });

    const updated = await prisma.video.update({
      where: { id },
      data: {
        audioPath,
        voiceId,
        voiceProvider: provider,
        status: "PENDING",
        errorMessage: null,
      },
    });

    return NextResponse.json({
      video: updated,
      provider,
      audioUrl: audioPath,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Voice generation failed";

    await prisma.video.update({
      where: { id },
      data: { status: "FAILED", errorMessage: message },
    });

    console.error("Voice generation error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
