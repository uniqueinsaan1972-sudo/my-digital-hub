"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, database } from "../lib/firebase";
import { ref, get, update } from "firebase/database";
import { useRouter } from "next/navigation";
import styles from "../../styles/profile.module.css";

function maskEmail(email) {
  if (!email) return "";
  const [local, domain] = email.split("@");
  if (local.length <= 5) return email;
  const start = local.slice(0, 4);
  const end = local.slice(-1);
  const stars = "*".repeat(Math.max(local.length - 5, 3));
  return `${start}${stars}${end}@${domain}`;
}

export default function Profile() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [about, setAbout] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [youtube, setYoutube] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userRef = ref(database, "users/" + currentUser.uid);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          setUserData(data);
          setName(data.name || "");
          setAbout(data.about || "");
          setPhotoPreview(data.photoUrl || "");
          setYoutube(data.social?.youtube || "");
          setTiktok(data.social?.tiktok || "");
          setInstagram(data.social?.instagram || "");
          setFacebook(data.social?.facebook || "");
        }
      } else {
        router.push("/login");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let photoUrl = userData?.photoUrl || "";

      if (photoFile) {
        const formData = new FormData();
        formData.append("file", photoFile);
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (res.ok) {
          photoUrl = data.url;
        }
      }

      const userRef = ref(database, "users/" + user.uid);
      await update(userRef, {
        name: name.trim() || userData.name,
        about: about.slice(0, 150),
        photoUrl,
        social: {
          youtube: youtube.trim(),
          tiktok: tiktok.trim(),
          instagram: instagram.trim(),
          facebook: facebook.trim(),
        },
      });

      setUserData((prev) => ({
        ...prev,
        name: name.trim() || prev.name,
        about: about.slice(0, 150),
        photoUrl,
        social: { youtube, tiktok, instagram, facebook },
      }));
      setPhotoFile(null);
      setEditing(false);
    } catch (err) {
      console.error("Profile save error:", err);
      alert("Kuch masla ho gaya, dobara try karo");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className={styles.loadingScreen}>Loading...</div>;
  }

  if (!user) return null;

  const initial = (userData?.name || "U").charAt(0).toUpperCase();

  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <button onClick={() => router.push("/dashboard")} className={styles.backBtn}>
          ← Dashboard
        </button>
      </div>

      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.avatarWrap}>
            {photoPreview ? (
              <img src={photoPreview} alt="Profile" className={styles.avatarImg} />
            ) : (
              <div className={styles.avatarFallback}>{initial}</div>
            )}
            {editing && (
              <label className={styles.avatarEditBtn}>
                📷
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  style={{ display: "none" }}
                />
              </label>
            )}
          </div>

          {!editing ? (
            <>
              <h1 className={styles.name}>{userData?.name || "User"}</h1>
              <p className={styles.email}>{maskEmail(userData?.email || user.email)}</p>

              {userData?.about && (
                <p className={styles.about}>{userData.about}</p>
              )}

              {(userData?.social?.youtube ||
                userData?.social?.tiktok ||
                userData?.social?.instagram ||
                userData?.social?.facebook) && (
                <div className={styles.socialRow}>
                  {userData?.social?.youtube && (
                    <a href={userData.social.youtube} target="_blank" rel="noreferrer" className={styles.socialIcon}>▶️</a>
                  )}
                  {userData?.social?.tiktok && (
                    <a href={userData.social.tiktok} target="_blank" rel="noreferrer" className={styles.socialIcon}>🎵</a>
                  )}
                  {userData?.social?.instagram && (
                    <a href={userData.social.instagram} target="_blank" rel="noreferrer" className={styles.socialIcon}>📸</a>
                  )}
                  {userData?.social?.facebook && (
                    <a href={userData.social.facebook} target="_blank" rel="noreferrer" className={styles.socialIcon}>📘</a>
                  )}
                </div>
              )}

              <button onClick={() => setEditing(true)} className={styles.editBtn}>
                Edit Profile
              </button>
            </>
          ) : (
            <div className={styles.editForm}>
              <label className={styles.label}>Username</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={styles.input}
              />

              <label className={styles.label}>About (max 150 characters)</label>
              <textarea
                value={about}
                onChange={(e) => setAbout(e.target.value.slice(0, 150))}
                rows={3}
                className={styles.textarea}
                placeholder="Apne baare mein kuch likho..."
              />
              <p className={styles.charCount}>{about.length}/150</p>

              <label className={styles.label}>YouTube link</label>
              <input
                type="text"
                value={youtube}
                onChange={(e) => setYoutube(e.target.value)}
                className={styles.input}
                placeholder="https://youtube.com/@username"
              />

              <label className={styles.label}>TikTok link</label>
              <input
                type="text"
                value={tiktok}
                onChange={(e) => setTiktok(e.target.value)}
                className={styles.input}
                placeholder="https://tiktok.com/@username"
              />

              <label className={styles.label}>Instagram link</label>
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                className={styles.input}
                placeholder="https://instagram.com/username"
              />

              <label className={styles.label}>Facebook link</label>
              <input
                type="text"
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
                className={styles.input}
                placeholder="https://facebook.com/username"
              />

              <div className={styles.editActions}>
                <button
                  onClick={() => setEditing(false)}
                  className={styles.cancelBtn}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button onClick={handleSave} className={styles.saveBtn} disabled={saving}>
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}