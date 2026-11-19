// src/services/SOSService.js
// All real-time Firestore operations for SOS alerts
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
  GeoPoint,
  deleteDoc,
  getDoc,
  setDoc,
  runTransaction,
} from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { db, auth } from './firebase';

// ─── Auth ────────────────────────────────────────────────
export async function ensureSignedIn() {
  if (auth.currentUser) return auth.currentUser;
  const result = await signInAnonymously(auth);
  return result.user;
}

export function getCurrentUserId() {
  return auth.currentUser?.uid || null;
}

// ─── User Profile & Contacts ────────────────────────────
export async function getUserContacts() {
  const user = await ensureSignedIn();
  const userDoc = await getDoc(doc(db, 'users', user.uid));
  if (userDoc.exists()) {
    return userDoc.data().contacts || [];
  }
  return [];
}

export async function saveUserContacts(contacts) {
  const user = await ensureSignedIn();
  await setDoc(doc(db, 'users', user.uid), {
    contacts,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

// ─── Victim: Send SOS ────────────────────────────────────
/**
 * Creates a new SOS alert in Firestore.
 * Returns the document ID (used to track this alert).
 */
export async function sendSOS(lat, lng, { locationApprox = false } = {}) {
  const user = await ensureSignedIn();
  const docRef = await addDoc(collection(db, 'sos_alerts'), {
    victimId: user.uid,
    location: new GeoPoint(lat, lng),
    lat,
    lng,
    locationApprox,                    // true when no GPS fix was available
    status: 'broadcasting',
    responderId: null,
    responderName: null,
    emergencyType: 'Medical',          // default; can be parameterised later
    timestamp: Date.now(),             // client ms — available instantly for timeAgo()
    createdAt: serverTimestamp(),      // server canonical time
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

/**
 * Victim cancels or marks their own SOS as resolved.
 */
export async function resolveSOSAsVictim(alertId) {
  await updateDoc(doc(db, 'sos_alerts', alertId), {
    status: 'resolved',
    updatedAt: serverTimestamp(),
  });
}

/**
 * Victim listens to their own active alert for status changes
 * (e.g. waiting for a responder to accept).
 * Calls onChange(alertData) whenever the document changes.
 * Returns unsubscribe function.
 */
export function listenToMyAlert(alertId, onChange) {
  return onSnapshot(doc(db, 'sos_alerts', alertId), (snap) => {
    if (snap.exists()) {
      onChange({ id: snap.id, ...snap.data() });
    }
  });
}

// ─── Responder: Listen for nearby alerts ─────────────────
/**
 * Listens for all broadcasting alerts in real time.
 * Calls onChange(alertsArray) whenever the collection changes.
 * Returns unsubscribe function.
 *
 * NOTE: For production you'd add geo-filtering here.
 * For this project we show all active alerts to all responders.
 */
export function listenForAlerts(onChange) {
  const q = query(
    collection(db, 'sos_alerts'),
    where('status', 'in', ['broadcasting', 'accepted'])
  );
  return onSnapshot(q, (snapshot) => {
    const alerts = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    onChange(alerts);
  });
}

/**
 * Responder accepts an SOS alert.
 * Runs in a transaction so that only the first responder to accept wins:
 * if someone else already accepted (or the victim cancelled), this throws
 * an Error with code 'ALREADY_TAKEN' and nothing is written.
 */
export async function acceptSOS(alertId, responderName) {
  const user = await ensureSignedIn();
  const ref = doc(db, 'sos_alerts', alertId);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists() || snap.data().status !== 'broadcasting') {
      const err = new Error('This SOS has already been accepted or closed.');
      err.code = 'ALREADY_TAKEN';
      throw err;
    }
    tx.update(ref, {
      status: 'accepted',
      responderId: user.uid,
      responderName: responderName || 'Responder',
      updatedAt: serverTimestamp(),
    });
  });
}

/**
 * Responder marks help as complete — resolves the alert.
 */
export async function completeSOSAsResponder(alertId) {
  await updateDoc(doc(db, 'sos_alerts', alertId), {
    status: 'resolved',
    updatedAt: serverTimestamp(),
  });
}

export async function signOut() {
  await auth.signOut();
}

// ─── Helpers ─────────────────────────────────────────────
/**
 * Haversine distance in km between two lat/lng pairs.
 */
export function getDistanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return +(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(2);
}
