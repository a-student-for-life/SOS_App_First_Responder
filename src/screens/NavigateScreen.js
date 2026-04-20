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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import { useApp } from '../context/AppContext';
import { listenToMyAlert } from '../services/SOSService';
import { COLORS, SPACING, RADIUS, SHADOW, FONTS } from '../theme';

// Simulated map - in a real app, use react-native-maps
function MockMapView({ victimLat, victimLng, responderLat, responderLng }) {
  return (
    <View style={styles.mockMap}>
      <Text style={styles.mockMapLabel}>Map View</Text>
      <View style={styles.mockMapContent}>
        {/* Victim marker */}
        <View style={[styles.mapMarker, styles.victimMarker]}>
          <Icon name="person" size={16} color="#FFF" />
        </View>
        <Text style={styles.markerLabel}>Victim</Text>
        {/* Route line (visual only) */}
        <View style={styles.routeLine} />
        {/* Responder marker */}
        <View style={[styles.mapMarker, styles.responderMarker]}>
          <Icon name="navigate" size={16} color="#FFF" />
        </View>
        <Text style={[styles.markerLabel, { color: COLORS.primary }]}>You</Text>
      </View>
      <View style={styles.coordsRow}>
        <Text style={styles.coordText}>
          Victim: {victimLat?.toFixed(4)}, {victimLng?.toFixed(4)}
        </Text>
      </View>
    </View>
  );
}

export default function NavigateScreen({ route }) {
  const { responderActiveAlert: activeAlert, completeAlert } = useApp();
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
    const label = encodeURIComponent('SOS Emergency Location');

    // Try native Google Maps first, fall back to browser
    const nativeUrl = Platform.select({
      ios: `comgooglemaps://?daddr=${lat},${lng}&directionsmode=driving`,
      android: `google.navigation:q=${lat},${lng}&mode=d`,
    });
    const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;

    Linking.canOpenURL(nativeUrl)
      .then((supported) => {
        const url = supported ? nativeUrl : webUrl;
        return Linking.openURL(url);
      })
      .catch(() => {
        // Final fallback: open in browser
        Linking.openURL(webUrl).catch(() =>
          Alert.alert('Error', 'Could not open a maps application.')
        );
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
        <View style={styles.header}>
          <Text style={styles.title}>Navigate</Text>
        </View>
        <View style={styles.emptyState}>
          <Icon name="navigate-circle-outline" size={64} color={COLORS.textMuted} />
          <Text style={styles.emptyTitle}>No active navigation</Text>
          <Text style={styles.emptySubtitle}>
            Accept an alert from the inbox to start navigating to a victim's location.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Navigating</Text>
        {arrived && (
          <View style={styles.arrivedBadge}>
            <Text style={styles.arrivedText}>Arrived!</Text>
          </View>
        )}
      </View>

      {/* Map */}
      <MockMapView
        victimLat={alert.lat}
        victimLng={alert.lng}
        responderLat={19.2403}
        responderLng={73.1305}
      />

      {/* Info Card */}
      <View style={styles.infoCard}>
        {/* Emergency type */}
        <View style={styles.typeRow}>
          <View style={[styles.typeBadge, { backgroundColor: COLORS.dangerLight }]}>
            <Text style={[styles.typeText, { color: COLORS.danger }]}>
              {alert.emergencyType}
            </Text>
          </View>
          <Text style={styles.distanceText}>{alert.distance} km away</Text>
        </View>

        {/* ETA */}
        <View style={styles.etaRow}>
          <Icon name="time" size={20} color={arrived ? COLORS.success : COLORS.primary} />
          <Text style={styles.etaLabel}>ETA</Text>
          <Text style={[styles.etaValue, { color: arrived ? COLORS.success : COLORS.text }]}>
            {arrived ? 'Arrived' : `~${eta} min`}
          </Text>
        </View>

        {/* Victim coords */}
        <View style={styles.locationRow}>
          <Icon name="location" size={16} color={COLORS.textMuted} />
          <Text style={styles.locationText}>
            {alert.lat.toFixed(5)}, {alert.lng.toFixed(5)}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.mapsBtn} onPress={openGoogleMaps}>
            <Icon name="navigate" size={18} color="#FFF" />
            <Text style={styles.mapsBtnText}>Open in Maps</Text>
          </TouchableOpacity>

          {arrived && (
            <TouchableOpacity style={styles.completeBtn} onPress={handleComplete}>
              <Icon name="checkmark-circle" size={18} color="#FFF" />
              <Text style={styles.completeBtnText}>Mark Complete</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Emergency call */}
        <TouchableOpacity style={styles.callRow} onPress={() => Linking.openURL('tel:112')}>
          <Icon name="call" size={16} color={COLORS.danger} />
          <Text style={styles.callText}>Call Emergency Services (112)</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: FONTS.size.xl,
    fontWeight: '700',
    color: COLORS.text,
  },
  arrivedBadge: {
    backgroundColor: COLORS.successLight,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.round,
  },
  arrivedText: {
    color: COLORS.success,
    fontWeight: '700',
    fontSize: FONTS.size.sm,
  },
  mockMap: {
    flex: 1,
    backgroundColor: '#E8EDF3',
    margin: SPACING.xl,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
    ...SHADOW.sm,
  },
  mockMapLabel: {
    position: 'absolute',
    top: SPACING.md,
    left: SPACING.md,
    fontSize: FONTS.size.xs,
    color: COLORS.textMuted,
    backgroundColor: 'rgba(255,255,255,0.8)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  mockMapContent: {
    alignItems: 'center',
    gap: SPACING.sm,
  },
  mapMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  victimMarker: {
    backgroundColor: COLORS.danger,
  },
  responderMarker: {
    backgroundColor: COLORS.primary,
  },
  markerLabel: {
    fontSize: FONTS.size.xs,
    fontWeight: '600',
    color: COLORS.danger,
  },
  routeLine: {
    width: 2,
    height: 40,
    backgroundColor: COLORS.textMuted,
    borderStyle: 'dashed',
  },
  coordsRow: {
    position: 'absolute',
    bottom: SPACING.md,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
  },
  coordText: {
    fontSize: FONTS.size.xs,
    color: COLORS.textSecondary,
  },
  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    margin: SPACING.xl,
    marginTop: 0,
    ...SHADOW.md,
    gap: SPACING.md,
  },
  typeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.round,
  },
  typeText: {
    fontSize: FONTS.size.sm,
    fontWeight: '700',
  },
  distanceText: {
    fontSize: FONTS.size.sm,
    color: COLORS.textSecondary,
  },
  etaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  etaLabel: {
    fontSize: FONTS.size.md,
    color: COLORS.textSecondary,
    flex: 1,
  },
  etaValue: {
    fontSize: FONTS.size.xl,
    fontWeight: '700',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  locationText: {
    fontSize: FONTS.size.sm,
    color: COLORS.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  mapsBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
  },
  mapsBtnText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: FONTS.size.md,
  },
  completeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.success,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
  },
  completeBtnText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: FONTS.size.md,
  },
  callRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingTop: SPACING.xs,
  },
  callText: {
    fontSize: FONTS.size.sm,
    color: COLORS.danger,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xxl,
  },
  emptyTitle: {
    fontSize: FONTS.size.xl,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: SPACING.xl,
  },
  emptySubtitle: {
    fontSize: FONTS.size.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    textAlign: 'center',
    lineHeight: 22,
  },
});