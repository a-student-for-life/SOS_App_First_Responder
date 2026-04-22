// src/services/firebase.js
import { initializeApp } from 'firebase/app';
import { initializeFirestore, CACHE_SIZE_UNLIMITED } from 'firebase/firestore';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

/**
 * ULTRA-STABLE CONFIGURATION FOR ANDROID EMULATORS/MOBILE
 * 1. experimentalForceLongPolling: True forces HTTP standard requests (no streams).
 * 2. experimentalAutoDetectLongPolling: False ensures it doesn't try to switch back.
 * 3. Use standard getFirestore for simpler setups if needed, but initializeFirestore is better for these flags.
 */
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  experimentalAutoDetectLongPolling: false,
});

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
