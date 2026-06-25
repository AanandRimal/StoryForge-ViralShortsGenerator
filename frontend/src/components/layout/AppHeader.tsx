import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import styles from "./AppHeader.module.css";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/queue", label: "Queue" },
  { href: "/connections", label: "Connections" },
  { href: "/analytics", label: "Analytics" },
];

export async function AppHeader() {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand}>
          <span className={styles.brandIcon}>⚡</span>
          <span className={styles.brandText}>
            Story<span className={styles.brandAccent}>Forge</span>
          </span>
        </Link>

        <nav className={styles.nav}>
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} className={styles.navLink}>
              {item.label}
            </Link>
          ))}
          {isAdmin && (
            <Link href="/admin" className={styles.adminLink}>
              Admin
            </Link>
          )}
        </nav>

        <div className={styles.userArea}>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{session?.user?.name}</span>
            {isAdmin && <span className={styles.adminBadge}>Admin</span>}
          </div>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button type="submit" className={styles.signOutBtn}>
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
