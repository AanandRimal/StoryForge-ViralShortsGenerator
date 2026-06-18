import type { ScriptJson } from "@/types/script";
import type { VisualsJson, VisualStyle } from "@/types/visuals";

async function runVisualWorker(payload: string): Promise<string> {
  const python = process.env.WORKER_PYTHON;
  const script = process.env.WORKER_VISUAL_SCRIPT;
  if (!python || !script) {
    throw new Error("WORKER_PYTHON and WORKER_VISUAL_SCRIPT are required");
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
        reject(new Error(stderr.trim() || `Visual worker exited with code ${code}`));
        return;
      }
      resolve(out);
    });

    proc.stdin.write(payload);
    proc.stdin.end();
  });
}

export async function fetchVisualsForVideo(params: {
  videoId: string;
  nicheSlug: string;
  script: ScriptJson;
  style?: VisualStyle;
}): Promise<VisualsJson> {
  const style = params.style ?? "PEXELS";
  const payload = JSON.stringify({
    video_id: params.videoId,
    niche_slug: params.nicheSlug,
    style,
    scenes: params.script.scenes,
  });

  const stdout = await runVisualWorker(payload);
  const lastLine = stdout.trim().split("\n").pop() ?? "";
  return JSON.parse(lastLine) as VisualsJson;
}
