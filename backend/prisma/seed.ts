import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../../frontend/src/generated/prisma/client";
import { dbAdapter } from "../../frontend/src/lib/db";
import { buildSystemPrompt, NICHES } from "./niches-data";

const prisma = new PrismaClient({ adapter: dbAdapter });

async function main() {
  const passwordHash = await bcrypt.hash("storyforge2024", 12);

  await prisma.user.upsert({
    where: { email: "admin@storyforge.local" },
    update: {},
    create: {
      email: "admin@storyforge.local",
      name: "StoryForge Admin",
      passwordHash,
      role: "ADMIN",
    },
  });

  for (const [index, niche] of NICHES.entries()) {
    await prisma.niche.upsert({
      where: { slug: niche.slug },
      update: {
        nameEn: niche.nameEn,
        nameNe: niche.nameNe,
        emoji: niche.emoji,
        language: niche.language,
        psychologicalTrigger: niche.psychologicalTrigger,
        targetEmotion: niche.targetEmotion,
        contentAngle: niche.contentAngle,
        pexelsKeywords: niche.pexelsKeywords,
        captionColor: niche.captionColor,
        voiceTone: niche.voiceTone,
        defaultVoiceId: niche.defaultVoiceId,
        systemPrompt: buildSystemPrompt(niche),
        exampleHooks: niche.exampleHooks,
        sortOrder: index + 1,
        isActive: true,
      },
      create: {
        slug: niche.slug,
        nameEn: niche.nameEn,
        nameNe: niche.nameNe,
        emoji: niche.emoji,
        language: niche.language,
        psychologicalTrigger: niche.psychologicalTrigger,
        targetEmotion: niche.targetEmotion,
        contentAngle: niche.contentAngle,
        pexelsKeywords: niche.pexelsKeywords,
        captionColor: niche.captionColor,
        voiceTone: niche.voiceTone,
        defaultVoiceId: niche.defaultVoiceId,
        systemPrompt: buildSystemPrompt(niche),
        exampleHooks: niche.exampleHooks,
        sortOrder: index + 1,
        isActive: true,
      },
    });
  }

  console.log(`Seeded ${NICHES.length} niches and admin user (admin@storyforge.local)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
