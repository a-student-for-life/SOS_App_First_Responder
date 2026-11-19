// src/services/NotificationService.js
import * as Notifications from 'expo-notifications';

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function requestNotificationPermission() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
}

export async function sendLocalSOSAlert(victimName, distance) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🚨 SOS Alert Nearby',
      body: `${victimName || 'Someone'} needs help · ${distance} km away. Tap to respond.`,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.MAX,
      color: '#E8302A',
    },
    trigger: null, // Send immediately
  });
}

export async function sendSOSConfirmation(responderName, eta) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '✅ Responder Found',
      body: `${responderName} is on their way · ETA ~${eta} min`,
      sound: true,
    },
    trigger: null,
  });
}

export async function sendBroadcastingNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '📡 SOS Broadcasting',
      body: 'Alerting nearby responders. Keep your phone with you.',
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger: null,
  });
}

// Phones don't let apps send SMS silently, so we can't text contacts for the user.
// This notification says so plainly; tapping it opens the SMS app with the
// message and numbers filled in (handled by the response listener in AppContext).
export async function sendSMSReadyNotification(contactCount, smsUrl) {
  const who = contactCount === 1 ? '1 trusted contact' : `${contactCount} trusted contacts`;
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '✉️ Tap to text your trusted contacts',
      body: `Not sent yet. Tap to send your location to ${who}.`,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
      data: { smsUrl },
    },
    trigger: null,
  });
}

export function addNotificationListener(handler) {
  return Notifications.addNotificationReceivedListener(handler);
}

export function addResponseListener(handler) {
  return Notifications.addNotificationResponseReceivedListener(handler);
}
