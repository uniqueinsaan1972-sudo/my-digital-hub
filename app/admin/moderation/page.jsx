"use client";

import { useState, useEffect } from 'react';
import { database } from '../../lib/firebase';
import { ref, onValue, set, remove, update } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import styles from '../../../styles/admin.module.css';

const ADMIN_UIDS = ['pKOAZXiqNiOX44YWGFhXekr2OgJ2'];

const DEFAULT_CATEGORIES = {
  Images: { createdAt: new Date().toISOString() },
  Graphics: { createdAt: new Date().toISOString() },
  Videos: {
    createdAt: new Date().toISOString(),
    types: { Meme: true, Gaming: true, 'Free Fire Montage': true, Tutorial: true, Other: true },
  },
  APKs: { createdAt: new Date().toISOString() },
};

function sanitizeKey(name) {
  return name.trim().replace(/[.#$\[\]\/]/g, '-');
}

// 🆕 Cloudinary Upload Component
function ThumbnailUploader({ uploadId, currentThumbnailUrl, onThumbnailAdded }) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentThumbnailUrl || '');
  const [urlInput, setUrlInput] = useState('');
  const [uploadMode, setUploadMode] = useState('url'); // 'url' or 'base64'

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'getuniquevault');

      const response = await fetch('https://api.cloudinary.com/v1_1/jt3vstt9/image/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.secure_url) {
        setPreviewUrl(data.secure_url);
        onThumbnailAdded(uploadId, data.secure_url);
      } else {
        alert('❌ Upload failed');
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
    setUploading(false);
  };

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) {
      alert('URL enter karo');
      return;
    }
    setPreviewUrl(urlInput);
    onThumbnailAdded(uploadId, urlInput);
    setUrlInput('');
  };

  return (
    <div style={{
      marginTop: '12px',
      padding: '10px',
      backgroundColor: '#f5f5f5',
      borderRadius: '8px',
      borderLeft: '4px solid #ff6b6b'
    }}>
      <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>
        🖼️ Thumbnail Add Karo:
      </div>

      {previewUrl && (
        <div style={{ marginBottom: '10px' }}>
          <img src={previewUrl} alt="Preview" style={{
            width: '100%',
            maxHeight: '120px',
            objectFit: 'cover',
            borderRadius: '6px'
          }} />
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
        <button
          onClick={() => setUploadMode('url')}
          style={{
            flex: 1,
            padding: '6px',
            backgroundColor: uploadMode === 'url' ? '#4CAF50' : '#ddd',
            color: uploadMode === 'url' ? '#fff' : '#000',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          🔗 URL
        </button>
        <button
          onClick={() => setUploadMode('base64')}
          style={{
            flex: 1,
            padding: '6px',
            backgroundColor: uploadMode === 'base64' ? '#4CAF50' : '#ddd',
            color: uploadMode === 'base64' ? '#fff' : '#000',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          📤 File
        </button>
      </div>

      {uploadMode === 'url' ? (
        <div style={{ display: 'flex', gap: '4px' }}>
          <input
            type="text"
            placeholder="Image URL paste karo..."
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
            style={{
              flex: 1,
              padding: '6px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              fontSize: '12px'
            }}
          />
          <button
            onClick={handleUrlSubmit}
            style={{
              padding: '6px 10px',
              backgroundColor: '#2196F3',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            ✔️
          </button>
        </div>
      ) : (
        <label style={{
          display: 'block',
          padding: '8px',
          backgroundColor: '#e8f5e9',
          border: '2px dashed #4CAF50',
          borderRadius: '4px',
          cursor: 'pointer',
          textAlign: 'center',
          fontSize: '12px',
          color: '#2e7d32'
        }}>
          📁 Image select karo
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={uploading}
            style={{ display: 'none' }}
          />
        </label>
      )}

      {uploading && <div style={{ marginTop: '6px', fontSize: '12px', color: '#ff9800' }}>⏳ Upload hो रहा hai...</div>}
    </div>
  );
}

export default function Moderation() {
  const [pendingUploads, setPendingUploads] = useState([]);
  const [allUploads, setAllUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');

  const [categories, setCategories] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newTypeName, setNewTypeName] = useState('');

  const [movingId, setMovingId] = useState(null);
  const [moveCategory, setMoveCategory] = useState('');
  const [moveType, setMoveType] = useState('');

  const [editingAssetId, setEditingAssetId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  // 🆕 Thumbnail editor state
  const [thumbnailEditorId, setThumbnailEditorId] = useState(null);

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

  // 🆕 Thumbnail save handler
  const handleThumbnailAdded = async (uploadId, thumbnailUrl) => {
    try {
      await update(ref(database, `assets/${uploadId}`), {
        thumbnailUrl: thumbnailUrl,
      });
      setThumbnailEditorId(null);
      alert('✅ Thumbnail saved!');
    } catch (e) {
      alert('Error saving thumbnail: ' + e.message);
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
                      {/* 🆕 Show thumbnail or fallback to file thumbnail */}
                      {upload.thumbnailUrl ? (
                        <img src={upload.thumbnailUrl} alt={upload.title} className={styles.cardImage} />
                      ) : upload.fileUrl && upload.resourceType === 'image' ? (
                        <img src={upload.fileUrl} alt={upload.title} className={styles.cardImage} />
                      ) : (
                        <div className={styles.cardImagePlaceholder}>
                          {upload.category === 'APKs' && '📱'}
                          {upload.category === 'Videos' && '🎬'}
                          {upload.category === 'Graphics' && '🎨'}
                          {upload.category === 'Images' && '🖼️'}
                          {!upload.category && '📦'}
                        </div>
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

                      {/* 🆕 Thumbnail editor toggle button */}
                      <button
                        onClick={() =>
                          setThumbnailEditorId(thumbnailEditorId === upload.id ? null : upload.id)
                        }
                        className={styles.moveBtnInline}
                        style={{ marginBottom: '8px' }}
                      >
                        🖼️ {upload.thumbnailUrl ? 'Edit' : 'Add'} Thumbnail
                      </button>

                      {thumbnailEditorId === upload.id && (
                        <ThumbnailUploader
                          uploadId={upload.id}
                          currentThumbnailUrl={upload.thumbnailUrl}
                          onThumbnailAdded={handleThumbnailAdded}
                        />
                      )}

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
                        {/* 🆕 Show thumbnail or fallback */}
                        {upload.thumbnailUrl ? (
                          <img src={upload.thumbnailUrl} alt={upload.title} className={styles.cardImage} />
                        ) : upload.fileUrl && upload.resourceType === 'image' ? (
                          <img src={upload.fileUrl} alt={upload.title} className={styles.cardImage} />
                        ) : (
                          <div className={styles.cardImagePlaceholder}>
                            {upload.category === 'APKs' && '📱'}
                            {upload.category === 'Videos' && '🎬'}
                            {upload.category === 'Graphics' && '🎨'}
                            {upload.category === 'Images' && '🖼️'}
                            {!upload.category && '📦'}
                          </div>
                        )}

                        <h3 className={styles.cardTitle}>{upload.title}</h3>
                        <p className={styles.cardDesc}>{upload.description}</p>
                        <p className={styles.cardInfo}>
                          <strong>Category:</strong> {upload.category}
                          {upload.subcategory ? ` / ${upload.subcategory}` : ''}
                        </p>

                        {/* 🆕 Thumbnail editor for approved */}
                        <button
                          onClick={() =>
                            setThumbnailEditorId(thumbnailEditorId === upload.id ? null : upload.id)
                          }
                          className={styles.moveBtnInline}
                          style={{ marginBottom: '8px' }}
                        >
                          🖼️ {upload.thumbnailUrl ? 'Edit' : 'Add'} Thumbnail
                        </button>

                        {thumbnailEditorId === upload.id && (
                          <ThumbnailUploader
                            uploadId={upload.id}
                            currentThumbnailUrl={upload.thumbnailUrl}
                            onThumbnailAdded={handleThumbnailAdded}
                          />
                        )}

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
                          {/* 🆕 Thumbnail display */}
                          {upload.thumbnailUrl ? (
                            <img src={upload.thumbnailUrl} alt={upload.title} className={styles.cardImage} />
                          ) : upload.fileUrl && upload.resourceType === 'image' ? (
                            <img src={upload.fileUrl} alt={upload.title} className={styles.cardImage} />
                          ) : (
                            <div className={styles.cardImagePlaceholder}>
                              {upload.category === 'APKs' && '📱'}
                              {upload.category === 'Videos' && '🎬'}
                              {upload.category === 'Graphics' && '🎨'}
                              {upload.category === 'Images' && '🖼️'}
                              {!upload.category && '📦'}
                            </div>
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

                              {/* 🆕 Thumbnail editor */}
                              <button
                                onClick={() =>
                                  setThumbnailEditorId(thumbnailEditorId === upload.id ? null : upload.id)
                                }
                                className={styles.moveBtnInline}
                                style={{ marginBottom: '8px' }}
                              >
                                🖼️ {upload.thumbnailUrl ? 'Edit' : 'Add'} Thumbnail
                              </button>

                              {thumbnailEditorId === upload.id && (
                                <ThumbnailUploader
                                  uploadId={upload.id}
                                  currentThumbnailUrl={upload.thumbnailUrl}
                                  onThumbnailAdded={handleThumbnailAdded}
                                />
                              )}

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
