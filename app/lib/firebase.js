import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBoD9n9Ec7_UeoiHRclmYN22W5Po56O5cc",
  authDomain: "getuniquevault.firebaseapp.com",
  projectId: "getuniquevault",
  storageBucket: "getuniquevault.firebasestorage.app",
  messagingSenderId: "517266897817",
  appId: "1:517266897817:web:936198497cbeb5cb833108",
  measurementId: "G-QC4GKN8DZ4"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);