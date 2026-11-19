// src/services/SMSService.js
import { Platform } from 'react-native';
import * as NotificationService from './NotificationService';

/**
 * Prepares the emergency SMS to trusted contacts.
 *
 * Android and iOS do not let an app send SMS in the background, so nothing is
 * sent automatically. We build an sms: link with the numbers and message filled
 * in, and show a notification that opens it when tapped. Sending SMS without a
 * tap would need a server (e.g. Twilio).
 *
 * Returns the sms: URL (or null if there are no contacts).
 */
export async function sendEmergencySMS(contacts, location, { locationApprox = false } = {}) {
  const numbers = (contacts || []).map(c => c.phone).filter(Boolean);
  if (numbers.length === 0) return null;

  const locationUrl = `https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`;
  const message = locationApprox
    ? `EMERGENCY SOS: I need help! My exact location could not be found. Last known area: ${locationUrl}`
    : `EMERGENCY SOS: I need help! My current location is: ${locationUrl}`;

  // Different separators and query syntax for iOS and Android
  const separator = Platform.OS === 'ios' ? ';' : ',';
  const recipients = numbers.join(separator);
  const url = `sms:${recipients}${Platform.OS === 'ios' ? '&' : '?'}body=${encodeURIComponent(message)}`;

  await NotificationService.sendSMSReadyNotification(numbers.length, url);
  return url;
}
