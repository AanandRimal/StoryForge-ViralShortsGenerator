import { AppHeader } from "@/components/layout/AppHeader";
import styles from "../placeholder.module.css";

export default function ConnectionsPage() {
  return (
    <>
      <AppHeader />
      <main className={styles.main}>
        <h1>Platform Connections</h1>
        <p className={styles.comingSoon}>
          Connect TikTok, Instagram, YouTube, and Facebook. Coming in Phase 6.
        </p>
      </main>
    </>
  );
}
