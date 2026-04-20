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
 * Calculate distance between two coordinates using Haversine formula.
 * Returns distance in kilometers.
 */
export function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return +(R * c).toFixed(2);
}

function toRad(deg) {
  return deg * (Math.PI / 180);
}

/**
 * Find responders within a given radius (in km) of a location.
 */
export function findNearbyResponders(userLat, userLng, responders, radiusKm = 5) {
  return responders
    .map(r => ({
      ...r,
      distance: calculateDistance(userLat, userLng, r.lat, r.lng),
    }))
    .filter(r => r.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance);
}
