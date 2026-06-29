import { NextResponse } from "next/server";
import fs from "node:fs";
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
    select: { videoPath: true },
  });

  if (!video?.videoPath) {
    return NextResponse.json({ error: "Video not rendered yet" }, { status: 404 });
  }

  try {
    const stat = fs.statSync(video.videoPath);
    const nodeStream = fs.createReadStream(video.videoPath);
    const webStream = new ReadableStream({
      start(controller) {
        nodeStream.on("data", (chunk) => controller.enqueue(chunk));
        nodeStream.on("end", () => controller.close());
        nodeStream.on("error", (err) => controller.error(err));
      },
    });

    return new Response(webStream, {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Length": String(stat.size),
        "Accept-Ranges": "bytes",
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "Video file not found" }, { status: 404 });
  }
}
