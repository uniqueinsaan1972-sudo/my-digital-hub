"use client";

import { useState, useEffect } from 'react';
import { database } from '../../lib/firebase';
import { ref, onValue, set, remove } from 'firebase/database';
import { getAuth } from 'firebase/auth';

export default function Moderation() {
  const [pendingUploads, setPendingUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

  useEffect(() => {
    const uploadsRef = ref(database, 'assets');
    
    const unsubscribe = onValue(uploadsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const pending = Object.entries(data)
          .filter(([, upload]) => upload.status === 'pending')
          .map(([id, upload]) => ({ id, ...upload }));
        setPendingUploads(pending);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleApprove = async (uploadId) => {
    try {
      const statusRef = ref(database, `assets/${uploadId}/status`);
      await set(statusRef, 'approved');
      alert('✅ Upload Approved!');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleReject = async (uploadId) => {
    try {
      const uploadRef = ref(database, `assets/${uploadId}`);
      await remove(uploadRef);
      alert('❌ Upload Rejected!');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loading) return <div style={{ padding: '20px' }}>Loading...</div>;

  return (
    <div style={{ padding: '20px', backgroundColor: '#1a1a2e', minHeight: '100vh', color: 'white' }}>
      <a href="/dashboard" style={{ color: '#60a5fa', textDecoration: 'none', marginBottom: '20px', display: 'inline-block' }}>
        ← Back to Dashboard
      </a>
      
      <h1>🛡️ Admin Moderation</h1>
      <p>Pending: {pendingUploads.length}</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
        {pendingUploads.map((upload) => (
          <div key={upload.id} style={{ border: '2px solid #0f3460', padding: '15px', borderRadius: '10px', backgroundColor: '#16213e' }}>
            {upload.fileUrl && upload.resourceType === 'image' && (
              <img src={upload.fileUrl} alt={upload.title} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px', marginBottom: '10px' }} />
            )}
            
            <h3>{upload.title}</h3>
            <p><strong>By:</strong> {upload.uploaderEmail}</p>
            <p><strong>Category:</strong> {upload.category}</p>

            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <button
                onClick={() => handleApprove(upload.id)}
                style={{ flex: 1, padding: '10px', backgroundColor: '#00d084', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                ✅ Approve
              </button>
              <button
                onClick={() => handleReject(upload.id)}
                style={{ flex: 1, padding: '10px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                ❌ Reject
              </button>
            </div>
          </div>
        ))}
      </div>

      {pendingUploads.length === 0 && (
        <div style={{ textAlign: 'center', marginTop: '40px', fontSize: '18px', color: '#888' }}>
          ✨ No pending uploads!
        </div>
      )}
    </div>
  );
}