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

export async function sendSMSConfirmationNotification(contactCount) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '✉️ Trusted Contacts Alerted',
      body: `Emergency SMS and location sent to ${contactCount} trusted contacts.`,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
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
