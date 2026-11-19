# Nearby Emergency Responder (SOS App)

A React Native (Expo) app that connects someone in an emergency with nearby volunteer responders in real time.

- **Victim:** tap SOS. After a 5-second countdown (cancel any time), the app broadcasts your location to responders and prepares a text message to your trusted contacts.
- **Responder:** receive SOS alerts with distance and time, accept one, navigate to the person, and mark it resolved.

## Features

- Real-time SOS alerts through Cloud Firestore listeners.
- A fresh GPS fix is taken during the countdown, falling back to the last known position. If no position can be found, the alert is marked *approximate* for responders and contacts.
- **Only one responder can accept an alert.** Accepting is a Firestore transaction, so if two people tap Accept at once, the second is told someone else already has it.
- **Trusted contacts:** Android and iOS don't let apps send SMS in the background. When an SOS starts, the app shows a notification: *"Tap to text your trusted contacts"*. Tapping it opens your SMS app with the numbers and a Google Maps link filled in. Nothing is sent until you press send.
- Local notifications for new alerts, a responder being found, and the SMS prompt.
- Profile with trusted contacts, emergency history, map view and navigation.

## Tech stack

Expo SDK 51, React Native 0.74, React Navigation, Firebase (Anonymous Auth + Cloud Firestore), expo-location, expo-notifications, react-native-maps / WebView map.

## Run

```bash
npm install
npx expo start            # scan the QR code with Expo Go, or
npx expo run:android      # build and run on a device/emulator
```

The Firebase config is in `src/services/firebase.js`. For the native map, add your Google Maps key in `app.json` (`android.config.googleMaps.apiKey`).

## Project layout

```
App.js                     entry point
src/context/AppContext.js  app state: SOS flow, responder feed, contacts
src/services/              Firestore (SOSService), location, notifications, SMS prompt
src/screens/               Welcome, Home, Alert inbox, Navigate, History, Profile
src/components/            SOS button, alert card, map
```

## Known limits

- Every signed-in user can read every active alert worldwide. For production, alerts should be filtered by area (geohash queries) and protected with Firestore security rules.
- Responders use anonymous sign-in, so anyone can act as a responder. Real use would need verified responder accounts.
- "Nearby responders" on the home screen are demo markers placed around you.
- Sending SMS automatically, without a tap, would need a server-side service such as Twilio.
