"use client";

import { useState, useEffect } from 'react';
import { database } from '../lib/firebase';
import { ref, onValue } from 'firebase/database';
import { useSearchParams } from 'next/navigation';
import styles from '../../styles/browse.module.css';

export default function Browse() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category') || 'All';
  
  const [assets, setAssets] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Subcategories for Videos
  const videoSubcategories = ['Meme', 'Gaming', 'Free Fire Montage', 'Tutorial', 'Other'];

  useEffect(() => {
    const assetsRef = ref(database, 'assets');
    
    const unsubscribe = onValue(assetsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const assetsList = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value,
        }));
        setAssets(assetsList);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let filtered = assets;

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(asset => asset.category === selectedCategory);
    }

    if (selectedSubcategory) {
      filtered = filtered.filter(asset => asset.subcategory === selectedSubcategory);
    }

    setFilteredAssets(filtered);
  }, [selectedCategory, selectedSubcategory, assets]);

  const getSubcategoryCount = (subcatName) => {
    return assets.filter(a => a.category === 'Videos' && a.subcategory === subcatName).length;
  };

  const folderIcons = {
    'Meme': '😂',
    'Gaming': '🎮',
    'Free Fire Montage': '🔥',
    'Tutorial': '📚',
    'Other': '📦'
  };

  return (
    <div className={styles.page}>
      <nav className={styles.navbar}>
        <a href="/dashboard" className={styles.logo}>⚡ getuniquevault</a>
        <a href="/dashboard" className={styles.backLink}>← Dashboard</a>
      </nav>

      <div className={styles.container}>
        <h1 className={styles.title}>Browse Assets</h1>
        
        <input 
          type="text" 
          placeholder="Search assets..." 
          className={styles.searchInput}
        />

        {/* Category Buttons */}
        <div className={styles.categoryButtons}>
          {['All', 'Images', 'Graphics', 'Videos', 'APKs'].map(cat => (
            <button
              key={cat}
              className={`${styles.categoryBtn} ${selectedCategory === cat ? styles.active : ''}`}
              onClick={() => {
                setSelectedCategory(cat);
                setSelectedSubcategory(null);
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Video Folders - sirf Videos category mein */}
        {selectedCategory === 'Videos' && (
          <div className={styles.foldersSection}>
            <h2>📁 Video Folders</h2>
            <div className={styles.foldersGrid}>
              {videoSubcategories.map(sub => {
                const count = getSubcategoryCount(sub);
                const isActive = selectedSubcategory === sub;
                
                return (
                  <div
                    key={sub}
                    className={`${styles.folderItem} ${isActive ? styles.folderActive : ''}`}
                    onClick={() => setSelectedSubcategory(isActive ? null : sub)}
                  >
                    <div className={styles.folderEmoji}>{folderIcons[sub]}</div>
                    <div className={styles.folderLabel}>{sub}</div>
                    <div className={styles.folderCount}>{count} videos</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Assets Display */}
        {loading ? (
          <div className={styles.loading}>Loading...</div>
        ) : filteredAssets.length === 0 ? (
          <div className={styles.noAssets}>Koi assets nahi milein</div>
        ) : (
          <div className={styles.assetsGrid}>
            {filteredAssets.map(asset => (
              <div key={asset.id} className={styles.assetCard}>
                <div className={styles.assetThumb}>
                  {asset.category === 'Videos' ? '🎥' : '📄'}
                </div>
                <div className={styles.assetInfo}>
                  <h3>{asset.title}</h3>
                  {asset.subcategory && (
                    <span className={styles.subcatTag}>{asset.subcategory}</span>
                  )}
                  <p>{asset.description?.substring(0, 50)}...</p>
                  <div className={styles.assetFooter}>
                    <span>{asset.price}</span>
                    <span>⬇️ {asset.downloads}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}