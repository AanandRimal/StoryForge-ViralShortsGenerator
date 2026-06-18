import { NicheCard, type NicheCardData } from "./NicheCard";
import styles from "./NicheGrid.module.css";

export function NicheGrid({ niches }: { niches: NicheCardData[] }) {
  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>Choose Your Niche</h2>
        <p className={styles.subtitle}>
          15 psychologically-tuned content angles for Nepali &amp; Hindi audiences
        </p>
      </div>
      <div className={styles.grid}>
        {niches.map((niche, i) => (
          <div key={niche.id} style={{ animationDelay: `${i * 0.04}s` }}>
            <NicheCard niche={niche} />
          </div>
        ))}
      </div>
    </section>
  );
}
