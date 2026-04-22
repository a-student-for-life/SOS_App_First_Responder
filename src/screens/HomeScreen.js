// src/screens/HomeScreen.js
import React, { useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Animated, Modal, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import WebMapView from '../components/WebMapView';
import Icon from '../components/Icon';
import { useApp, SOS_STATUS } from '../context/AppContext';
import SOSButton from '../components/SOSButton';
import { COLORS, SPACING, RADIUS, SHADOW, FONTS } from '../theme';

function CountdownOverlay({ countdown, onCancel }) {
  return (
    <View style={styles.overlay}>
      <View style={styles.overlayCard}>
        <View style={styles.warningCircle}>
          <Icon name="warning" size={48} color={COLORS.danger} />
        </View>
        <Text style={styles.overlayTitle}>EMERGENCY ALERT</Text>
        <Text style={styles.overlaySubtitle}>Sending SOS in</Text>
        <Text style={styles.countdownNum}>{countdown}</Text>
        <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
          <Text style={styles.cancelBtnText}>STOP ALERT</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const {
    sosStatus, countdown, startSOS, cancelSOS, resolveEmergency,
    activeAlertData, userLocation, nearbyResponders,
  } = useApp();

  const isBroadcasting = sosStatus === SOS_STATUS.BROADCASTING;
  const isAccepted = sosStatus === SOS_STATUS.ACCEPTED;
  const isCountdown = sosStatus === SOS_STATUS.COUNTDOWN;
  const isResolved = sosStatus === SOS_STATUS.RESOLVED;
  const isActive = isBroadcasting || isAccepted;

  if (isResolved) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Icon name="checkmark-circle" size={100} color={COLORS.success} />
        <Text style={[styles.sectionTitle, { marginTop: SPACING.xl, fontSize: 24, textAlign: 'center' }]}>
          You Are Safe
        </Text>
        <Text style={styles.subtitleText}>Emergency session has been resolved.</Text>
        <TouchableOpacity 
          style={[styles.resolveBtn, { marginTop: SPACING.xxl }]} 
          onPress={() => {/* This would usually reset to idle */}}
        >
          <Text style={styles.resolveBtnText}>Back to Home</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <View>
          <Text style={styles.brandName}>NEARBY<Text style={{color: COLORS.danger}}>RESPONDER</Text></Text>
          <View style={styles.locationRow}>
            <Icon name="location" size={12} color={COLORS.primary} />
            <Text style={styles.locationText}>
              {userLocation
                ? `${userLocation.lat.toFixed(5)}, ${userLocation.lng.toFixed(5)}`
                : 'Locating...'}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.profileBtn}>
          <Icon name="person-circle" size={32} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Map View */}
        <View style={styles.mapContainer}>
          <WebMapView
            responderLat={userLocation?.lat}
            responderLng={userLocation?.lng}
            nearbyResponders={nearbyResponders}
            style={styles.map}
          />
          <View style={styles.mapBadge}>
            <View style={[styles.dot, { backgroundColor: COLORS.success }]} />
            <Text style={styles.mapBadgeText}>LIVE MAP</Text>
          </View>
        </View>

        {isActive && (
          <View style={[styles.statusBanner, isAccepted ? styles.bannerAccepted : styles.bannerBroadcasting]}>
            <Icon
              name={isAccepted ? 'checkmark-circle' : 'radio'}
              size={20}
              color="#FFF"
            />
            <Text style={styles.bannerText}>
              {isAccepted
                ? `${activeAlertData?.responderName || 'Responder'} is arriving now!`
                : 'BROADCASTING EMERGENCY SIGNAL...'}
            </Text>
          </View>
        )}

        <View style={styles.sosArea}>
          <SOSButton
            onPress={() => { if (sosStatus === SOS_STATUS.IDLE) startSOS(); }}
            pulsing={isActive}
            disabled={isActive}
          />
          {sosStatus === SOS_STATUS.IDLE && (
            <Text style={styles.sosHint}>Press to send instant emergency alert</Text>
          )}
          {isBroadcasting && (
            <View style={styles.activeHintContainer}>
              <Text style={[styles.sosHint, { color: COLORS.danger, fontWeight: '700' }]}>
                SEARCHING FOR RESPONDERS
              </Text>
              <Text style={styles.sosSubHint}>Your location is being shared</Text>
            </View>
          )}
          {isAccepted && (
            <TouchableOpacity style={styles.resolveBtn} onPress={resolveEmergency}>
              <Icon name="checkmark-circle" size={18} color="#FFF" />
              <Text style={styles.resolveBtnText}>I AM NOW SAFE</Text>
            </TouchableOpacity>
          )}
          {isActive && (
            <TouchableOpacity style={styles.cancelSosBtn} onPress={cancelSOS}>
              <Text style={styles.cancelSosBtnText}>Cancel SOS Alert</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoCard}>
            <Icon name="radio-outline" size={24} color={COLORS.warning} />
            <Text style={styles.infoValue}>5 km</Text>
            <Text style={styles.infoLabel}>Range</Text>
          </View>
          <View style={styles.infoCard}>
            <View style={styles.liveIndicator}>
              <View style={[styles.dot, { backgroundColor: COLORS.success }]} />
              <Text style={styles.infoValue}>Sync</Text>
            </View>
            <Text style={styles.infoLabel}>Cloud</Text>
          </View>
          <View style={styles.infoCard}>
            <Icon name="shield-checkmark" size={24} color={COLORS.primary} />
            <Text style={styles.infoValue}>{nearbyResponders.length}</Text>
            <Text style={styles.infoLabel}>Nearby</Text>
          </View>
        </View>
      </ScrollView>

      <Modal visible={isCountdown} transparent animationType="slide">
        <CountdownOverlay countdown={countdown} onCancel={cancelSOS} />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SPACING.xl, paddingVertical: SPACING.lg,
    backgroundColor: COLORS.background, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  brandName: { fontSize: 20, fontWeight: '900', color: COLORS.text, letterSpacing: 1 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  locationText: { fontSize: 12, color: COLORS.textMuted, fontWeight: '500' },
  profileBtn: { padding: 4 },
  scroll: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  mapContainer: {
    height: 220,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOW.md,
  },
  map: { flex: 1 },
  mapBadge: {
    position: 'absolute', top: 12, left: 12,
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: RADIUS.round, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  mapBadgeText: { color: '#FFF', fontSize: 10, fontWeight: '800' },
  dot: { width: 6, height: 6, borderRadius: 3 },
  statusBanner: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    padding: SPACING.lg, borderRadius: RADIUS.md, marginBottom: SPACING.xl,
    ...SHADOW.md,
  },
  bannerBroadcasting: { backgroundColor: COLORS.danger },
  bannerAccepted: { backgroundColor: COLORS.success },
  bannerText: { fontSize: 13, fontWeight: '800', color: '#FFF', flex: 1, letterSpacing: 0.5 },
  sosArea: { alignItems: 'center', paddingVertical: SPACING.xl },
  sosHint: { marginTop: SPACING.xl, fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', fontWeight: '500' },
  sosSubHint: { fontSize: 12, color: COLORS.textMuted, marginTop: 4 },
  activeHintContainer: { alignItems: 'center' },
  resolveBtn: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    marginTop: SPACING.lg, backgroundColor: COLORS.success,
    paddingHorizontal: SPACING.xxl, paddingVertical: SPACING.lg,
    borderRadius: RADIUS.md, ...SHADOW.md,
  },
  resolveBtnText: { color: '#FFF', fontWeight: '800', fontSize: 16 },
  cancelSosBtn: { marginTop: SPACING.xl, padding: SPACING.md },
  cancelSosBtnText: { color: COLORS.danger, fontSize: 14, fontWeight: '700', textDecorationLine: 'underline' },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text },
  subtitleText: { fontSize: 16, color: COLORS.textMuted, marginTop: SPACING.sm, textAlign: 'center' },
  infoGrid: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.md },
  infoCard: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: RADIUS.lg,
    padding: SPACING.lg, alignItems: 'center', gap: 4,
    borderWidth: 1, borderColor: COLORS.border,
  },
  infoValue: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  infoLabel: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600', textTransform: 'uppercase' },
  liveIndicator: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' },
  overlayCard: {
    borderRadius: RADIUS.xl,
    padding: SPACING.xxl, alignItems: 'center', width: '85%', gap: SPACING.md,
  },
  warningCircle: {
    width: 100, height: 100, borderRadius: 50, backgroundColor: COLORS.dangerLight,
    alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.md,
    borderWidth: 2, borderColor: COLORS.danger,
  },
  overlayTitle: { fontSize: 28, fontWeight: '900', color: COLORS.danger, letterSpacing: 1 },
  overlaySubtitle: { fontSize: 18, color: COLORS.text, fontWeight: '600' },
  countdownNum: { fontSize: 120, fontWeight: '900', color: '#FFF', lineHeight: 130 },
  cancelBtn: {
    backgroundColor: COLORS.surface, paddingHorizontal: 40,
    paddingVertical: 20, borderRadius: RADIUS.md, marginTop: SPACING.xl,
    borderWidth: 2, borderColor: COLORS.danger,
  },
  cancelBtnText: { color: COLORS.danger, fontWeight: '900', fontSize: 20 },
});
