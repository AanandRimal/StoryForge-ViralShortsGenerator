"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./AppHeader.module.css";

const NAV_ITEMS = [
  { href: "/", label: "Home", exact: true },
  { href: "/queue", label: "Queue", exact: false },
  { href: "/connections", label: "Connections", exact: false },
  { href: "/analytics", label: "Analytics", exact: false },
];

export function NavLinks({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();

  function isActive(href: string, exact: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <nav className={styles.nav}>
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`${styles.navLink} ${isActive(item.href, item.exact) ? styles.navLinkActive : ""}`}
        >
          {item.label}
        </Link>
      ))}
      {isAdmin && (
        <Link
          href="/admin"
          className={`${styles.navLink} ${styles.navLinkAdmin} ${pathname?.startsWith("/admin") ? styles.navLinkActive : ""}`}
        >
          Admin
        </Link>
      )}
    </nav>
  );
}
