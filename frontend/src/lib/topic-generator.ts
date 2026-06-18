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

const TOPIC_SYSTEM = `You are a viral short-form content strategist for Nepali and Hindi audiences on TikTok, Instagram Reels, and YouTube Shorts.

Return ONLY valid JSON — no markdown, no explanation.`;

function buildTopicUserPrompt(niche: NicheForTopics, language: VideoLanguage): string {
  return `Generate exactly 5 fresh video topic ideas for the "${niche.nameEn}" (${niche.nameNe}) niche.

Niche language default: ${niche.language}
Requested output language: ${language}
Content angle: ${niche.contentAngle}
Example hooks for tone reference:
${niche.exampleHooks.map((h) => `- ${h}`).join("\n")}

Requirements:
- Each topic must be specific to Nepal/India — real names, places, or cultural angles
- hookPreview is the opening hook sentence only (max 15 words)
- trendingScore is 1–100 (higher = more likely to go viral now)
- Topics must feel fresh — not generic motivational content

Return this exact JSON shape:
{
  "topics": [
    {
      "title": "short topic title",
      "hookPreview": "opening hook sentence",
      "language": "nepali or hindi or mixed",
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
