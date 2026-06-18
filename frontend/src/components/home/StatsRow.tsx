import styles from "./StatsRow.module.css";

type Stats = {
  videosToday: number;
  totalPublished: number;
  totalViews: number;
  queueDepth: number;
};

const STAT_CONFIG = [
  { key: "videosToday" as const, label: "Videos Today", icon: "🎬" },
  { key: "totalPublished" as const, label: "Total Published", icon: "✅" },
  { key: "totalViews" as const, label: "Total Views", icon: "👁️" },
  { key: "queueDepth" as const, label: "Queue Depth", icon: "⏳" },
];

function formatNumber(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export function StatsRow({ stats }: { stats: Stats }) {
  return (
    <div className={styles.grid}>
      {STAT_CONFIG.map((item) => (
        <div key={item.key} className={`glass-panel ${styles.card}`}>
          <span className={styles.icon}>{item.icon}</span>
          <div className={styles.content}>
            <span className={styles.value}>
              {formatNumber(stats[item.key])}
            </span>
            <span className={styles.label}>{item.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
