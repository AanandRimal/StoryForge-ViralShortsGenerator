import { AppHeader } from "@/components/layout/AppHeader";
import styles from "../placeholder.module.css";

export default function AnalyticsPage() {
  return (
    <>
      <AppHeader />
      <main className={styles.main}>
        <h1>Analytics</h1>
        <p className={styles.comingSoon}>
          Views, niche performance, and publishing streaks. Coming in Phase 7.
        </p>
      </main>
    </>
  );
}
