import { NicheCard, type NicheCardData } from "./NicheCard";
import styles from "./NicheGrid.module.css";

export function NicheGrid({ niches }: { niches: NicheCardData[] }) {
  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <p className={styles.eyebrow}>Content Categories</p>
        <h2 className={styles.title}>Choose Your Niche</h2>
        <p className={styles.subtitle}>
          Psychologically-tuned content angles for Nepali, Hindi &amp; English audiences
        </p>
      </div>
      <div className={styles.grid}>
        {niches.map((niche) => (
          <NicheCard key={niche.id} niche={niche} />
        ))}
      </div>
    </section>
  );
}
