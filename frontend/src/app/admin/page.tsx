import { prisma } from "@/lib/prisma";
import { getDashboardStats } from "@/lib/stats";
import styles from "./admin-page.module.css";

export default async function AdminDashboard() {
  const [stats, userCount, nicheCount, recentUsers] = await Promise.all([
    getDashboardStats(),
    prisma.user.count(),
    prisma.niche.count({ where: { isActive: true } }),
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: { select: { videos: true } },
      },
    }),
  ]);

  return (
    <div>
      <h1 className={styles.title}>Admin Dashboard</h1>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{userCount}</span>
          <span className={styles.statLabel}>Registered Users</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{nicheCount}</span>
          <span className={styles.statLabel}>Active Categories</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{stats.videosToday}</span>
          <span className={styles.statLabel}>Videos Today</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{stats.totalPublished}</span>
          <span className={styles.statLabel}>Total Published</span>
        </div>
      </div>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Recent Users</h2>
          <a href="/admin/users" className={styles.seeAll}>See all →</a>
        </div>
        <div className={styles.table}>
          {recentUsers.map((user) => (
            <div key={user.id} className={styles.tableRow}>
              <div>
                <p className={styles.userName}>{user.name}</p>
                <p className={styles.userEmail}>{user.email}</p>
              </div>
              <span className={`${styles.roleBadge} ${user.role === "ADMIN" ? styles.roleAdmin : styles.roleEditor}`}>
                {user.role}
              </span>
              <span className={styles.videoCount}>{user._count.videos} videos</span>
              <span className={styles.date}>
                {new Date(user.createdAt).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
