import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-admin";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const niches = await prisma.niche.findMany({
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      slug: true,
      nameEn: true,
      nameNe: true,
      emoji: true,
      language: true,
      isActive: true,
      sortOrder: true,
      _count: { select: { videos: true } },
    },
  });

  return NextResponse.json({ niches });
}
