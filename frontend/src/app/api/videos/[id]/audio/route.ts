import { NextResponse } from "next/server";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { requireAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { outputRoot } from "@/lib/render-storage";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await params;

  const video = await prisma.video.findUnique({
    where: { id },
    select: { audioPath: true },
  });

  if (!video?.audioPath) {
    return NextResponse.json({ error: "Audio not generated yet" }, { status: 404 });
  }

  try {
    const stat = fs.statSync(video.audioPath);
    const ext = path.extname(video.audioPath).toLowerCase();
    const contentType =
      ext === ".wav" ? "audio/wav"
      : ext === ".m4a" ? "audio/mp4"
      : ext === ".webm" ? "audio/webm"
      : "audio/mpeg";

    const nodeStream = fs.createReadStream(video.audioPath);
    const webStream = new ReadableStream({
      start(controller) {
        nodeStream.on("data", (chunk) => controller.enqueue(chunk));
        nodeStream.on("end", () => controller.close());
        nodeStream.on("error", (err) => controller.error(err));
      },
    });

    return new Response(webStream, {
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(stat.size),
        "Accept-Ranges": "bytes",
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "Audio file not found" }, { status: 404 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { id } = await params;

  const video = await prisma.video.findUnique({
    where: { id },
    select: { id: true, creatorId: true },
  });

  if (!video) {
    return NextResponse.json({ error: "Video not found" }, { status: 404 });
  }

  if (video.creatorId !== session?.user?.id && session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("audio");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
  }

  const allowed = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/mp4", "audio/m4a", "audio/webm", "audio/ogg"];
  if (!allowed.includes(file.type) && !file.name.match(/\.(mp3|wav|m4a|webm|ogg)$/i)) {
    return NextResponse.json({ error: "Unsupported audio format" }, { status: 400 });
  }

  const ext = file.name.match(/\.(mp3|wav|m4a|webm|ogg)$/i)?.[1]?.toLowerCase() ?? "mp3";
  const audioDir = path.join(outputRoot(), "audio");
  await fsp.mkdir(audioDir, { recursive: true });

  const absPath = path.join(audioDir, `${id}_custom.${ext}`);
  const buffer = Buffer.from(await file.arrayBuffer());
  await fsp.writeFile(absPath, buffer);

  await prisma.video.update({
    where: { id },
    data: {
      audioPath: absPath,
      voiceId: "custom",
      voiceProvider: "custom",
    },
  });

  return NextResponse.json({ audioUrl: `/api/videos/${id}/audio` });
}
