import { callLlm, extractJson } from "@/lib/llm";
import { ScriptJsonSchema, type ScriptJson, type VideoLanguage } from "@/types/script";

type NicheForScript = {
  systemPrompt: string;
  nameEn: string;
  defaultVoiceId: string;
};

export async function generateScript(params: {
  niche: NicheForScript;
  topic: string;
  language: VideoLanguage;
}): Promise<ScriptJson> {
  const { niche, topic, language } = params;

  const userMessage = `Write a complete 130–180 second viral short-form video script on this topic:

TOPIC: ${topic}
LANGUAGE: ${language} (use Nepali, Hindi)
NICHE: ${niche.nameEn}

Follow the script structure and JSON output format from your system instructions exactly.
Ensure that the "hashtags" array has at least 3 relevant hashtags.
Return ONLY the JSON object — no markdown fences, no explanation.`;

  const raw = await callLlm({
    system: niche.systemPrompt,
    user: userMessage,
    maxTokens: 4096,
  });

  const parsed = extractJson<Record<string, unknown>>(raw);
  if (typeof parsed.language === "string") {
    parsed.language = parsed.language.toLowerCase();
  }

  const script = ScriptJsonSchema.parse(parsed);

  const totalDuration = script.scenes.reduce((sum, s) => sum + s.duration_seconds, 0);
  if (totalDuration < 130 || totalDuration > 180) {
    // Allow slight variance; log but don't fail
    console.warn(`Script duration ${totalDuration}s outside 130–180s target`);
  }

  return script;
}
