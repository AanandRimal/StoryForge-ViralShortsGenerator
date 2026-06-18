import type { ScriptJson } from "@/types/script";
import type { VisualsJson } from "@/types/visuals";

export type RenderResult = {
  video_path: string;
  thumbnail_path: string;
  duration_seconds: number;
};

async function runRenderWorker(payload: string): Promise<string> {
  const python = process.env.WORKER_PYTHON;
  const script = process.env.WORKER_RENDER_SCRIPT;
  if (!python || !script) {
    throw new Error("WORKER_PYTHON and WORKER_RENDER_SCRIPT are required");
  }

  const { spawn } = await import("node:child_process");

  return new Promise<string>((resolve, reject) => {
    const proc = spawn(python, [script], {
      env: process.env,
      stdio: ["pipe", "pipe", "pipe"],
    });

    let out = "";
    let stderr = "";

    proc.stdout.on("data", (chunk: Buffer) => {
      out += chunk.toString();
    });
    proc.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });

    proc.on("error", reject);
    proc.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(stderr.trim() || `Render worker exited with code ${code}`));
        return;
      }
      resolve(out);
    });

    proc.stdin.write(payload);
    proc.stdin.end();
  });
}

export async function renderVideoForVideo(params: {
  videoId: string;
  nicheSlug: string;
  captionColor: string;
  audioPath: string;
  script: ScriptJson;
  visuals: VisualsJson;
}): Promise<RenderResult> {
  const payload = JSON.stringify({
    video_id: params.videoId,
    niche_slug: params.nicheSlug,
    caption_color: params.captionColor,
    audio_path: params.audioPath,
    script_scenes: params.script.scenes,
    visual_scenes: params.visuals.scenes,
  });

  const stdout = await runRenderWorker(payload);
  const lastLine = stdout.trim().split("\n").pop() ?? "";
  return JSON.parse(lastLine) as RenderResult;
}
