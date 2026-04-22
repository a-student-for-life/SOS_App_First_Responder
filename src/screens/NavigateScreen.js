// src/screens/NavigateScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Linking,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import WebMapView from '../components/WebMapView';
import { useApp } from '../context/AppContext';
import { listenToMyAlert } from '../services/SOSService';
import { COLORS, SPACING, RADIUS, SHADOW, FONTS } from '../theme';

// Real Map View
function RealMapView({ victimLat, victimLng, responderLat, responderLng }) {
  return (
    <WebMapView
      victimLat={victimLat}
      victimLng={victimLng}
      responderLat={responderLat}
      responderLng={responderLng}
      style={styles.map}
    />
  );
}

export default function NavigateScreen({ route }) {
  const { responderActiveAlert: activeAlert, completeAlert, userLocation } = useApp();
  const [eta, setEta] = useState(null);
  const [arrived, setArrived] = useState(false);
  const listenerRef = useRef(null);

  // The alert can come from navigation params (tapped from inbox) or from context (already accepted)
  const alert = activeAlert || route?.params?.alert || null;

  // Listen for victim marking themselves safe — show popup and stop navigation
  useEffect(() => {
    if (!alert?.id) return;
    listenerRef.current = listenToMyAlert(alert.id, (data) => {
      if (data.status === 'resolved') {
        if (listenerRef.current) { listenerRef.current(); listenerRef.current = null; }
        Alert.alert(
          '✅ Victim is Safe',
          'The person has marked themselves as safe. You can stop navigating.',
          [{ text: 'OK', onPress: () => completeAlert(alert.id) }],
          { cancelable: false }
        );
      }
    });
    return () => { if (listenerRef.current) listenerRef.current(); };
  }, [alert?.id]);

  useEffect(() => {
    if (alert) {
      setEta(Math.ceil(alert.distance / 0.4));
    }
  }, [alert]);

  // Simulate countdown to arrival
  useEffect(() => {
    if (!eta || eta <= 0) return;
    const timer = setInterval(() => {
      setEta(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setArrived(true);
          return 0;
        }
        return prev - 1;
      });
    }, 60000); // decrement every minute
    return () => clearInterval(timer);
  }, [eta]);

  const openGoogleMaps = () => {
    if (!alert) return;
    const { lat, lng } = alert;

    // We use a universal URL format that works more reliably across all devices
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
    
    // Attempt to open the universal URL which handles app switching automatically
    Linking.canOpenURL(googleMapsUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(googleMapsUrl);
        } else {
          Alert.alert('Error', 'Google Maps is not installed or available.');
        }
      })
      .catch((err) => {
        console.error('Maps error:', err);
        Alert.alert('Error', 'An unexpected error occurred while opening maps.');
      });
  };

  const handleComplete = () => {
    Alert.alert(
      'Mark as Complete',
      'Confirm that you have helped this person and the emergency is resolved.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm', onPress: () => {
            completeAlert(alert?.id);
            setArrived(false);
            setEta(null);
          }
        },
      ]
    );
  };

  if (!alert) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.header}>
          <Text style={styles.title}>NAVIGATION ENGINE</Text>
        </View>
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <Icon name="navigate-circle-outline" size={60} color={COLORS.surfaceAlt} />
          </View>
          <Text style={styles.emptyTitle}>NO ACTIVE TARGET</Text>
          <Text style={styles.emptySubtitle}>
            Accept an emergency alert from the inbox to start high-priority navigation.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>RESPONDING</Text>
          <View style={styles.statusRow}>
            <View style={[styles.dot, { backgroundColor: arrived ? COLORS.success : COLORS.primary }]} />
            <Text style={styles.subtitle}>{arrived ? 'TARGET REACHED' : 'EN ROUTE TO VICTIM'}</Text>
          </View>
        </View>
        {arrived && (
          <View style={styles.arrivedBadge}>
            <Icon name="checkmark-done" size={14} color="#FFF" />
            <Text style={styles.arrivedText}>ARRIVED</Text>
          </View>
        )}
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        <RealMapView
          victimLat={alert.lat}
          victimLng={alert.lng}
          responderLat={userLocation?.lat || 19.2403}
          responderLng={userLocation?.lng || 73.1305}
        />
        <View style={styles.mapOverlay}>
           <Text style={styles.coordText}>TARGET: {alert.lat.toFixed(5)}, {alert.lng.toFixed(5)}</Text>
        </View>
      </View>

      {/* Info Card */}
      <View style={styles.infoCard}>
        {/* Emergency type */}
        <View style={styles.typeRow}>
          <View style={[styles.typeBadge, { backgroundColor: COLORS.danger }]}>
            <Text style={styles.typeText}>
              {alert.emergencyType.toUpperCase()} EMERGENCY
            </Text>
          </View>
          <Text style={styles.distanceText}>{alert.distance} KM AWAY</Text>
        </View>

        {/* ETA */}
        <View style={styles.etaContainer}>
          <View style={styles.etaBox}>
             <Text style={styles.etaLabel}>ESTIMATED ARRIVAL</Text>
             <Text style={[styles.etaValue, { color: arrived ? COLORS.success : COLORS.text }]}>
               {arrived ? 'AT LOCATION' : `${eta} MIN`}
             </Text>
          </View>
          <Icon name="time" size={32} color={arrived ? COLORS.success : COLORS.primary} />
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.mapsBtn} onPress={openGoogleMaps} activeOpacity={0.8}>
            <Icon name="map" size={20} color="#000" />
            <Text style={styles.mapsBtnText}>EXTERNAL MAPS</Text>
          </TouchableOpacity>

          {arrived && (
            <TouchableOpacity style={styles.completeBtn} onPress={handleComplete} activeOpacity={0.8}>
              <Icon name="checkmark-circle" size={20} color="#FFF" />
              <Text style={styles.completeBtnText}>RESOLVE</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Emergency call */}
        <TouchableOpacity style={styles.callBtn} onPress={() => Linking.openURL('tel:112')} activeOpacity={0.7}>
          <Icon name="call" size={18} color="#FFF" />
          <Text style={styles.callBtnText}>CALL SERVICES (112)</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SPACING.xl, paddingVertical: SPACING.xl,
    backgroundColor: COLORS.background, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  title: { fontSize: 22, fontWeight: '900', color: COLORS.text, letterSpacing: 1 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  subtitle: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '800' },
  arrivedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: COLORS.success, paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: RADIUS.sm,
  },
  arrivedText: { color: '#FFF', fontWeight: '900', fontSize: 10, letterSpacing: 0.5 },
  mapContainer: {
    flex: 1, margin: SPACING.lg, borderRadius: RADIUS.lg, overflow: 'hidden',
    borderWidth: 1, borderColor: COLORS.border, ...SHADOW.md,
  },
  map: { flex: 1 },
  mapOverlay: {
    position: 'absolute', bottom: 12, left: 12, right: 12,
    backgroundColor: 'rgba(0,0,0,0.8)', padding: 8, borderRadius: RADIUS.sm,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  coordText: { color: COLORS.textMuted, fontSize: 10, fontWeight: '700', textAlign: 'center' },
  infoCard: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.xl, padding: SPACING.xl,
    margin: SPACING.lg, marginTop: 0, borderWidth: 1, borderColor: COLORS.border,
    ...SHADOW.md, gap: SPACING.lg,
  },
  typeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  typeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.sm },
  typeText: { fontSize: 10, fontWeight: '900', color: '#FFF', letterSpacing: 1 },
  distanceText: { fontSize: 11, color: COLORS.textMuted, fontWeight: '800' },
  etaContainer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.background, padding: SPACING.lg, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.border,
  },
  etaBox: { flex: 1 },
  etaLabel: { fontSize: 10, color: COLORS.textMuted, fontWeight: '800', marginBottom: 4 },
  etaValue: { fontSize: 28, fontWeight: '900' },
  actions: { flexDirection: 'row', gap: SPACING.md },
  mapsBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: COLORS.primary, paddingVertical: 16, borderRadius: RADIUS.md,
  },
  mapsBtnText: { color: '#000', fontWeight: '900', fontSize: 13, letterSpacing: 0.5 },
  completeBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: COLORS.success, paddingVertical: 16, borderRadius: RADIUS.md,
  },
  completeBtnText: { color: '#FFF', fontWeight: '900', fontSize: 13, letterSpacing: 0.5 },
  callBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: COLORS.danger, paddingVertical: 12, borderRadius: RADIUS.md,
    marginTop: SPACING.sm,
  },
  callBtnText: { color: '#FFF', fontWeight: '800', fontSize: 13, letterSpacing: 0.5 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING.xxl },
  emptyIconContainer: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center',
    marginBottom: SPACING.xl, borderWidth: 1, borderColor: COLORS.border,
  },
  emptyTitle: { fontSize: 18, fontWeight: '900', color: COLORS.text, letterSpacing: 1 },
  emptySubtitle: { fontSize: 14, color: COLORS.textSecondary, marginTop: SPACING.md, textAlign: 'center', lineHeight: 22, fontWeight: '500' },
});
