// src/services/StressTest.js
import { collection, addDoc, serverTimestamp, GeoPoint } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Generates multiple mock SOS alerts to test system performance.
 */
export async function runStressTest(centerLat, centerLng, count = 20) {
  console.log(`Starting stress test: Creating ${count} alerts...`);
  
  const emergencyTypes = ['Medical', 'Accident', 'Fire', 'Security'];
  const promises = [];

  for (let i = 0; i < count; i++) {
    // Generate random coordinates within ~5km radius
    const latOffset = (Math.random() - 0.5) * 0.05;
    const lngOffset = (Math.random() - 0.5) * 0.05;
    const lat = centerLat + latOffset;
    const lng = centerLng + lngOffset;

    const promise = addDoc(collection(db, 'sos_alerts'), {
      victimId: `stress_test_user_${i}`,
      location: new GeoPoint(lat, lng),
      lat,
      lng,
      status: 'broadcasting',
      responderId: null,
      responderName: null,
      emergencyType: emergencyTypes[Math.floor(Math.random() * emergencyTypes.length)],
      timestamp: Date.now() - Math.floor(Math.random() * 3600000), // Random time in last hour
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isMock: true,
    });
    
    promises.push(promise);
  }

  try {
    await Promise.all(promises);
    console.log('Stress test complete: All alerts generated.');
    return true;
  } catch (e) {
    console.error('Stress test failed:', e);
    throw e;
  }
}
