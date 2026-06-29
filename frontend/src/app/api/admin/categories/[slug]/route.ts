import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-admin";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { slug } = await params;
  let body: { isActive?: boolean; sortOrder?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const niche = await prisma.niche.update({
    where: { slug },
    data: {
      ...(typeof body.isActive === "boolean" ? { isActive: body.isActive } : {}),
      ...(typeof body.sortOrder === "number" ? { sortOrder: body.sortOrder } : {}),
    },
    select: { slug: true, nameEn: true, isActive: true, sortOrder: true },
  });

  return NextResponse.json({ niche });
}
