import { z } from "zod";

export const SceneSchema = z.object({
  scene_number: z.number().int().positive(),
  text: z.string().min(1),
  visual_keyword: z.string().min(1),
  duration_seconds: z.number().min(5).max(12),
});

export const ScriptJsonSchema = z.object({
  title: z.string().min(1).max(120),
  hook: z.string().min(1),
  language: z.enum(["nepali", "hindi", "english"]),
  scenes: z.array(SceneSchema).min(5).max(12),
  full_script: z.string().min(1),
  cta: z.string().min(1),
  hashtags: z.array(z.string()).min(3).max(15),
  thumbnail_text: z.string().min(1).max(60),
});

export type ScriptJson = z.infer<typeof ScriptJsonSchema>;
export type ScriptScene = z.infer<typeof SceneSchema>;

export const TopicSuggestionSchema = z.object({
  title: z.string().min(1),
  hookPreview: z.string().min(1),
  language: z.enum(["nepali", "hindi", "english"]),
  trendingScore: z.number().min(0).max(100),
});

export const TopicSuggestionsSchema = z.object({
  topics: z.array(TopicSuggestionSchema).length(5),
});

export type TopicSuggestion = z.infer<typeof TopicSuggestionSchema>;

export type VideoLanguage = "nepali" | "hindi" | "english";
