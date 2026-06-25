import { TextToSpeechClient } from "@google-cloud/text-to-speech";
import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { outputRoot } from "@/lib/render-storage";

const SPEAKING_RATE = 0.9;

export function audioAbsolutePath(videoId: string): string {
  return path.join(outputRoot(), "audio", `${videoId}.mp3`);
}

function languageCode(voiceId: string): string {
  const parts = voiceId.split("-");
  return parts.length >= 2 ? `${parts[0]}-${parts[1]}` : "ne-NP";
}

async function synthesizeGoogle(
  text: string,
  voiceId: string,
  outputPath: string,
): Promise<void> {
  const creds = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!creds) {
    throw new Error("GOOGLE_APPLICATION_CREDENTIALS is not set");
  }

  const client = new TextToSpeechClient();
  const [response] = await client.synthesizeSpeech({
    input: { text },
    voice: { languageCode: languageCode(voiceId), name: voiceId },
    audioConfig: {
      audioEncoding: "MP3",
      speakingRate: SPEAKING_RATE,
    },
  });

  if (!response.audioContent) {
    throw new Error("Google TTS returned empty audio");
  }

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  const content =
    typeof response.audioContent === "string"
      ? Buffer.from(response.audioContent, "base64")
      : Buffer.from(response.audioContent);
  await fs.writeFile(outputPath, content);
}

async function synthesizeEdgeFallback(
  text: string,
  voiceId: string,
  outputPath: string,
): Promise<void> {
  const python = process.env.WORKER_PYTHON;
  const script = process.env.WORKER_SCRIPT;
  if (!python || !script) {
    throw new Error("WORKER_PYTHON and WORKER_SCRIPT required for edge-tts fallback");
  }

  const payload = JSON.stringify({
    text,
    voice_id: voiceId,
    output_path: outputPath,
    speaking_rate: SPEAKING_RATE,
    edge_only: true,
  });

  await new Promise<void>((resolve, reject) => {
    const proc = spawn(python, [script], {
      env: process.env,
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stderr = "";
    proc.stderr.on("data", (c: Buffer) => {
      stderr += c.toString();
    });
    proc.on("error", reject);
    proc.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(stderr.trim() || `Edge TTS worker exited with code ${code}`));
      } else {
        resolve();
      }
    });
    proc.stdin.write(payload);
    proc.stdin.end();
  });
}

export async function generateVoiceAudio(params: {
  videoId: string;
  text: string;
  voiceId: string;
}): Promise<{ audioPath: string; provider: string }> {
  const absPath = audioAbsolutePath(params.videoId);
  await fs.mkdir(path.dirname(absPath), { recursive: true });

  try {
    await synthesizeGoogle(params.text, params.voiceId, absPath);
    return { audioPath: absPath, provider: "google" };
  } catch (googleErr) {
    console.warn("Google TTS failed, trying edge-tts fallback:", googleErr);
    await synthesizeEdgeFallback(params.text, params.voiceId, absPath);
    return { audioPath: absPath, provider: "edge" };
  }
}
