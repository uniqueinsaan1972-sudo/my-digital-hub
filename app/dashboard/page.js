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

  if (loading) {
    return <div className={styles.container}><h1>Loading...</h1></div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1>🎉 Welcome to getuniquevault!</h1>
        
        {userData && (
          <div className={styles.userInfo}>
            <h2>Salam, {userData.name}! 👋</h2>
            <p><strong>Email:</strong> {userData.email}</p>
            <p><strong>Account Created:</strong> {new Date(userData.createdAt).toLocaleDateString('en-PK')}</p>
          </div>
        )}

        <div className={styles.features}>
          <h3>📊 Your Dashboard</h3>
          <p>Yahan par tu apna sab kuch manage kar sakta hai!</p>
          <ul>
            <li>✅ Profile Edit Karo</li>
            <li>✅ Settings Change Karo</li>
            <li>✅ Data Download Karo</li>
          </ul>
        </div>

        <button onClick={handleLogout} className={styles.logoutBtn}>
          Logout Karo 🚪
        </button>
      </div>
    </div>
  );
}