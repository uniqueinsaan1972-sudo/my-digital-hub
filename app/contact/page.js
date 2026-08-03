"use client";

import { useRouter } from "next/navigation";
import styles from "../../styles/contact.module.css";

export default function Contact() {
  const router = useRouter();

  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <button onClick={() => router.push("/dashboard")} className={styles.backBtn}>
          ← Dashboard
        </button>
      </div>

      <div className={styles.container}>
        <h1 className={styles.title}>Contact us</h1>
        <p className={styles.subtitle}>
          Have a question, found a bug, or want to give feedback? We would love to hear from you.
        </p>

        <div className={styles.card}>
          <div className={styles.iconCircle}>📧</div>
          <h2>Email support</h2>
          <p>
            Our team typically responds within 24 to 48 hours. Please include as much detail
            as possible so we can help you quickly.
          </p>
          <a href="mailto:getuniquevaultsupport@gmail.com" className={styles.emailBtn}>
            getuniquevaultsupport@gmail.com
          </a>
        </div>

        <div className={styles.reasonsBox}>
          <h3>What can you contact us about?</h3>
          <ul className={styles.list}>
            <li>Reporting a bug or technical issue</li>
            <li>Reporting inappropriate or copyrighted content</li>
            <li>Account or login issues</li>
            <li>Suggestions to improve the platform</li>
            <li>General questions about how getuniquevault works</li>
          </ul>
        </div>
      </div>
    </div>
  );
}