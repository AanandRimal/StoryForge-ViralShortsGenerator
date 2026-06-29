import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { NavLinks } from "./NavLinks";
import styles from "./AppHeader.module.css";

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("");
}

export async function AppHeader() {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";
  const userName = session?.user?.name ?? "";
  const initials = getInitials(userName);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand}>
          <span className={styles.brandMark}>⚡</span>
          <span className={styles.brandWord}>
            Story<span className={styles.brandAccent}>Forge</span>
          </span>
        </Link>

        <NavLinks isAdmin={isAdmin} />

        <div className={styles.userArea}>
          {initials && (
            <div className={styles.avatar} title={userName}>
              {initials}
            </div>
          )}
          <div className={styles.userMeta}>
            <span className={styles.userName}>{userName}</span>
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
