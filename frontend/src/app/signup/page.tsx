import { SignupForm } from "./signup-form";
import styles from "./signup.module.css";

export default function SignupPage() {
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
              Start making<br />
              <span className={styles.brandHeadingAccent}>viral shorts</span>
            </h1>
            <p className={styles.brandSubline}>
              Join creators using StoryForge to generate, voice, and publish
              short-form content — without a full production team.
            </p>
          </div>

          <ul className={styles.featureList}>
            {[
              ["🚀", "Free to get started"],
              ["🤖", "AI does the heavy lifting"],
              ["🌐", "Nepali, Hindi & English"],
              ["📱", "Shorts-optimized output"],
            ].map(([icon, text]) => (
              <li key={text} className={styles.featureItem}>
                <span className={styles.featureIcon}>{icon}</span>
                <span>{text}</span>
              </li>
            ))}
          </ul>

          <div className={styles.brandFooter}>
            Automated content creation for modern creators
          </div>
        </div>
      </div>

      <div className={styles.formPanel}>
        <div className={styles.formPanelInner}>
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>Create account</h2>
            <p className={styles.formSubtitle}>Set up your StoryForge workspace</p>
          </div>
          <SignupForm />
        </div>
      </div>
    </div>
  );
}
