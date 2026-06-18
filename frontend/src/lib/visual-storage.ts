import fs from "node:fs/promises";
import path from "node:path";

function outputRoot(): string {
  return (
    process.env.VIDEO_OUTPUT_DIR ?? path.join(process.cwd(), "public", "outputs")
  );
}

export function visualsDir(videoId: string): string {
  return path.join(outputRoot(), "visuals", videoId);
}

export function sceneClipPublicPath(videoId: string, sceneNumber: number): string {
  const padded = String(sceneNumber).padStart(2, "0");
  return `/outputs/visuals/${videoId}/scene_${padded}.mp4`;
}

export async function clearVisualsForVideo(videoId: string): Promise<void> {
  await fs.rm(visualsDir(videoId), { recursive: true, force: true });
}
