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

  const langLabel =
    language === "nepali"
      ? "Nepali (Devanagari script)"
      : language === "hindi"
        ? "Hindi (Devanagari script)"
        : language === "english"
          ? "English"
          : "a natural mix of Nepali and Hindi (Devanagari script)";

  const userMessage = `Write a COMPLETE, DENSE 130–160 second viral short-form video script on this topic:

TOPIC: "${topic}"
LANGUAGE: ${language} — write ALL narration in ${langLabel}
NICHE: ${niche.nameEn}

CRITICAL REQUIREMENTS — you will be penalized for violating these:
1. Every scene "text" must be 25–55 words. Never a single short sentence.
2. Never repeat content between scenes. Each scene must add NEW information.
3. Include at least 5 real, specific facts: named people, real companies, actual rupee/dollar amounts, specific years, verifiable events.
4. Scenes 5–11 (THE REVELATION) must be information-dense — the viewer should feel they learned something real.
5. "full_script" must be all scene texts joined in order — this goes straight to text-to-speech.
6. Include at least 4 hashtags in the "hashtags" array.
7. Total 12–14 scenes. Total duration 130–160 seconds.

Return ONLY the JSON object — no markdown fences, no explanation text, no commentary.`;

  const raw = await callLlm({
    system: niche.systemPrompt,
    user: userMessage,
    maxTokens: 8192,
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
