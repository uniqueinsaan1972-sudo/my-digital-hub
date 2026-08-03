"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, database } from "../lib/firebase";
import { ref, get, update } from "firebase/database";
import { useRouter } from "next/navigation";
import styles from "../../styles/browse.module.css";

export default function Browse() {
  const [user, setUser] = useState(null);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        const assetsRef = ref(database, "assets");
        const snapshot = await get(assetsRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          const assetsList = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }));
          assetsList.reverse();
          setAssets(assetsList);
        }
      } else {
        router.push("/login");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const handleDownload = async (asset) => {
    const assetRef = ref(database, "assets/" + asset.id);
    await update(assetRef, { downloads: (asset.downloads || 0) + 1 });

    const downloadUrl = asset.fileUrl.replace("/upload/", "/upload/fl_attachment/");
    window.location.href = downloadUrl;
  };

  const categories = ["All", "Images", "Graphics", "Videos", "APKs"];

  const filteredAssets =
    activeCategory === "All"
      ? assets
      : assets.filter((a) => a.category === activeCategory);

  if (loading) {
    return <div className={styles.loadingScreen}>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className={styles.page}>
      <nav className={styles.navbar}>
        <a href="/dashboard" className={styles.logo}>
          getuniquevault
        </a>
        <a href="/dashboard" className={styles.backLink}>
          Dashboard
        </a>
      </nav>

      <div className={styles.container}>
        <h1>Browse Assets</h1>

        <div className={styles.filterBar}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={
                activeCategory === cat
                  ? styles.filterBtn + " " + styles.activeFilter
                  : styles.filterBtn
              }
            >
              {cat}
            </button>
          ))}
        </div>

        {filteredAssets.length === 0 ? (
          <div className={styles.emptyState}>
            Is category mein abhi koi asset nahi hai.
          </div>
        ) : (
          <div className={styles.grid}>
            {filteredAssets.map((asset) => (
              <div key={asset.id} className={styles.card}>
                <div className={styles.thumbnail}>
                  {asset.resourceType === "image" ? (
                    <img src={asset.fileUrl} alt={asset.title} />
                  ) : asset.resourceType === "video" ? (
                    <video src={asset.fileUrl} muted />
                  ) : (
                    <div className={styles.fileIcon}>File</div>
                  )}
                </div>
                <div className={styles.cardBody}>
                  <span className={styles.categoryTag}>{asset.category}</span>
                  <h3>{asset.title}</h3>
                  <p>{asset.description}</p>
                  <div className={styles.cardFooter}>
                    <span className={styles.priceTag}>{asset.price}</span>
                    <span className={styles.downloadCount}>
                      {asset.downloads || 0} downloads
                    </span>
                  </div>
                  <button
                    onClick={() => handleDownload(asset)}
                    className={styles.downloadBtn}
                  >
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}