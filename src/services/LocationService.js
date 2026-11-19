// src/services/LocationService.js
import * as Location from 'expo-location';

export async function requestLocationPermission() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Location permission denied');
  }
  return true;
}

export async function getCurrentLocation() {
  await requestLocationPermission();
  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
  });
  return {
    lat: location.coords.latitude,
    lng: location.coords.longitude,
    accuracy: location.coords.accuracy,
  };
}

export function watchLocation(callback) {
  let subscription = null;

  Location.requestForegroundPermissionsAsync().then(({ status }) => {
    if (status !== 'granted') return;
    Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
        distanceInterval: 10,
      },
      (location) => {
        callback({
          lat: location.coords.latitude,
          lng: location.coords.longitude,
        });
      }
    ).then(sub => {
      subscription = sub;
    });
  });

  // Return cleanup function
  return () => {
    if (subscription) subscription.remove();
  };
}

/**
 * Current position, or null if it can't be found within `timeoutMs`.
 * Falls back to the phone's last known position.
 */
export async function getFreshLocation(timeoutMs = 8000) {
  try {
    const fix = await Promise.race([
      getCurrentLocation(),
      new Promise((resolve) => setTimeout(() => resolve(null), timeoutMs)),
    ]);
    if (fix) return fix;
  } catch (e) {
    // permission denied or GPS off: try the last known position below
  }
  try {
    const last = await Location.getLastKnownPositionAsync();
    if (last) return { lat: last.coords.latitude, lng: last.coords.longitude, accuracy: last.coords.accuracy };
  } catch (e) {
    // ignore
  }
  return null;
}

// Distance helpers live in SOSService.getDistanceKm.
