import { prisma } from "@/lib/prisma";

export async function getDashboardStats() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [videosToday, totalPublished, viewAggregate, queueDepth] =
    await Promise.all([
      prisma.video.count({
        where: { createdAt: { gte: startOfDay } },
      }),
      prisma.video.count({
        where: { status: "PUBLISHED" },
      }),
      prisma.publishedVideo.aggregate({
        _sum: { views: true },
      }),
      prisma.video.count({
        where: {
          status: {
            in: [
              "PENDING",
              "SCRIPTING",
              "VOICING",
              "FETCHING_VISUALS",
              "RENDERING",
              "PUBLISHING",
            ],
          },
        },
      }),
    ]);

  return {
    videosToday,
    totalPublished,
    totalViews: viewAggregate._sum.views ?? 0,
    queueDepth,
  };
}
