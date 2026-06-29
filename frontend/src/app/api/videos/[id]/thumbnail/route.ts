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
    select: { thumbnailPath: true },
  });

  if (!video?.thumbnailPath) {
    return NextResponse.json({ error: "Thumbnail not available" }, { status: 404 });
  }

  try {
    const stat = fs.statSync(video.thumbnailPath);
    const nodeStream = fs.createReadStream(video.thumbnailPath);
    const webStream = new ReadableStream({
      start(controller) {
        nodeStream.on("data", (chunk) => controller.enqueue(chunk));
        nodeStream.on("end", () => controller.close());
        nodeStream.on("error", (err) => controller.error(err));
      },
    });

    return new Response(webStream, {
      headers: {
        "Content-Type": "image/jpeg",
        "Content-Length": String(stat.size),
        "Cache-Control": "private, max-age=86400",
      },
    });
  } catch {
    return NextResponse.json({ error: "Thumbnail file not found" }, { status: 404 });
  }
}
