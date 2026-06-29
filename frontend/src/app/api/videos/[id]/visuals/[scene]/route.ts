import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { requireAuth } from "@/lib/api-auth";
import { visualsDir } from "@/lib/visual-storage";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; scene: string }> },
) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id, scene } = await params;

  // Only allow safe filenames — no path traversal
  if (!/^[\w.-]+\.mp4$/i.test(scene)) {
    return NextResponse.json({ error: "Invalid scene name" }, { status: 400 });
  }

  const filePath = path.join(visualsDir(id), scene);

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "Clip not found" }, { status: 404 });
  }

  const stat = fs.statSync(filePath);
  const nodeStream = fs.createReadStream(filePath);
  const webStream = new ReadableStream({
    start(controller) {
      nodeStream.on("data", (chunk) => controller.enqueue(chunk));
      nodeStream.on("end", () => controller.close());
      nodeStream.on("error", (err) => controller.error(err));
    },
    cancel() {
      nodeStream.destroy();
    },
  });

  return new Response(webStream, {
    headers: {
      "Content-Type": "video/mp4",
      "Content-Length": stat.size.toString(),
      "Cache-Control": "private, max-age=3600",
    },
  });
}
