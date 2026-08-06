export const dynamic = 'force-dynamic';
"use client";

import { useState, useEffect } from 'react';
import { database } from '../../lib/firebase';
import { ref, onValue, set, remove, update } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import styles from '../../../styles/admin.module.css';

const ADMIN_UIDS = ['pKOAZXiqNiOX44YWGFhXekr2OgJ2'];

// Default categories + types jo pehli baar seed honge agar Firebase mein kuch nahi hai
// NOTE: Firebase khaali object {} ko save nahi karta, isliye har category mein createdAt field zaroori hai
const DEFAULT_CATEGORIES = {
  Images: { createdAt: new Date().toISOString() },
  Graphics: { createdAt: new Date().toISOString() },
  Videos: {
    createdAt: new Date().toISOString(),
    types: { Meme: true, Gaming: true, 'Free Fire Montage': true, Tutorial: true, Other: true },
  },
  APKs: { createdAt: new Date().toISOString() },
};

// Firebase key mein ye characters allowed nahi: . # $ [ ] /
function sanitizeKey(name) {
  return name.trim().replace(/[.#$\[\]\/]/g, '-');
}

export default function Moderation() {
  const [pendingUploads, setPendingUploads] = useState([]);
  const [allUploads, setAllUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');

  // categories state: { CategoryName: { types: { TypeName: true, ... } } }
  const [categories, setCategories] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(null); // null = category list view
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newTypeName, setNewTypeName] = useState('');

  // "Move to Folder" — kis card ka mover khula hai + uski selection
  const [movingId, setMovingId] = useState(null);
  const [moveCategory, setMoveCategory] = useState('');
  const [moveType, setMoveType] = useState('');

  // Inline title/description edit
  const [editingAssetId, setEditingAssetId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const auth = getAuth();
  const router = useRouter();

  const categoryIcons = { Images: '🖼️', Graphics: '🎨', Videos: '🎬', APKs: '📱' };
  const typeIcons = { Meme: '😂', Gaming: '🎮', 'Free Fire Montage': '🔥', Tutorial: '📚', Other: '📦' };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push('/login');
        return;
      }
      if (!ADMIN_UIDS.includes(user.uid)) {
        alert('❌ Access Denied! Admin only.');
        router.push('/dashboard');
        return;
      }
      setIsAdmin(true);
    });
    return () => unsubscribe();
  }, [auth, router]);

  useEffect(() => {
    if (!isAdmin) return;

    const uploadsRef = ref(database, 'assets');
    const unsubscribe = onValue(uploadsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const uploads = Object.entries(data).map(([id, upload]) => ({ id, ...upload }));
        setAllUploads(uploads);
        setPendingUploads(uploads.filter((u) => u.status === 'pending'));
      } else {
        setAllUploads([]);
        setPendingUploads([]);
      }
      setLoading(false);
    });

    const categoriesRef = ref(database, 'categories');
    const categoriesUnsub = onValue(categoriesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setCategories(data);
      } else {
        // Firebase khaali hai — default categories seed kar do
        set(ref(database, 'categories'), DEFAULT_CATEGORIES);
      }
    });

    return () => {
      unsubscribe();
      categoriesUnsub();
    };
  }, [isAdmin]);

  const handleApprove = async (uploadId) => {
    try {
      await set(ref(database, `assets/${uploadId}/status`), 'approved');
    } catch (e) {
      alert('Error');
    }
  };

  const handleReject = async (uploadId) => {
    try {
      await remove(ref(database, `assets/${uploadId}`));
    } catch (e) {
      alert('Error');
    }
  };

  const handleCreateCategory = async () => {
    const name = sanitizeKey(newCategoryName);
    if (!name) return;
    if (categories[name]) {
      alert('Ye category pehle se hai!');
      return;
    }
    try {
      await set(ref(database, `categories/${name}`), { createdAt: new Date().toISOString() });
      setNewCategoryName('');
    } catch (e) {
      alert('Error');
    }
  };

  const handleDeleteCategory = async (catName) => {
    if (!confirm(`"${catName}" category delete karein? Iske andar ke saare types bhi chale jayenge.`)) return;
    try {
      await remove(ref(database, `categories/${catName}`));
    } catch (e) {
      alert('Error');
    }
  };

  const handleCreateType = async () => {
    const name = sanitizeKey(newTypeName);
    if (!name || !selectedCategory) return;
    const existingTypes = categories[selectedCategory]?.types || {};
    if (existingTypes[name]) {
      alert('Ye type pehle se hai!');
      return;
    }
    try {
      await set(ref(database, `categories/${selectedCategory}/types/${name}`), true);
      setNewTypeName('');
    } catch (e) {
      alert('Error');
    }
  };

  const handleDeleteType = async (catName, typeName) => {
    if (!confirm(`"${typeName}" type delete karein?`)) return;
    try {
      await remove(ref(database, `categories/${catName}/types/${typeName}`));
    } catch (e) {
      alert('Error');
    }
  };

  const openMover = (upload) => {
    setMovingId(upload.id);
    setMoveCategory(upload.category || Object.keys(categories)[0] || '');
    setMoveType(upload.subcategory || '');
  };

  const closeMover = () => {
    setMovingId(null);
    setMoveCategory('');
    setMoveType('');
  };

  const handleMoveAsset = async (uploadId) => {
    if (!moveCategory) {
      alert('Category select karein');
      return;
    }
    try {
      await update(ref(database, `assets/${uploadId}`), {
        category: moveCategory,
        subcategory: moveType || null,
      });
      closeMover();
    } catch (e) {
      alert('Error');
    }
  };

  const openEditor = (upload) => {
    setEditingAssetId(upload.id);
    setEditTitle(upload.title || '');
    setEditDescription(upload.description || '');
  };

  const closeEditor = () => {
    setEditingAssetId(null);
    setEditTitle('');
    setEditDescription('');
  };

  const handleSaveEdit = async (uploadId) => {
    try {
      await update(ref(database, `assets/${uploadId}`), {
        title: editTitle,
        description: editDescription,
      });
      closeEditor();
    } catch (e) {
      alert('Error');
    }
  };

  const getCategoryAssets = (catName) => allUploads.filter((u) => u.category === catName);

  const getCategoryAssetCount = (catName) => allUploads.filter((u) => u.category === catName).length;
  const getTypeAssetCount = (catName, typeName) =>
    allUploads.filter((u) => u.category === catName && u.subcategory === typeName).length;

  const totalFolders = Object.keys(categories).reduce(
    (sum, cat) => sum + 1 + Object.keys(categories[cat]?.types || {}).length,
    0
  );

  if (loading) return <div className={styles.loading}>⏳ Loading...</div>;
  if (!isAdmin) return null;

  return (
    <div className={styles.page}>
      <div className={styles.sidebar}>
        <div className={styles.logo}>
          🛡️ <span>ADMIN</span>
        </div>
        <div className={styles.navMenu}>
          <NavButton
            styles={styles}
            icon="📋"
            label="Pending"
            count={pendingUploads.length}
            active={activeTab === 'pending'}
            onClick={() => setActiveTab('pending')}
          />
          <NavButton
            styles={styles}
            icon="✅"
            label="Approved"
            count={allUploads.filter((u) => u.status === 'approved').length}
            active={activeTab === 'approved'}
            onClick={() => setActiveTab('approved')}
          />
          <NavButton
            styles={styles}
            icon="📁"
            label="Folders"
            count={totalFolders}
            active={activeTab === 'folders'}
            onClick={() => {
              setActiveTab('folders');
              setSelectedCategory(null);
            }}
          />
          <NavButton
            styles={styles}
            icon="📊"
            label="Analytics"
            active={activeTab === 'analytics'}
            onClick={() => setActiveTab('analytics')}
          />
        </div>
        <div className={styles.sidebarFooter}>
          <a href="/dashboard" className={styles.backButton}>
            ← Dashboard
          </a>
        </div>
      </div>

      <div className={styles.mainContent}>
        <div className={styles.header}>
          <h1 className={styles.title}>⚙️ Admin Control Panel</h1>
          <div className={styles.stats}>
            <StatCard styles={styles} label="Total" value={allUploads.length} />
            <StatCard styles={styles} label="Pending" value={pendingUploads.length} />
            <StatCard styles={styles} label="Approved" value={allUploads.filter((u) => u.status === 'approved').length} />
            <StatCard styles={styles} label="Folders" value={totalFolders} />
          </div>
        </div>

        <div className={styles.content}>
          {activeTab === 'pending' && (
            <div>
              <h2 className={styles.sectionTitle}>📋 Pending ({pendingUploads.length})</h2>
              {pendingUploads.length === 0 ? (
                <div className={styles.emptyState}>✨ No pending uploads!</div>
              ) : (
                <div className={styles.grid}>
                  {pendingUploads.map((upload) => (
                    <div key={upload.id} className={styles.uploadCard}>
                      {upload.fileUrl && upload.resourceType === 'image' && (
                        <img src={upload.fileUrl} alt={upload.title} className={styles.cardImage} />
                      )}
                      <h3 className={styles.cardTitle}>{upload.title}</h3>
                      <p className={styles.cardDesc}>{upload.description}</p>
                      <p className={styles.cardInfo}>
                        <strong>By:</strong> {upload.uploaderEmail}
                      </p>
                      <p className={styles.cardInfo}>
                        <strong>Category:</strong> {upload.category}
                        {upload.subcategory ? ` / ${upload.subcategory}` : ''}
                      </p>

                      {movingId === upload.id && (
                        <div className={styles.moveBox}>
                          <select
                            value={moveCategory}
                            onChange={(e) => {
                              setMoveCategory(e.target.value);
                              setMoveType('');
                            }}
                            className={styles.moveSelect}
                          >
                            {Object.keys(categories).map((cat) => (
                              <option key={cat} value={cat}>
                                {cat}
                              </option>
                            ))}
                          </select>
                          {Object.keys(categories[moveCategory]?.types || {}).length > 0 && (
                            <select
                              value={moveType}
                              onChange={(e) => setMoveType(e.target.value)}
                              className={styles.moveSelect}
                            >
                              <option value="">-- Type --</option>
                              {Object.keys(categories[moveCategory]?.types || {}).map((t) => (
                                <option key={t} value={t}>
                                  {t}
                                </option>
                              ))}
                            </select>
                          )}
                          <div className={styles.moveActions}>
                            <button onClick={() => handleMoveAsset(upload.id)} className={styles.moveSaveBtn}>
                              ✔ Save
                            </button>
                            <button onClick={closeMover} className={styles.moveCancelBtn}>
                              ✕ Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      <div className={styles.cardActions}>
                        <button onClick={() => handleApprove(upload.id)} className={styles.approveBtn}>
                          ✅ Approve
                        </button>
                        <button onClick={() => handleReject(upload.id)} className={styles.rejectBtn}>
                          ❌ Reject
                        </button>
                      </div>
                      <button
                        onClick={() => (movingId === upload.id ? closeMover() : openMover(upload))}
                        className={styles.moveBtn}
                      >
                        📁 Move to Folder
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'approved' && (
            <div>
              <h2 className={styles.sectionTitle}>
                ✅ Approved ({allUploads.filter((u) => u.status === 'approved').length})
              </h2>
              {allUploads.filter((u) => u.status === 'approved').length === 0 ? (
                <div className={styles.emptyState}>✨ None!</div>
              ) : (
                <div className={styles.grid}>
                  {allUploads
                    .filter((u) => u.status === 'approved')
                    .map((upload) => (
                      <div key={upload.id} className={styles.uploadCard}>
                        {upload.fileUrl && upload.resourceType === 'image' && (
                          <img src={upload.fileUrl} alt={upload.title} className={styles.cardImage} />
                        )}
                        <h3 className={styles.cardTitle}>{upload.title}</h3>
                        <p className={styles.cardDesc}>{upload.description}</p>
                        <p className={styles.cardInfo}>
                          <strong>Category:</strong> {upload.category}
                          {upload.subcategory ? ` / ${upload.subcategory}` : ''}
                        </p>

                        {movingId === upload.id && (
                          <div className={styles.moveBox}>
                            <select
                              value={moveCategory}
                              onChange={(e) => {
                                setMoveCategory(e.target.value);
                                setMoveType('');
                              }}
                              className={styles.moveSelect}
                            >
                              {Object.keys(categories).map((cat) => (
                                <option key={cat} value={cat}>
                                  {cat}
                                </option>
                              ))}
                            </select>
                            {Object.keys(categories[moveCategory]?.types || {}).length > 0 && (
                              <select
                                value={moveType}
                                onChange={(e) => setMoveType(e.target.value)}
                                className={styles.moveSelect}
                              >
                                <option value="">-- Type --</option>
                                {Object.keys(categories[moveCategory]?.types || {}).map((t) => (
                                  <option key={t} value={t}>
                                    {t}
                                  </option>
                                ))}
                              </select>
                            )}
                            <div className={styles.moveActions}>
                              <button onClick={() => handleMoveAsset(upload.id)} className={styles.moveSaveBtn}>
                                ✔ Save
                              </button>
                              <button onClick={closeMover} className={styles.moveCancelBtn}>
                                ✕ Cancel
                              </button>
                            </div>
                          </div>
                        )}

                        <div className={styles.cardActions}>
                          <button
                            onClick={() => (movingId === upload.id ? closeMover() : openMover(upload))}
                            className={styles.moveBtnInline}
                          >
                            📁 Move
                          </button>
                          <button onClick={() => handleReject(upload.id)} className={styles.rejectBtn}>
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'folders' && (
            <div>
              {selectedCategory === null ? (
                <>
                  <h2 className={styles.sectionTitle}>📁 Categories</h2>
                  <div className={styles.createRow}>
                    <input
                      type="text"
                      placeholder="New category name..."
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCreateCategory()}
                      className={styles.input}
                    />
                    <button onClick={handleCreateCategory} className={styles.createBtn}>
                      ➕ Create
                    </button>
                  </div>

                  <div className={styles.folderGrid}>
                    {Object.keys(categories).map((catName) => (
                      <div key={catName} className={styles.folderCard} onClick={() => setSelectedCategory(catName)}>
                        <button
                          className={styles.deleteX}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCategory(catName);
                          }}
                        >
                          ✕
                        </button>
                        <div className={styles.folderEmoji}>{categoryIcons[catName] || '📁'}</div>
                        <div className={styles.folderLabel}>{catName}</div>
                        <div className={styles.folderCount}>{getCategoryAssetCount(catName)} assets</div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className={styles.breadcrumb}>
                    <button onClick={() => setSelectedCategory(null)}>📁 Categories</button>
                    <span>/</span>
                    <span>{selectedCategory}</span>
                  </div>
                  <h2 className={styles.sectionTitle}>
                    {categoryIcons[selectedCategory] || '📁'} {selectedCategory} — Types
                  </h2>
                  <div className={styles.createRow}>
                    <input
                      type="text"
                      placeholder="New type name (e.g. Memes, Gaming...)"
                      value={newTypeName}
                      onChange={(e) => setNewTypeName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCreateType()}
                      className={styles.input}
                    />
                    <button onClick={handleCreateType} className={styles.createBtn}>
                      ➕ Create
                    </button>
                  </div>

                  <div className={styles.folderGrid}>
                    {Object.keys(categories[selectedCategory]?.types || {}).map((typeName) => (
                      <div key={typeName} className={styles.folderCard}>
                        <button
                          className={styles.deleteX}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteType(selectedCategory, typeName);
                          }}
                        >
                          ✕
                        </button>
                        <div className={styles.folderEmoji}>{typeIcons[typeName] || '🏷️'}</div>
                        <div className={styles.folderLabel}>{typeName}</div>
                        <div className={styles.folderCount}>
                          {getTypeAssetCount(selectedCategory, typeName)} assets
                        </div>
                      </div>
                    ))}
                    {Object.keys(categories[selectedCategory]?.types || {}).length === 0 && (
                      <div className={styles.emptyState}>✨ Abhi koi type nahi. Upar se add karein!</div>
                    )}
                  </div>

                  <h2 className={styles.sectionTitle} style={{ marginTop: '34px' }}>
                    📄 Files in {selectedCategory} ({getCategoryAssets(selectedCategory).length})
                  </h2>
                  {getCategoryAssets(selectedCategory).length === 0 ? (
                    <div className={styles.emptyState}>✨ Is category mein abhi koi file nahi!</div>
                  ) : (
                    <div className={styles.grid}>
                      {getCategoryAssets(selectedCategory).map((upload) => (
                        <div key={upload.id} className={styles.uploadCard}>
                          {upload.fileUrl && upload.resourceType === 'image' && (
                            <img src={upload.fileUrl} alt={upload.title} className={styles.cardImage} />
                          )}

                          {editingAssetId === upload.id ? (
                            <>
                              <input
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className={styles.input}
                                placeholder="Title"
                                style={{ marginBottom: '8px' }}
                              />
                              <textarea
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                                className={styles.input}
                                placeholder="Description"
                                rows={2}
                                style={{ marginBottom: '8px', resize: 'vertical' }}
                              />
                              <div className={styles.moveActions}>
                                <button onClick={() => handleSaveEdit(upload.id)} className={styles.moveSaveBtn}>
                                  ✔ Save
                                </button>
                                <button onClick={closeEditor} className={styles.moveCancelBtn}>
                                  ✕ Cancel
                                </button>
                              </div>
                              <button
                                onClick={() => {
                                  if (confirm(`"${upload.title}" delete karein? Ye permanent hoga.`)) {
                                    handleReject(upload.id);
                                    closeEditor();
                                  }
                                }}
                                className={styles.deleteFullBtn}
                              >
                                🗑️ Delete File
                              </button>
                            </>
                          ) : (
                            <>
                              <h3 className={styles.cardTitle}>{upload.title}</h3>
                              <p className={styles.cardDesc}>{upload.description}</p>
                              <p className={styles.cardInfo}>
                                <strong>Status:</strong> {upload.status}
                                {upload.subcategory ? ` · ${upload.subcategory}` : ' · No type'}
                              </p>

                              {movingId === upload.id && (
                                <div className={styles.moveBox}>
                                  <select
                                    value={moveCategory}
                                    onChange={(e) => {
                                      setMoveCategory(e.target.value);
                                      setMoveType('');
                                    }}
                                    className={styles.moveSelect}
                                  >
                                    {Object.keys(categories).map((cat) => (
                                      <option key={cat} value={cat}>
                                        {cat}
                                      </option>
                                    ))}
                                  </select>
                                  {Object.keys(categories[moveCategory]?.types || {}).length > 0 && (
                                    <select
                                      value={moveType}
                                      onChange={(e) => setMoveType(e.target.value)}
                                      className={styles.moveSelect}
                                    >
                                      <option value="">-- Type --</option>
                                      {Object.keys(categories[moveCategory]?.types || {}).map((t) => (
                                        <option key={t} value={t}>
                                          {t}
                                        </option>
                                      ))}
                                    </select>
                                  )}
                                  <div className={styles.moveActions}>
                                    <button onClick={() => handleMoveAsset(upload.id)} className={styles.moveSaveBtn}>
                                      ✔ Save
                                    </button>
                                    <button onClick={closeMover} className={styles.moveCancelBtn}>
                                      ✕ Cancel
                                    </button>
                                  </div>
                                </div>
                              )}

                              <div className={styles.cardActions}>
                                <button onClick={() => openEditor(upload)} className={styles.moveBtnInline}>
                                  ✏️ Edit
                                </button>
                                <button
                                  onClick={() => (movingId === upload.id ? closeMover() : openMover(upload))}
                                  className={styles.moveBtnInline}
                                >
                                  📁 Move
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div>
              <h2 className={styles.sectionTitle}>📊 Analytics</h2>
              <div className={styles.analyticsGrid}>
                <AnalyticsCard styles={styles} title="Total Uploads" value={allUploads.length} />
                <AnalyticsCard styles={styles} title="Pending Review" value={pendingUploads.length} />
                <AnalyticsCard
                  styles={styles}
                  title="Approved"
                  value={allUploads.filter((u) => u.status === 'approved').length}
                />
                <AnalyticsCard
                  styles={styles}
                  title="Downloads"
                  value={allUploads.reduce((sum, u) => sum + (u.downloads || 0), 0)}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function NavButton({ styles, icon, label, count, active, onClick }) {
  return (
    <button onClick={onClick} className={`${styles.navBtn} ${active ? styles.navBtnActive : ''}`}>
      <span>{icon}</span>
      <span>{label}</span>
      {count > 0 && <span className={styles.badge}>{count}</span>}
    </button>
  );
}

function StatCard({ styles, label, value }) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statLabel}>{label}</div>
      <div className={styles.statValue}>{value}</div>
    </div>
  );
}

function AnalyticsCard({ styles, title, value }) {
  return (
    <div className={styles.analyticsCard}>
      <p className={styles.analyticsTitle}>{title}</p>
      <p className={styles.analyticsValue}>{value}</p>
    </div>
  );
}
