"use client";

import styles from '../styles/Home.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <h1>🔐 getuniquevault</h1>
        <p className={styles.tagline}>
          Ek jagah — Images, Videos, APKs aur Digital Resources
        </p>

        <div className={styles.features}>
          <div className={styles.featureCard}>
            <span className={styles.icon}>🖼️</span>
            <h3>Images & Graphics</h3>
          </div>
          <div className={styles.featureCard}>
            <span className={styles.icon}>🎬</span>
            <h3>Videos & Presets</h3>
          </div>
          <div className={styles.featureCard}>
            <span className={styles.icon}>📱</span>
            <h3>APKs & Tools</h3>
          </div>
        </div>

        <div className={styles.buttons}>
          <a href="/signup" className={styles.primaryBtn}>
            Account Banao 🚀
          </a>
          <a href="/login" className={styles.secondaryBtn}>
            Login Karo
          </a>
        </div>
      </div>
    </div>
  );
}