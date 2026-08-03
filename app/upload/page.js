"use client";

import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, database } from '../lib/firebase';
import { ref, push, set } from 'firebase/database';
import { useRouter } from 'next/navigation';
import styles from '../../styles/upload.module.css';

export default function Upload() {
  const [user, setUser] = useState(null);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Images');
  const [subcategory, setSubcategory] = useState('');
  const [price, setPrice] = useState('Free');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleUpload = async (e) => {
    e.preventDefault();
    setError('');

    if (!file) {
      setError('Pehle koi file select karo');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      const assetsRef = ref(database, 'assets');
      const newAssetRef = push(assetsRef);

      await set(newAssetRef, {
        title,
        description,
        category,
        subcategory: subcategory || null,
        price,
        fileUrl: data.url,
        publicId: data.publicId,
        resourceType: data.resourceType,
        format: data.format,
        uploadedBy: user.uid,
        uploaderEmail: user.email,
        createdAt: new Date().toISOString(),
        downloads: 0,
      });

      setSuccess(true);
      setTitle('');
      setDescription('');
      setFile(null);
      setSubcategory('');

      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);

    } catch (err) {
      setError(err.message);
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  if (!user) {
    return <div className={styles.loadingScreen}>Loading...</div>;
  }

  return (
    <div className={styles.page}>
      <nav className={styles.navbar}>
        <a href="/dashboard" className={styles.logo}>⚡ getuniquevault</a>
        <a href="/dashboard" className={styles.backLink}>← Dashboard</a>
      </nav>

      <div className={styles.container}>
        <div className={styles.card}>
          <h1>📤 Upload Resource</h1>
          <p className={styles.subtitle}>Apni file duniya ke saath share karo</p>

          {error && <div className={styles.error}>{error}</div>}
          {success && <div className={styles.success}>Upload ho gaya! 🎉 Redirecting...</div>}

          <form onSubmit={handleUpload}>
            <label className={styles.label}>File Choose Karo</label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className={styles.fileInput}
              required
            />

            <label className={styles.label}>Title</label>
            <input
              type="text"
              placeholder="Jaise: Modern UI Design Kit"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <label className={styles.label}>Description</label>
            <textarea
              placeholder="Iske baare mein thoda likho..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />

            <label className={styles.label}>Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="Images">Images</option>
              <option value="Graphics">Graphics</option>
              <option value="Videos">Videos</option>
              <option value="APKs">APKs</option>
            </select>

            {/* Videos ke liye subcategory dropdown */}
            {category === 'Videos' && (
              <>
                <label className={styles.label}>Video Type</label>
                <select value={subcategory} onChange={(e) => setSubcategory(e.target.value)}>
                  <option value="">-- Select Type --</option>
                  <option value="Meme">Meme</option>
                  <option value="Gaming">Gaming</option>
                  <option value="Free Fire Montage">Free Fire Montage</option>
                  <option value="Tutorial">Tutorial</option>
                  <option value="Other">Other</option>
                </select>
              </>
            )}

            <label className={styles.label}>Price</label>
            <select value={price} onChange={(e) => setPrice(e.target.value)}>
              <option value="Free">Free</option>
              <option value="Paid">Paid (coming soon)</option>
            </select>

            <button type="submit" disabled={uploading}>
              {uploading ? 'Uploading...' : 'Upload Karo 🚀'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}