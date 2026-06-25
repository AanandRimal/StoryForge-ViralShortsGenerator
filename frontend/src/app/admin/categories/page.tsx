import { prisma } from "@/lib/prisma";
import { CategoriesClient } from "./categories-client";
import styles from "./categories.module.css";

export default async function AdminCategoriesPage() {
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
      voiceTone: true,
      _count: { select: { videos: true } },
    },
  });

  return (
    <div>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Categories</h1>
          <p className={styles.subtitle}>
            Toggle niches on/off. Active niches appear in the dashboard for all users.
          </p>
        </div>
      </div>

      <CategoriesClient niches={niches} />
    </div>
  );
}
