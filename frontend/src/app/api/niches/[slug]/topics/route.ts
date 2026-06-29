import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { getOrCreateTopicSuggestions } from "@/lib/topic-generator";
import type { VideoLanguage } from "@/types/script";

function parseLanguage(value: string | null): VideoLanguage {
  if (value === "hindi" || value === "english" || value === "mixed") return value;
  return "nepali";
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { slug } = await params;
  const { searchParams } = new URL(request.url);
  const language = parseLanguage(searchParams.get("language"));
  const refresh = searchParams.get("refresh") === "true";

  const niche = await prisma.niche.findUnique({ where: { slug } });
  if (!niche) {
    return NextResponse.json({ error: "Niche not found" }, { status: 404 });
  }

  try {
    const topics = await getOrCreateTopicSuggestions({
      niche: {
        id: niche.id,
        nameEn: niche.nameEn,
        nameNe: niche.nameNe,
        language: niche.language,
        contentAngle: niche.contentAngle,
        exampleHooks: niche.exampleHooks,
      },
      language,
      refresh,
    });

    return NextResponse.json({ topics, niche: { slug: niche.slug, nameEn: niche.nameEn } });
  } catch (err) {
    console.error("Topics API error:", err);
    const message = err instanceof Error ? err.message : "Failed to generate topics";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { error } = await requireAuth();
  if (error) return error;

  const { slug } = await params;
  let language: VideoLanguage = "nepali";

  try {
    const body = await request.json();
    if (body.language) language = parseLanguage(body.language);
  } catch {
    // default language
  }

  const niche = await prisma.niche.findUnique({ where: { slug } });
  if (!niche) {
    return NextResponse.json({ error: "Niche not found" }, { status: 404 });
  }

  try {
    const topics = await getOrCreateTopicSuggestions({
      niche: {
        id: niche.id,
        nameEn: niche.nameEn,
        nameNe: niche.nameNe,
        language: niche.language,
        contentAngle: niche.contentAngle,
        exampleHooks: niche.exampleHooks,
      },
      language,
      refresh: true,
    });

    return NextResponse.json({ topics, niche: { slug: niche.slug, nameEn: niche.nameEn } });
  } catch (err) {
    console.error("Topics API error:", err);
    const message = err instanceof Error ? err.message : "Failed to generate topics";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
