"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, database } from "../lib/firebase";
import { ref, push, set, onValue } from "firebase/database";
import { useRouter } from "next/navigation";
import styles from "../../styles/upload.module.css";

export default function Upload() {
  // ========== STATE MANAGEMENT ==========
  const [user, setUser] = useState(null);
  const [uploadMode, setUploadMode] = useState("file"); // "file" | "link"
  const [file, setFile] = useState(null);
  const [link, setLink] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [price, setPrice] = useState("Free");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [categories, setCategories] = useState({});

  const router = useRouter();

  // ========== AUTHENTICATION CHECK ==========
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  // ========== LOAD CATEGORIES FROM FIREBASE ==========
  useEffect(() => {
    const categoriesRef = ref(database, "categories");
    const unsubscribe = onValue(categoriesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setCategories(data);
        setCategory((prev) => prev || Object.keys(data)[0] || "");
      }
    });

    return () => unsubscribe();
  }, []);

  // ========== RESET SUBCATEGORY ON CATEGORY CHANGE ==========
  useEffect(() => {
    setSubcategory("");
  }, [category]);

  // ========== RESET FILE/LINK WHEN MODE CHANGES ==========
  useEffect(() => {
    setFile(null);
    setLink("");
    setError("");
  }, [uploadMode]);

  // ========== COMPUTED VALUES ==========
  const availableTypes = category ? Object.keys(categories[category]?.types || {}) : [];

  // Basic Google Drive link check (optional, keeps bad links out)
  const isValidLink = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // ========== UPLOAD HANDLER ==========
  const handleUpload = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (uploadMode === "file" && !file) {
      setError("Please select a file to upload");
      return;
    }

    if (uploadMode === "link" && !link.trim()) {
      setError("Please paste a link");
      return;
    }

    if (uploadMode === "link" && !isValidLink(link.trim())) {
      setError("Please paste a valid link");
      return;
    }

    if (!category) {
      setError("Please select a category");
      return;
    }

    setUploading(true);

    try {
      let assetData = {
        title,
        description,
        category,
        subcategory: subcategory || null,
        price,
        status: "pending",
        uploadedBy: user.uid,
        uploaderEmail: user.email,
        createdAt: new Date().toISOString(),
        downloads: 0,
      };

      if (uploadMode === "file") {
        // Upload file to Cloudinary via API
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Upload failed");
        }

        assetData = {
          ...assetData,
          fileUrl: data.url,
          publicId: data.publicId,
          resourceType: data.resourceType,
          format: data.format,
          sourceType: "file",
        };
      } else {
        // Link-based asset (e.g. Google Drive) — no Cloudinary upload needed
        assetData = {
          ...assetData,
          fileUrl: link.trim(),
          publicId: null,
          resourceType: "link",
          format: null,
          sourceType: "link",
        };
      }

      // Save metadata to Firebase
      const assetsRef = ref(database, "assets");
      const newAssetRef = push(assetsRef);
      await set(newAssetRef, assetData);

      // Reset form and show success
      setSuccess(true);
      setTitle("");
      setDescription("");
      setFile(null);
      setLink("");
      setSubcategory("");

      // Redirect after 1.5 seconds
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (err) {
      setError(err.message);
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  // ========== LOADING STATE ==========
  if (!user) {
    return <div className={styles.loadingScreen}>Loading...</div>;
  }

  // ========== RENDER ==========
  return (
    <div className={styles.page}>
      {/* Navigation */}
      <nav className={styles.navbar}>
        <a href="/dashboard" className={styles.logo}>
          ⚡ getuniquevault
        </a>
        <a href="/dashboard" className={styles.backLink}>
          ← Dashboard
        </a>
      </nav>

      {/* Main Container */}
      <div className={styles.container}>
        <div className={styles.card}>
          <h1>📤 Upload Resource</h1>
          <p className={styles.subtitle}>Share your content with the community</p>

          {/* Error Message */}
          {error && <div className={styles.error}>{error}</div>}

          {/* Success Message */}
          {success && (
            <div className={styles.success}>
              ✅ Upload submitted successfully! 🎉 Awaiting admin review...
            </div>
          )}

          {/* Upload Form */}
          <form onSubmit={handleUpload}>
            {/* Mode Toggle: File vs Link */}
            <label className={styles.label}>Upload Type</label>
            <div style={{ display: "flex", gap: "10px", marginBottom: "14px" }}>
              <button
                type="button"
                onClick={() => setUploadMode("file")}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "8px",
                  border: uploadMode === "file" ? "2px solid #6366f1" : "1px solid #444",
                  background: uploadMode === "file" ? "#6366f122" : "transparent",
                  color: "inherit",
                  cursor: "pointer",
                }}
              >
                📁 File
              </button>
              <button
                type="button"
                onClick={() => setUploadMode("link")}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "8px",
                  border: uploadMode === "link" ? "2px solid #6366f1" : "1px solid #444",
                  background: uploadMode === "link" ? "#6366f122" : "transparent",
                  color: "inherit",
                  cursor: "pointer",
                }}
              >
                🔗 Link
              </button>
            </div>

            {/* File Input (conditional) */}
            {uploadMode === "file" && (
              <>
                <label className={styles.label}>Select File</label>
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  className={styles.fileInput}
                  required={uploadMode === "file"}
                />
              </>
            )}

            {/* Link Input (conditional) */}
            {uploadMode === "link" && (
              <>
                <label className={styles.label}>Paste Link (Google Drive, etc.)</label>
                <input
                  type="text"
                  placeholder="https://drive.google.com/file/d/..."
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  required={uploadMode === "link"}
                />
                <p style={{ fontSize: "12px", opacity: 0.7, marginTop: "-6px", marginBottom: "12px" }}>
                  Make sure the file's sharing is set to "Anyone with the link".
                </p>
              </>
            )}

            {/* Title Input */}
            <label className={styles.label}>Title</label>
            <input
              type="text"
              placeholder="Example: Modern UI Design Kit"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            {/* Description Input */}
            <label className={styles.label}>Description</label>
            <textarea
              placeholder="Write a brief description of your content..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />

            {/* Category Select */}
            <label className={styles.label}>Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {Object.keys(categories).length === 0 && <option value="">Loading...</option>}
              {Object.keys(categories).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Type Select (Conditional) */}
            {availableTypes.length > 0 && (
              <>
                <label className={styles.label}>Type</label>
                <select value={subcategory} onChange={(e) => setSubcategory(e.target.value)}>
                  <option value="">-- Choose Type --</option>
                  {availableTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </>
            )}

            {/* Price Select */}
            <label className={styles.label}>Price</label>
            <select value={price} onChange={(e) => setPrice(e.target.value)}>
              <option value="Free">Free</option>
              <option value="Paid">Paid (Coming Soon)</option>
            </select>

            {/* Submit Button */}
            <button type="submit" disabled={uploading}>
              {uploading ? "Uploading..." : "Upload Now"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
