import fs from "node:fs/promises";
import path from "node:path";
import { outputRoot } from "./render-storage";

export function visualsDir(videoId: string): string {
  return path.join(outputRoot(), "visuals", videoId);
}

export async function clearVisualsForVideo(videoId: string): Promise<void> {
  await fs.rm(visualsDir(videoId), { recursive: true, force: true });
}
