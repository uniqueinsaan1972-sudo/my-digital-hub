"use client";

import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, database } from '../lib/firebase';
import { ref, get } from 'firebase/database';
import { useRouter } from 'next/navigation';
import styles from '../../styles/Dashboard.module.css';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userRef = ref(database, 'users/' + currentUser.uid);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          setUserData(snapshot.val());
        }
      } else {
        router.push('/login');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const categories = [
    { name: 'Images', icon: '🖼️', count: '0 assets' },
    { name: 'Graphics', icon: '🎨', count: '0 assets' },
    { name: 'Videos', icon: '🎬', count: '0 assets' },
    { name: 'APKs', icon: '📱', count: '0 assets' },
  ];

  if (loading) {
    return <div className={styles.loadingScreen}>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className={styles.page}>
      {/* NAVBAR */}
      <nav className={styles.navbar}>
        <div className={styles.logo}>⚡ getuniquevault</div>
        <div className={styles.navLinks}>
          <a href="/dashboard">Browse</a>
          <a href="#">Upload</a>
          <a href="#">About</a>
        </div>
        <div className={styles.navRight}>
          <span className={styles.userName}>{userData?.name || 'User'}</span>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className={styles.hero}>
        <h1>
          Free Digital Assets <br />
          <span className={styles.highlight}>For Creators</span>
        </h1>
        <p>Download images, graphics, videos, APKs & code. All FREE! 🎉</p>
      </section>

      {/* CATEGORIES */}
      <section className={styles.categories}>
        {categories.map((cat) => (
          <div key={cat.name} className={styles.categoryCard}>
            <span className={styles.categoryIcon}>{cat.icon}</span>
            <h3>{cat.name}</h3>
            <p>{cat.count}</p>
          </div>
        ))}
      </section>

      {/* TRENDING */}
      <section className={styles.trending}>
        <h2>🔥 Trending Downloads</h2>
        <div className={styles.trendingGrid}>
          <div className={styles.emptyState}>
            Abhi tak koi upload nahi hua — jald hi yahan content dikhega!
          </div>
        </div>
      </section>
    </div>
  );
}