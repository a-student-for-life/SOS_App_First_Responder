// src/context/AppContext.js
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Alert, Linking } from 'react-native';
import * as Location from 'expo-location';
import {
  ensureSignedIn,
  sendSOS,
  resolveSOSAsVictim,
  listenToMyAlert,
  listenForAlerts,
  acceptSOS,
  completeSOSAsResponder,
  getDistanceKm,
  getUserContacts,
  saveUserContacts,
  signOut,
} from '../services/SOSService';
import * as NotificationService from '../services/NotificationService';
import { sendEmergencySMS } from '../services/SMSService';
import { getFreshLocation } from '../services/LocationService';

// Used only when no GPS fix or last known position exists. The alert is then
// marked locationApprox so responders and contacts know it isn't exact.
const FALLBACK_LOCATION = { lat: 19.2403, lng: 73.1305 };

const AppContext = createContext(null);

export const SOS_STATUS = {
  IDLE: 'idle',
  COUNTDOWN: 'countdown',
  BROADCASTING: 'broadcasting',
  ACCEPTED: 'accepted',
  RESOLVED: 'resolved',
};

export const USER_ROLE = {
  VICTIM: 'victim',
  RESPONDER: 'responder',
};

export function AppProvider({ children }) {
  const [userRole, setUserRole] = useState(USER_ROLE.VICTIM);
  const [sosStatus, setSosStatus] = useState(SOS_STATUS.IDLE);
  const [countdown, setCountdown] = useState(5);
  const [userLocation, setUserLocation] = useState(null);
  const [activeAlertId, setActiveAlertId] = useState(null);
  const [activeAlertData, setActiveAlertData] = useState(null);
  const [incomingAlerts, setIncomingAlerts] = useState([]);
  const [responderActiveAlert, setResponderActiveAlert] = useState(null);
  const [responderAvailable, setResponderAvailable] = useState(true);
  const [emergencyHistory, setEmergencyHistory] = useState([]);
  const [userId, setUserId] = useState(null);
  const [responderName, setResponderName] = useState('Responder');
  const [nearbyResponders, setNearbyResponders] = useState([]);
  const [trustedContacts, setTrustedContacts] = useState([]);

  const countdownRef = useRef(null);
  const alertListenerRef = useRef(null);
  const feedListenerRef = useRef(null);
  const seenAlertsRef = useRef(new Set());
  const freshLocationRef = useRef(null);       // GPS fix started when the countdown begins
  const acceptedNotifiedRef = useRef(false);   // "Responder found" shown once per SOS
  const cancelledRef = useRef(false);          // set if the user cancels while we wait for GPS

  // Tapping the "text your trusted contacts" notification opens the SMS app.
  useEffect(() => {
    const sub = NotificationService.addResponseListener((response) => {
      const smsUrl = response?.notification?.request?.content?.data?.smsUrl;
      if (smsUrl) Linking.openURL(smsUrl).catch((e) => console.warn('Could not open SMS app:', e));
    });
    return () => sub && sub.remove();
  }, []);

  useEffect(() => {
    if (userLocation) {
      // Mock some responders around the user
      const mocks = [
        { id: 'r1', lat: userLocation.lat + 0.002, lng: userLocation.lng + 0.001, name: 'Rahul' },
        { id: 'r2', lat: userLocation.lat - 0.001, lng: userLocation.lng + 0.003, name: 'Sonia' },
        { id: 'r3', lat: userLocation.lat + 0.003, lng: userLocation.lng - 0.002, name: 'Amit' },
      ];
      setNearbyResponders(mocks);
    }
  }, [userLocation]);

  useEffect(() => {
    (async () => {
      try {
        const user = await ensureSignedIn();
        setUserId(user.uid);
        
        // Fetch contacts
        const contacts = await getUserContacts();
        setTrustedContacts(contacts);
        
        // Request permissions
        await NotificationService.requestNotificationPermission();
        
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
          setUserLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
        }
      } catch (e) {
        console.warn('Init error:', e);
      }
    })();
  }, []);

  useEffect(() => {
    if (userRole !== USER_ROLE.RESPONDER || !responderAvailable) {
      if (feedListenerRef.current) { feedListenerRef.current(); feedListenerRef.current = null; }
      if (userRole !== USER_ROLE.RESPONDER) setIncomingAlerts([]);
      return;
    }
    feedListenerRef.current = listenForAlerts((alerts) => {
      const broadcasting = alerts.filter(a => a.status === 'broadcasting');
      
      // Check for new alerts
      broadcasting.forEach(a => {
        if (!seenAlertsRef.current.has(a.id)) {
          seenAlertsRef.current.add(a.id);
          const dist = userLocation 
            ? getDistanceKm(userLocation.lat, userLocation.lng, a.lat, a.lng)
            : 0;
          NotificationService.sendLocalSOSAlert('Someone', dist);
        }
      });

      const enriched = alerts
        .filter(a => a.status === 'broadcasting' || a.id === responderActiveAlert?.id)
        .map(a => ({
          ...a,
          distance: userLocation
            ? getDistanceKm(userLocation.lat, userLocation.lng, a.lat, a.lng)
            : 0,
        }));
      setIncomingAlerts(enriched);
    });
    return () => { if (feedListenerRef.current) feedListenerRef.current(); };
  }, [userRole, responderAvailable, userLocation]);

  const startSOS = () => {
    setSosStatus(SOS_STATUS.COUNTDOWN);
    setCountdown(5);
    // Get a fresh position during the countdown; the one from app start may be stale.
    cancelledRef.current = false;
    freshLocationRef.current = getFreshLocation(8000);
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          broadcastSOS();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const broadcastSOS = async () => {
    setSosStatus(SOS_STATUS.BROADCASTING);
    NotificationService.sendBroadcastingNotification();
    
    let fresh = null;
    try {
      fresh = freshLocationRef.current ? await freshLocationRef.current : null;
    } catch (e) {
      fresh = null;
    }
    freshLocationRef.current = null;
    if (cancelledRef.current) return; // cancelled while waiting for the GPS fix
    const loc = fresh || userLocation;
    const locationApprox = !loc;
    const { lat, lng } = loc || FALLBACK_LOCATION;
    if (fresh) setUserLocation({ lat: fresh.lat, lng: fresh.lng });

    // Phones don't allow silent SMS: this shows a "tap to text your contacts" notification.
    if (trustedContacts.length > 0) {
      sendEmergencySMS(trustedContacts, { lat, lng }, { locationApprox })
        .catch((e) => console.warn('SMS prompt failed:', e));
    }

    try {
      const alertId = await sendSOS(lat, lng, { locationApprox });
      setActiveAlertId(alertId);
      acceptedNotifiedRef.current = false;
      alertListenerRef.current = listenToMyAlert(alertId, (data) => {
        setActiveAlertData(data);
        if (data.status === 'accepted') {
          setSosStatus(SOS_STATUS.ACCEPTED);
          // A ref, not state: the listener's closure would always see the first value.
          if (!acceptedNotifiedRef.current) {
            acceptedNotifiedRef.current = true;
            NotificationService.sendSOSConfirmation(data.responderName, 5);
          }
        }
        if (data.status === 'resolved') {
          setSosStatus(SOS_STATUS.RESOLVED);
          setEmergencyHistory(prev => [{
            id: alertId,
            date: new Date().toISOString(),
            responder: data.responderName || 'Unknown',
            status: 'Resolved',
          }, ...prev]);
          setTimeout(() => {
            setSosStatus(SOS_STATUS.IDLE);
            setActiveAlertId(null);
            setActiveAlertData(null);
          }, 3000);
        }
      });
    } catch (e) {
      console.error('SOS broadcast failed:', e);
      setSosStatus(SOS_STATUS.IDLE);
    }
  };

  const cancelSOS = async () => {
    clearInterval(countdownRef.current);
    cancelledRef.current = true;
    if (activeAlertId) {
      await resolveSOSAsVictim(activeAlertId).catch(() => {});
      if (alertListenerRef.current) { alertListenerRef.current(); alertListenerRef.current = null; }
    }
    setSosStatus(SOS_STATUS.IDLE);
    setCountdown(5);
    setActiveAlertId(null);
    setActiveAlertData(null);
  };

  const resolveEmergency = async () => {
    if (activeAlertId) await resolveSOSAsVictim(activeAlertId).catch(() => {});
  };

  const acceptAlert = async (alert) => {
    try {
      await acceptSOS(alert.id, responderName);
      setResponderActiveAlert(alert);
    } catch (e) {
      if (e?.code === 'ALREADY_TAKEN') {
        Alert.alert('Already taken', 'Another responder has already accepted this SOS, or it was cancelled.');
      } else {
        console.error('Accept failed:', e);
        Alert.alert('Could not accept', 'Check your connection and try again.');
      }
    }
  };

  const completeAlert = async (alertId) => {
    try {
      await completeSOSAsResponder(alertId);
      setResponderActiveAlert(null);
    } catch (e) {
      console.error('Complete failed:', e);
    }
  };

  const updateContacts = async (newContacts) => {
    try {
      await saveUserContacts(newContacts);
      setTrustedContacts(newContacts);
    } catch (e) {
      console.error('Update contacts failed:', e);
    }
  };

  const logout = async () => {
    try {
      await signOut();
      setUserId(null);
      setSosStatus(SOS_STATUS.IDLE);
      setResponderActiveAlert(null);
      setActiveAlertId(null);
      setActiveAlertData(null);
    } catch (e) {
      console.error('Logout failed:', e);
    }
  };

  useEffect(() => {
    return () => {
      if (alertListenerRef.current) alertListenerRef.current();
      if (feedListenerRef.current) feedListenerRef.current();
    };
  }, []);

  return (
    <AppContext.Provider value={{
      userRole, setUserRole,
      sosStatus, countdown,
      startSOS, cancelSOS, resolveEmergency,
      userLocation,
      activeAlertData,
      incomingAlerts,
      acceptAlert,
      completeAlert,
      logout,
      emergencyHistory,
      responderAvailable, setResponderAvailable,
      responderActiveAlert,
      responderName, setResponderName,
      userId, setUserId,
      nearbyResponders,
      trustedContacts, updateContacts,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
