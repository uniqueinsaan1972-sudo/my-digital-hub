"use client";

import { useState, useEffect, Suspense } from 'react';
import { database } from '../lib/firebase';
import { ref, onValue } from 'firebase/database';
import { useSearchParams } from 'next/navigation';
import styles from '../../styles/browse.module.css';

function getThumbnailUrl(asset) {
  if (asset.resourceType === 'video') {
    return asset.fileUrl.replace(/\.\w+$/, '.jpg');
  }
  return asset.fileUrl;
}

const typeIcons = {
  Meme: '😂',
  Gaming: '🎮',
  'Free Fire Montage': '🔥',
  Tutorial: '📚',
  Other: '📦',
};

function BrowseContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category') || 'All';

  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState({}); // Firebase se dynamic categories/types
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

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

    const categoriesRef = ref(database, 'categories');
    const categoriesUnsub = onValue(categoriesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) setCategories(data);
    });

    return () => {
      unsubscribe();
      categoriesUnsub();
    };
  }, []);

  useEffect(() => {
    let filtered = assets;

    if (selectedCategory !== 'All') {
      filtered = filtered.filter((asset) => asset.category === selectedCategory);
    }

    if (selectedSubcategory) {
      filtered = filtered.filter((asset) => asset.subcategory === selectedSubcategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      filtered = filtered.filter(
        (asset) =>
          asset.title?.toLowerCase().includes(q) ||
          asset.description?.toLowerCase().includes(q)
      );
    }

    setFilteredAssets(filtered);
  }, [selectedCategory, selectedSubcategory, assets, searchQuery]);

  const getSubcategoryCount = (catName, subcatName) => {
    return assets.filter((a) => a.category === catName && a.subcategory === subcatName).length;
  };

  const handleDownload = async (asset) => {
    setDownloadingId(asset.id);
    try {
      const cloudinaryDownloadUrl = asset.fileUrl.replace('/upload/', '/upload/fl_attachment/');
      const res = await fetch(`/api/shorten?url=${encodeURIComponent(cloudinaryDownloadUrl)}`);
      const data = await res.json();

      if (data.shortUrl) {
        window.open(data.shortUrl, '_blank');
      } else {
        window.open(cloudinaryDownloadUrl, '_blank');
      }
    } catch (error) {
      console.error('Download error:', error);
      const fallbackUrl = asset.fileUrl.replace('/upload/', '/upload/fl_attachment/');
      window.open(fallbackUrl, '_blank');
    } finally {
      setDownloadingId(null);
    }
  };

  // Selected category ke liye types Firebase se
  const currentTypes = selectedCategory !== 'All' ? Object.keys(categories[selectedCategory]?.types || {}) : [];

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
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <div className={styles.categoryButtons}>
          {['All', ...Object.keys(categories)].map((cat) => (
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

        {selectedCategory !== 'All' && currentTypes.length > 0 && (
          <div className={styles.foldersSection}>
            <h2>📁 {selectedCategory} Folders</h2>
            <div className={styles.foldersGrid}>
              {currentTypes.map((sub) => {
                const count = getSubcategoryCount(selectedCategory, sub);
                const isActive = selectedSubcategory === sub;

                return (
                  <div
                    key={sub}
                    className={`${styles.folderItem} ${isActive ? styles.folderActive : ''}`}
                    onClick={() => setSelectedSubcategory(isActive ? null : sub)}
                  >
                    <div className={styles.folderEmoji}>{typeIcons[sub] || '🏷️'}</div>
                    <div className={styles.folderLabel}>{sub}</div>
                    <div className={styles.folderCount}>{count} items</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {loading ? (
          <div className={styles.loading}>Loading...</div>
        ) : currentTypes.length > 0 && !selectedSubcategory && !searchQuery.trim() ? (
          <div className={styles.noAssets}>👆 Upar se koi folder select karo assets dekhne ke liye</div>
        ) : filteredAssets.length === 0 ? (
          <div className={styles.noAssets}>Koi assets nahi milein</div>
        ) : (
          <div className={styles.assetsGrid}>
            {filteredAssets.map((asset) => (
              <div key={asset.id} className={styles.assetCard}>
                <div className={styles.assetThumb}>
                  <img
                    src={getThumbnailUrl(asset)}
                    alt={asset.title}
                    className={styles.thumbImage}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className={styles.fallbackIcon} style={{ display: 'none' }}>
                    {asset.category === 'Videos' ? '🎥' : '📄'}
                  </div>
                </div>
                <div className={styles.assetInfo}>
                  <h3>{asset.title}</h3>
                  {asset.subcategory && (
                    <span className={styles.subcatTag}>{asset.subcategory}</span>
                  )}
                  <p>{asset.description?.substring(0, 50)}...</p>
                  <div className={styles.assetFooter}>
                    <span>{asset.price}</span>
                    <button
                      onClick={() => handleDownload(asset)}
                      className={styles.downloadBtn}
                      disabled={downloadingId === asset.id}
                    >
                      {downloadingId === asset.id ? '...' : '⬇️ Download'}
                    </button>
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

export default function Browse() {
  return (
    <Suspense fallback={<div style={{ color: '#fff', padding: '40px', textAlign: 'center' }}>Loading...</div>}>
      <BrowseContent />
    </Suspense>
  );
}
