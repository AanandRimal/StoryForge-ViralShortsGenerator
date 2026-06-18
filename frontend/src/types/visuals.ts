 
 import { z } from "zod";

export const SceneVisualSchema = z.object({
  scene_number: z.number().int().positive(),
  keyword: z.string(),
  search_query: z.string(),
  source: z.enum(["pexels", "replicate"]),
  clip_path: z.string(),
  duration_seconds: z.number(),
  pexels_id: z.number().optional(),
});

export const VisualsJsonSchema = z.object({
  style: z.enum(["PEXELS", "MIXED", "AI"]),
  fetched_at: z.string(),
  scenes: z.array(SceneVisualSchema).min(1),
});

export type SceneVisual = z.infer<typeof SceneVisualSchema>;
export type VisualsJson = z.infer<typeof VisualsJsonSchema>;

export type VisualStyle = "PEXELS" | "MIXED" | "AI";
