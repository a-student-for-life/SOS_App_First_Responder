// src/services/SMSService.js
import { Linking, Platform } from 'react-native';
import * as NotificationService from './NotificationService';

/**
 * Handles the emergency SMS triggering logic.
 * In a real production app, this would ideally use a backend API (like Twilio)
 * to send background SMS, as mobile OS's block background SMS for security.
 * 
 * For this DEMO:
 * 1. It simulates the "Automatic Trigger" with a high-priority notification.
 * 2. It prepares the real system SMS link as a fallback.
 */
export async function sendEmergencySMS(contacts, location) {
  if (!contacts || contacts.length === 0) return;

  const locationUrl = `https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`;
  const message = `EMERGENCY SOS: I need help! My current location is: ${locationUrl}`;

  console.log(`[DEMO] Triggering Emergency SMS to: ${contacts.map(c => c.name).join(', ')}`);
  console.log(`[DEMO] Message: ${message}`);

  // 1. SIMULATED TRIGGER (For Demo purposes)
  // We show a local notification to "confirm" to the user that the system has acted.
  await NotificationService.sendSMSConfirmationNotification(contacts.length);

  // 2. REAL FALLBACK (Open Native SMS)
  // We'll prepare the numbers. Note: Different separators for iOS/Android
  const separator = Platform.OS === 'ios' ? ';' : ',';
  const recipients = contacts.map(c => c.phone).join(separator);
  const url = `sms:${recipients}${Platform.OS === 'ios' ? '&' : '?'}body=${encodeURIComponent(message)}`;

  // We don't want to interrupt the SOS screen immediately, 
  // but we provide the capability to open it if needed.
  // In a real automated "Elite" system, this would happen via a server.
  return url;
}
