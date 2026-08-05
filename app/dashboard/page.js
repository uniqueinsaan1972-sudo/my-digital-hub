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
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [categoryCounts, setCategoryCounts] = useState({
    Images: 0,
    Graphics: 0,
    Videos: 0,
    APKs: 0,
  });
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

        const assetsRef = ref(database, 'assets');
        const assetsSnapshot = await get(assetsRef);
        if (assetsSnapshot.exists()) {
          const assets = assetsSnapshot.val();
          const counts = { Images: 0, Graphics: 0, Videos: 0, APKs: 0 };
          Object.values(assets).forEach((asset) => {
            if (counts[asset.category] !== undefined) {
              counts[asset.category]++;
            }
          });
          setCategoryCounts(counts);
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

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/browse?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/browse');
    }
  };

  const categories = [
    { name: 'Images', icon: '🖼️' },
    { name: 'Graphics', icon: '🎨' },
    { name: 'Videos', icon: '🎬' },
    { name: 'APKs', icon: '📱' },
  ];

  const initial = (userData?.name || 'U').charAt(0).toUpperCase();

  if (loading) {
    return <div className={styles.loadingScreen}>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className={styles.page} onClick={() => menuOpen && setMenuOpen(false)}>
      <nav className={styles.navbar}>
        <div className={styles.logo}>⚡ getuniquevault</div>
 <div className={styles.navLinks}>
  <a href="/browse">Browse</a>
  <a href="/upload">Upload</a>
  <a href="/admin/moderation" style={{ color: '#e74c3c', fontWeight: 'bold' }}>🛡️ Admin</a>
</div>
        <div className={styles.profileWrap}>
          <div
            className={styles.avatar}
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
          >
            {initial}
          </div>

          {menuOpen && (
            <div className={styles.dropdown} onClick={(e) => e.stopPropagation()}>
              <div className={styles.dropdownHeader}>
                <p className={styles.dropdownName}>{userData?.name || 'User'}</p>
                <p className={styles.dropdownEmail}>{userData?.email || user.email}</p>
              </div>
<div className={styles.dropdownItems}>
  <a href="/profile" className={styles.dropdownItem}>👤 Profile info</a>
  <a href="/guide" className={styles.dropdownItem}>❓ Guide</a>
  <a href="/admin/moderation" className={styles.dropdownItem}>🛡️ Admin Panel</a>
  <a href="/privacy" className={styles.dropdownItem}>🔒 Privacy policy</a>
  <a href="/contact" className={styles.dropdownItem}>📞 Contact us</a>
  <a href="mailto:support@getuniquevault.online" className={styles.dropdownItem}>✉️ Help email</a>
</div>
              <div className={styles.dropdownFooter}>
                <button onClick={handleLogout} className={styles.dropdownLogout}>
                  🚪 Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      <section className={styles.hero}>
        <h1>
          Free Digital Assets <br />
          <span className={styles.highlight}>For Creators</span>
        </h1>
        <p>Download images, graphics, videos, APKs & code. All FREE! 🎉</p>

        <form onSubmit={handleSearch} className={styles.searchForm}>
          <input
            type="text"
            placeholder="Search images, videos, APKs, effects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
          <button type="submit" className={styles.searchBtn}>
            🔍 Search
          </button>
        </form>
      </section>

      <section className={styles.categories}>
        {categories.map((cat) => (
          <a href={`/browse?category=${cat.name}`} key={cat.name} className={styles.categoryCard}>
            <span className={styles.categoryIcon}>{cat.icon}</span>
            <h3>{cat.name}</h3>
            <p>{categoryCounts[cat.name]} assets</p>
          </a>
        ))}
      </section>

      <section className={styles.trending}>
        <h2>🔥 Trending Downloads</h2>
        <div className={styles.trendingGrid}>
          <div className={styles.emptyState}>
            <a href="/browse" style={{ color: '#60a5fa' }}>Sab uploads dekhne ke liye "Browse" pe jao →</a>
          </div>
        </div>
      </section>
    </div>
  );
}