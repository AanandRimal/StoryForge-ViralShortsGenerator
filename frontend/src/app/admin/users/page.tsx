import Link from "next/link";
import { prisma } from "@/lib/prisma";
import styles from "./users.module.css";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: { select: { videos: true } },
    },
  });

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Users</h1>
        <Link href="/admin/users/new" className={styles.addBtn}>
          + Add User
        </Link>
      </div>

      <div className={styles.table}>
        <div className={styles.tableHeader}>
          <span>Name / Email</span>
          <span>Role</span>
          <span>Videos</span>
          <span>Joined</span>
          <span>Actions</span>
        </div>
        {users.map((user) => (
          <div key={user.id} className={styles.row}>
            <div>
              <p className={styles.name}>{user.name}</p>
              <p className={styles.email}>{user.email}</p>
            </div>
            <span
              className={`${styles.roleBadge} ${
                user.role === "ADMIN" ? styles.roleAdmin : styles.roleEditor
              }`}
            >
              {user.role}
            </span>
            <span className={styles.count}>{user._count.videos}</span>
            <span className={styles.date}>
              {new Date(user.createdAt).toLocaleDateString()}
            </span>
            <Link
              href={`/queue?creator=${user.id}`}
              className={styles.viewLink}
            >
              View videos →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
