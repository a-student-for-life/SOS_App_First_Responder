// src/services/firebase.js
// ─────────────────────────────────────────────────────────
// SETUP INSTRUCTIONS:
//  1. Go to https://console.firebase.google.com
//  2. Create a new project (e.g. "NearbyResponder")
//  3. Add a Web app inside the project
//  4. Copy the firebaseConfig values shown and paste below
//  5. In Firebase console → Firestore Database → Create database (start in test mode)
//  6. In Firebase console → Authentication → Sign-in method → Enable "Anonymous"
// ─────────────────────────────────────────────────────────

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
   apiKey: "AIzaSyBI_IaIHWZI4uSaLuEM2fNP4u6n5vtXPU8",
  authDomain: "nearbyresponder.firebaseapp.com",
  projectId: "nearbyresponder",
  storageBucket: "nearbyresponder.firebasestorage.app",
  messagingSenderId: "602896300272",
  appId: "1:602896300272:web:a4156eeb1e507fcc1daa35",
  measurementId: "G-X3LFQS07XV"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
