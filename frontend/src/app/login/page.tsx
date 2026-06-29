import { LoginForm } from "./login-form";
import styles from "./login.module.css";

export default function LoginPage() {
  return (
    <div className={styles.page}>
      <div className={styles.brandPanel}>
        <div className={styles.brandPanelInner}>
          <div className={styles.logo}>
            <span className={styles.logoMark}>⚡</span>
            <span className={styles.logoText}>
              Story<span className={styles.logoAccent}>Forge</span>
            </span>
          </div>

          <div className={styles.brandHero}>
            <h1 className={styles.brandHeading}>
              Automate your<br />
              <span className={styles.brandHeadingAccent}>viral content</span>
            </h1>
            <p className={styles.brandSubline}>
              AI-powered short-form video pipeline for Nepali & Hindi creators.
              Script → Voice → Visuals → Published.
            </p>
          </div>

          <ul className={styles.featureList}>
            {[
              ["🎬", "AI script tuned to go viral"],
              ["🎙️", "Voice synthesis in Nepali, Hindi & English"],
              ["🖼️", "Auto-matched visuals per scene"],
              ["⚡", "One-click render and export"],
            ].map(([icon, text]) => (
              <li key={text} className={styles.featureItem}>
                <span className={styles.featureIcon}>{icon}</span>
                <span>{text}</span>
              </li>
            ))}
          </ul>

          <div className={styles.brandFooter}>
            Trusted by content creators across Nepal & India
          </div>
        </div>
      </div>

      <div className={styles.formPanel}>
        <div className={styles.formPanelInner}>
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>Welcome back</h2>
            <p className={styles.formSubtitle}>Sign in to your StoryForge account</p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
