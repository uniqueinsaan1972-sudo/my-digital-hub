"use client";

import { useRouter } from "next/navigation";
import styles from "../../styles/guide.module.css";

export default function Guide() {
  const router = useRouter();

  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <button onClick={() => router.push("/dashboard")} className={styles.backBtn}>
          ← Dashboard
        </button>
      </div>

      <div className={styles.container}>
        <h1 className={styles.title}>Guide</h1>
        <p className={styles.subtitle}>Everything you need to know about getuniquevault</p>

        <section className={styles.section}>
          <h2>What is getuniquevault?</h2>
          <p>
            getuniquevault is a free digital assets platform where creators can find and share
            images, graphics, videos, APKs, and other digital resources. Our goal is to give
            creators, designers, developers, and content makers a single place to discover
            high-quality free assets without the hassle of searching multiple websites.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Why does it exist?</h2>
          <p>
            Finding good quality free digital resources online can be difficult and time
            consuming. getuniquevault was built to solve this problem by creating a community
            driven library where users can both download resources they need and upload
            resources they want to share with others.
          </p>
        </section>

        <section className={styles.section}>
          <h2>How to use getuniquevault</h2>
          <ul className={styles.list}>
            <li><strong>Create an account</strong> — Sign up with your name, email, and a password to get started.</li>
            <li><strong>Browse assets</strong> — Use the "Browse" page to explore images, graphics, videos, and APKs. You can filter by category or use the search bar to find something specific.</li>
            <li><strong>Download for free</strong> — Click the download button on any asset card to save it directly to your device.</li>
            <li><strong>Upload your own content</strong> — Go to the "Upload" page, choose a file, add a title, description, and category, then share it with the community.</li>
            <li><strong>Manage your profile</strong> — Update your username, add a profile photo, write a short bio, and link your social media accounts from the Profile page.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>Is getuniquevault safe and secure?</h2>
          <p>
            Yes. getuniquevault uses Firebase Authentication to securely manage user accounts,
            meaning your password is never stored in plain text and is protected using industry
            standard encryption. All uploaded files are hosted through secure cloud storage.
            We do not sell your personal information to third parties.
          </p>
          <p>
            As with any platform, we recommend using a strong, unique password and being
            mindful about the personal information you share in your public profile bio.
          </p>
        </section>

        <section className={styles.section}>
          <h2>Need help or have a question?</h2>
          <p>
            If you run into any issues, have feedback, or just want to ask a question, we are
            happy to help. Reach out to us anytime at:
          </p>
          <a href="mailto:getuniquevaultsupport@gmail.com" className={styles.emailBtn}>
            📧 getuniquevaultsupport@gmail.com
          </a>
        </section>
      </div>
    </div>
  );
}