import fs from "node:fs/promises";
import path from "node:path";

export function outputRoot(): string {
  return process.env.VIDEO_OUTPUT_DIR ?? path.join(process.cwd(), "data", "outputs");
}

export function videoAbsolutePath(videoId: string): string {
  return path.join(outputRoot(), "video", `${videoId}.mp4`);
}

export function thumbnailAbsolutePath(videoId: string): string {
  return path.join(outputRoot(), "video", `${videoId}_thumb.jpg`);
}

export async function clearRenderForVideo(videoId: string): Promise<void> {
  await Promise.all([
    fs.rm(videoAbsolutePath(videoId), { force: true }),
    fs.rm(thumbnailAbsolutePath(videoId), { force: true }),
  ]);
}
