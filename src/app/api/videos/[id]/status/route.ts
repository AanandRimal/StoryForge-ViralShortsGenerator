import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await params;

  const video = await prisma.video.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      title: true,
      audioPath: true,
      videoPath: true,
      voiceId: true,
      voiceProvider: true,
      errorMessage: true,
      durationSeconds: true,
      updatedAt: true,
    },
  });

  if (!video) {
    return NextResponse.json({ error: "Video not found" }, { status: 404 });
  }

  return NextResponse.json({ video });
}
