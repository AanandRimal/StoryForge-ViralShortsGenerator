import { LoginForm } from "./login-form";
import styles from "./login.module.css";

export default function LoginPage() {
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
            Viral Nepali &amp; Hindi shorts — one click to publish
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
