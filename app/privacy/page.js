"use client";

import { useRouter } from "next/navigation";
import styles from "../../styles/privacy.module.css";

export default function Privacy() {
  const router = useRouter();

  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <button onClick={() => router.push("/dashboard")} className={styles.backBtn}>
          ← Dashboard
        </button>
      </div>

      <div className={styles.container}>
        <h1 className={styles.title}>Privacy policy</h1>
        <p className={styles.subtitle}>Last updated: August 2026</p>

        <section className={styles.section}>
          <h2>1. Information we collect</h2>
          <p>
            When you create an account on getuniquevault, we collect your name, email address,
            and password. Your password is securely encrypted through Firebase Authentication
            and is never stored or visible in plain text. If you choose to upload a profile
            photo, add a bio, or link your social media accounts, that information is stored
            as part of your public profile.
          </p>
        </section>

        <section className={styles.section}>
          <h2>2. How we use your information</h2>
          <p>
            Your information is used to manage your account, allow you to log in securely,
            attribute uploaded content to your profile, and improve the overall functionality
            of the platform. We do not sell your personal data to third parties.
          </p>
        </section>

        <section className={styles.section}>
          <h2>3. Uploaded content</h2>
          <p>
            Any files you upload to getuniquevault (images, videos, APKs, or other resources)
            are stored using secure third party cloud storage. By uploading content, you confirm
            that you have the right to share it and that it does not violate any copyright laws.
          </p>
        </section>

        <section className={styles.section}>
          <h2>4. Data security</h2>
          <p>
            We take reasonable measures to protect your data, including encrypted authentication
            and secure database access rules. However, no method of transmission over the
            internet is 100% secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section className={styles.section}>
          <h2>5. Cookies and tracking</h2>
          <p>
            getuniquevault may use basic session data to keep you logged in. We do not use
            invasive tracking or share browsing behavior with third party advertisers.
          </p>
        </section>

        <section className={styles.section}>
          <h2>6. Your rights</h2>
          <p>
            You can update or delete your profile information at any time from your account
            settings. If you would like your account or data permanently removed, contact us
            and we will process your request.
          </p>
        </section>

        <section className={styles.section}>
          <h2>7. Contact us</h2>
          <p>
            If you have any questions about this privacy policy or how your data is handled,
            reach out to us at:
          </p>
          <a href="mailto:getuniquevaultsupport@gmail.com" className={styles.emailBtn}>
            getuniquevaultsupport@gmail.com
          </a>
        </section>
      </div>
    </div>
  );
}