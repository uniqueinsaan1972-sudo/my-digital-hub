"use client";

import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { auth, database } from '../lib/firebase';
import { useRouter } from 'next/navigation';
import styles from '../../styles/Auth.module.css';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await set(ref(database, 'users/' + user.uid), {
        name: name,
        email: email,
        createdAt: new Date().toISOString(),
        uid: user.uid
      });

      alert('Account banaya gaya! 🎉');
      router.push('/login');
    } catch (err) {
      setError(err.message);
      console.error('Signup error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1>🚀 getuniquevault Signup</h1>
        
        {error && <div className={styles.error}>{error}</div>}
        
        <form onSubmit={handleSignup}>
          <input
            type="text"
            placeholder="Tera Name Likho"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          
          <input
            type="email"
            placeholder="Email Likho"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          
          <input
            type="password"
            placeholder="Password (6+ characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength="6"
          />
          
          <button type="submit" disabled={loading}>
            {loading ? 'Creating Account...' : 'Account Banao 🎯'}
          </button>
        </form>

        <p>
          Already account hai? <a href="/login">Login Karo</a>
        </p>
      </div>
    </div>
  );
}