"use client";

import styles from '../styles/Home.module.css';

export default function Home() {
  const categories = [
    { name: 'Images', icon: '🖼️' },
    { name: 'Graphics', icon: '🎨' },
    { name: 'Videos', icon: '🎬' },
    { name: 'APKs', icon: '📱' },
  ];

  return (
    <div className={styles.page}>
      {/* NAVBAR */}
      <nav className={styles.navbar}>
        <div className={styles.logo}>⚡ getuniquevault</div>
        <div className={styles.navRight}>
          <a href="/login" className={styles.loginLink}>Login</a>
          <a href="/signup" className={styles.signupBtn}>Sign Up</a>
        </div>
      </nav>

      {/* HERO */}
      <section className={styles.hero}>
        <h1>
          Free Digital Assets <br />
          <span className={styles.highlight}>For Creators</span>
        </h1>
        <p>Download images, graphics, videos, APKs & code. All FREE! 🎉</p>

        <div className={styles.buttons}>
          <a href="/signup" className={styles.primaryBtn}>
            Account Banao 🚀
          </a>
          <a href="/login" className={styles.secondaryBtn}>
            Login Karo
          </a>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className={styles.categories}>
        {categories.map((cat) => (
          <div key={cat.name} className={styles.categoryCard}>
            <span className={styles.categoryIcon}>{cat.icon}</span>
            <h3>{cat.name}</h3>
          </div>
        ))}
      </section>
    </div>
  );
}