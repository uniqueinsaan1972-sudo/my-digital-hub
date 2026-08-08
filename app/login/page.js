"use client";

import { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, setPersistence, browserLocalPersistence, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useRouter } from 'next/navigation';
import styles from '../../styles/Auth.module.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [authChecking, setAuthChecking] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  // Check if user already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User already logged in, redirect to dashboard
        router.push('/dashboard');
      }
      setAuthChecking(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Set persistence before login
      await setPersistence(auth, browserLocalPersistence);
      
      // Login
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Add success animation before redirect
      setEmail('');
      setPassword('');
      
      // Small delay for animation
      setTimeout(() => {
        router.push('/dashboard');
      }, 300);
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (authChecking) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.card + ' ' + styles.fadeIn}>
        <div className={styles.logo}>⚡ Getuniquevault</div>
        <h1 className={styles.slideUp}>Welcome Back</h1>
        <p className={styles.subtitle + ' ' + styles.slideUp}>Login to your account</p>

        {error && (
          <div className={styles.error + ' ' + styles.shake}>
            <span>❌</span> {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className={styles.inputGroup + ' ' + styles.slideUp}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className={styles.input}
            />
            <span className={styles.inputIcon}>📧</span>
          </div>

          <div className={styles.inputGroup + ' ' + styles.slideUp}>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className={styles.input}
            />
            <button
              type="button"
              className={styles.togglePassword}
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={styles.submitBtn + ' ' + (loading ? styles.loading : '')}
          >
            {loading ? (
              <>
                <span className={styles.spinner}></span>
                Logging In...
              </>
            ) : (
              'Login Now 🚀'
            )}
          </button>
        </form>

        <p className={styles.switchText}>
          No Account found? <a href="/signup">Signup now</a>
        </p>

        <div className={styles.features}>
          <p>✨ Free assets for creators</p>
          <p>🔒 Secure authentication</p>
        </div>
      </div>
    </div>
  );
}
