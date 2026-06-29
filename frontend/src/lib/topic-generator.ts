import { callLlm, extractJson } from "@/lib/llm";
import { prisma } from "@/lib/prisma";
import {
  TopicSuggestionsSchema,
  type TopicSuggestion,
  type VideoLanguage,
} from "@/types/script";

type NicheForTopics = {
  id: string;
  nameEn: string;
  nameNe: string;
  language: string;
  contentAngle: string;
  exampleHooks: string[];
};

const TOPIC_SYSTEM = `You are a viral short-form content strategist for global audiences on TikTok, Instagram Reels, and YouTube Shorts.

Return ONLY valid JSON — no markdown, no explanation.`;

function buildTopicUserPrompt(niche: NicheForTopics, language: VideoLanguage): string {
  const langInstruction =
    language === "english"
      ? "Write topics and hooks entirely in English."
      : language === "hindi"
        ? "Write topics and hooks in Hindi."
        : language === "mixed"
          ? "Write topics in a natural mix of Nepali and Hindi (romanized or Devanagari)."
          : "Write topics and hooks in Nepali.";

  return `Generate exactly 5 fresh video topic ideas for the "${niche.nameEn}" (${niche.nameNe}) niche.

Niche language default: ${niche.language}
Requested output language: ${language}
${langInstruction}
Content angle: ${niche.contentAngle}
Example hooks for tone reference:
${niche.exampleHooks.map((h) => `- ${h}`).join("\n")}

Requirements:
- Each topic must be specific and culturally relevant
- hookPreview is the opening hook sentence only (max 15 words)
- trendingScore is 1–100 (higher = more likely to go viral now)
- Topics must feel fresh — not generic motivational content
- Set "language" field to "${language}" in every topic

Return this exact JSON shape:
{
  "topics": [
    {
      "title": "short topic title",
      "hookPreview": "opening hook sentence",
      "language": "${language}",
      "trendingScore": 85
    }
  ]
}`;
}

export async function generateTopicSuggestions(
  niche: NicheForTopics,
  language: VideoLanguage,
): Promise<TopicSuggestion[]> {
  const raw = await callLlm({
    system: TOPIC_SYSTEM,
    user: buildTopicUserPrompt(niche, language),
    maxTokens: 1024,
  });

  const parsed = TopicSuggestionsSchema.parse(extractJson(raw));
  return parsed.topics;
}

export async function getOrCreateTopicSuggestions(params: {
  niche: NicheForTopics;
  language: VideoLanguage;
  refresh?: boolean;
}): Promise<TopicSuggestion[]> {
  const { niche, language, refresh } = params;

  if (!refresh) {
    const cached = await prisma.topicIdea.findMany({
      where: { nicheId: niche.id, language, isUsed: false },
      orderBy: { trendingScore: "desc" },
      take: 5,
    });

    if (cached.length >= 5) {
      return cached.map((t) => ({
        title: t.title,
        hookPreview: t.hookPreview,
        language: t.language as VideoLanguage,
        trendingScore: t.trendingScore,
      }));
    }
  }

  const topics = await generateTopicSuggestions(niche, language);

  if (refresh) {
    await prisma.topicIdea.deleteMany({
      where: { nicheId: niche.id, language, isUsed: false },
    });
  }

  await prisma.topicIdea.createMany({
    data: topics.map((t) => ({
      nicheId: niche.id,
      title: t.title,
      hookPreview: t.hookPreview,
      language: t.language,
      trendingScore: t.trendingScore,
    })),
  });

  return topics;
}
