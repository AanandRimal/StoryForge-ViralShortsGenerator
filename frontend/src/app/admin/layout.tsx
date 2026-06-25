import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import styles from "./admin.module.css";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarBrand}>
          <Link href="/" className={styles.brandBack}>← StoryForge</Link>
          <span className={styles.adminLabel}>Admin Panel</span>
        </div>
        <nav className={styles.sidebarNav}>
          <Link href="/admin" className={styles.navItem}>Dashboard</Link>
          <Link href="/admin/users" className={styles.navItem}>Users</Link>
          <Link href="/admin/categories" className={styles.navItem}>Categories</Link>
          <Link href="/queue" className={styles.navItem}>All Videos</Link>
        </nav>
      </aside>
      <div className={styles.content}>{children}</div>
    </div>
  );
}
