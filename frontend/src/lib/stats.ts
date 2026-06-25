import { prisma } from "@/lib/prisma";

export async function getDashboardStats(userId?: string) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const userFilter = userId ? { creatorId: userId } : {};

  const [videosToday, totalPublished, viewAggregate, queueDepth] =
    await Promise.all([
      prisma.video.count({
        where: { ...userFilter, createdAt: { gte: startOfDay } },
      }),
      prisma.video.count({
        where: { ...userFilter, status: "PUBLISHED" },
      }),
      prisma.publishedVideo.aggregate({
        _sum: { views: true },
        ...(userId
          ? { where: { video: { creatorId: userId } } }
          : {}),
      }),
      prisma.video.count({
        where: {
          ...userFilter,
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
