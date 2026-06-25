import { SignupForm } from "./signup-form";
import styles from "./signup.module.css";

export default function SignupPage() {
  return (
    <div className={styles.page}>
      <div className={styles.glow} />
      <div className={styles.card}>
        <div className={styles.brand}>
          <span className={styles.brandIcon}>⚡</span>
          <h1 className={styles.brandTitle}>
            Story<span className={styles.brandAccent}>Forge</span>
          </h1>
          <p className={styles.brandTagline}>
            Create your account and start making viral shorts
          </p>
        </div>
        <SignupForm />
      </div>
    </div>
  );
}
