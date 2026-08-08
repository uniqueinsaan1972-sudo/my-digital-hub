"use client";

import { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword, setPersistence, browserLocalPersistence, onAuthStateChanged } from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { auth, database } from '../lib/firebase';
import { useRouter } from 'next/navigation';
import styles from '../../styles/Auth.module.css';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [authChecking, setAuthChecking] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
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

  // Check password strength
  useEffect(() => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[!@#$%^&*]/.test(password)) strength++;
    setPasswordStrength(strength);
  }, [password]);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }

    setLoading(true);

    try {
      // Set persistence before signup
      await setPersistence(auth, browserLocalPersistence);

      // Create user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save user data to database
      await set(ref(database, 'users/' + user.uid), {
        name: name.trim(),
        email: email,
        createdAt: new Date().toISOString(),
        uid: user.uid,
        downloads: 0,
        uploads: 0
      });

      // Clear form
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setName('');

      // Small delay for animation
      setTimeout(() => {
        router.push('/dashboard');
      }, 300);
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Email is already registered');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak');
      } else {
        setError(err.message || 'Signup failed. Please try again.');
      }
      console.error('Signup error:', err);
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
        <div className={styles.logo}>⚡ getuniquevault</div>
        <h1 className={styles.slideUp}>Create Account</h1>
        <p className={styles.subtitle + ' ' + styles.slideUp}>Free digital assets ke liye signup karo</p>

        {error && (
          <div className={styles.error + ' ' + styles.shake}>
            <span>❌</span> {error}
          </div>
        )}

        <form onSubmit={handleSignup}>
          <div className={styles.inputGroup + ' ' + styles.slideUp}>
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
              className={styles.input}
            />
            <span className={styles.inputIcon}>👤</span>
          </div>

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
              placeholder="Password (6+ characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className={styles.input}
              minLength="6"
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

          {password && (
            <div className={styles.passwordStrength + ' ' + styles.slideUp}>
              <div className={styles.strengthBar}>
                <div 
                  className={styles.strengthFill + ' ' + styles[`strength${passwordStrength}`]}
                  style={{ width: `${(passwordStrength / 5) * 100}%` }}
                ></div>
              </div>
              <small className={styles[`strengthText${passwordStrength}`]}>
                {passwordStrength === 0 && 'Very Weak'}
                {passwordStrength === 1 && 'Weak'}
                {passwordStrength === 2 && 'Fair'}
                {passwordStrength === 3 && 'Good'}
                {passwordStrength === 4 && 'Strong'}
                {passwordStrength === 5 && 'Very Strong'}
              </small>
            </div>
          )}

          <div className={styles.inputGroup + ' ' + styles.slideUp}>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
              className={styles.input}
            />
            <button
              type="button"
              className={styles.togglePassword}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={loading}
            >
              {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
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
                Creating Account...
              </>
            ) : (
              'Create Account 🎯'
            )}
          </button>
        </form>

        <p className={styles.switchText}>
          Already have an account? <a href="/login">Login here</a>
        </p>

        <div className={styles.features}>
          <p>✨ Free digital assets</p>
          <p>📱 Images, Videos, APKs</p>
          <p>🔒 Secure & Private</p>
        </div>
      </div>
    </div>
  );
}
