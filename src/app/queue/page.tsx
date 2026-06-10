import { AppHeader } from "@/components/layout/AppHeader";
import styles from "../placeholder.module.css";

export default function QueuePage() {
  return (
    <>
      <AppHeader />
      <main className={styles.main}>
        <h1>Video Queue</h1>
        <p className={styles.comingSoon}>
          Filter, sort, and manage all generated videos. Coming in Phase 2+.
        </p>
      </main>
    </>
  );
}
