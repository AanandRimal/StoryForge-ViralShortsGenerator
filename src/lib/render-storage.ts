import fs from "node:fs/promises";
import path from "node:path";

function outputRoot(): string {
  return (
    process.env.VIDEO_OUTPUT_DIR ?? path.join(process.cwd(), "public", "outputs")
  );
}

export function videoPublicPath(videoId: string): string {
  return `/outputs/video/${videoId}.mp4`;
}

export function thumbnailPublicPath(videoId: string): string {
  return `/outputs/video/${videoId}_thumb.jpg`;
}

export function videoAbsolutePath(videoId: string): string {
  return path.join(outputRoot(), "video", `${videoId}.mp4`);
}

export async function clearRenderForVideo(videoId: string): Promise<void> {
  await Promise.all([
    fs.rm(videoAbsolutePath(videoId), { force: true }),
    fs.rm(
      path.join(outputRoot(), "video", `${videoId}_thumb.jpg`),
      { force: true },
    ),
  ]);
}
