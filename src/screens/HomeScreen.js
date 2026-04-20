// src/screens/HomeScreen.js
import React, { useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Animated, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import { useApp, SOS_STATUS } from '../context/AppContext';
import SOSButton from '../components/SOSButton';
import { COLORS, SPACING, RADIUS, SHADOW, FONTS } from '../theme';

function CountdownOverlay({ countdown, onCancel }) {
  return (
    <View style={styles.overlay}>
      <View style={styles.overlayCard}>
        <Icon name="warning" size={40} color={COLORS.danger} />
        <Text style={styles.overlayTitle}>Sending SOS in</Text>
        <Text style={styles.countdownNum}>{countdown}</Text>
        <Text style={styles.overlaySubtitle}>Alerting nearby responders</Text>
        <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const {
    sosStatus, countdown, startSOS, cancelSOS, resolveEmergency,
    activeAlertData, userLocation,
  } = useApp();

  const isBroadcasting = sosStatus === SOS_STATUS.BROADCASTING;
  const isAccepted = sosStatus === SOS_STATUS.ACCEPTED;
  const isCountdown = sosStatus === SOS_STATUS.COUNTDOWN;
  const isResolved = sosStatus === SOS_STATUS.RESOLVED;
  const isActive = isBroadcasting || isAccepted;

  if (isResolved) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Icon name="checkmark-circle" size={80} color={COLORS.success} />
        <Text style={[styles.sectionTitle, { marginTop: SPACING.lg, textAlign: 'center' }]}>
          Emergency Resolved
        </Text>
        <Text style={styles.subtitleText}>You're safe. Help is no longer needed.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Emergency Responder</Text>
          <View style={styles.locationRow}>
            <Icon name="location" size={14} color={COLORS.primary} />
            <Text style={styles.locationText}>
              {userLocation
                ? `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`
                : 'Getting location...'}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {isActive && (
          <View style={[styles.statusBanner, isAccepted ? styles.bannerAccepted : styles.bannerBroadcasting]}>
            <Icon
              name={isAccepted ? 'checkmark-circle' : 'radio'}
              size={18}
              color={isAccepted ? COLORS.success : COLORS.danger}
            />
            <Text style={[styles.bannerText, { color: isAccepted ? COLORS.success : COLORS.danger }]}>
              {isAccepted
                ? `${activeAlertData?.responderName || 'Responder'} is on their way!`
                : 'Broadcasting SOS... Searching for responders'}
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
            <Text style={styles.sosHint}>Press once to send emergency alert</Text>
          )}
          {isBroadcasting && (
            <Text style={[styles.sosHint, { color: COLORS.danger }]}>
              Searching for nearby responders...
            </Text>
          )}
          {isAccepted && (
            <TouchableOpacity style={styles.resolveBtn} onPress={resolveEmergency}>
              <Icon name="checkmark-circle" size={18} color={COLORS.success} />
              <Text style={styles.resolveBtnText}>I'm Safe — Cancel Alert</Text>
            </TouchableOpacity>
          )}
          {isActive && (
            <TouchableOpacity style={styles.cancelSosBtn} onPress={cancelSOS}>
              <Text style={styles.cancelSosBtnText}>Cancel SOS</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoCard}>
            <Icon name="radio-outline" size={24} color={COLORS.warning} />
            <Text style={styles.infoValue}>3 km</Text>
            <Text style={styles.infoLabel}>Alert Radius</Text>
          </View>
          <View style={styles.infoCard}>
            <Icon name="shield" size={24} color={COLORS.success} />
            <Text style={styles.infoValue}>Live</Text>
            <Text style={styles.infoLabel}>Firebase Sync</Text>
          </View>
          <View style={styles.infoCard}>
            <Icon name="location" size={24} color={COLORS.primary} />
            <Text style={styles.infoValue}>{userLocation ? 'On' : '...'}</Text>
            <Text style={styles.infoLabel}>Location</Text>
          </View>
        </View>
      </ScrollView>

      <Modal visible={isCountdown} transparent animationType="fade">
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
    backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  greeting: { fontSize: FONTS.size.lg, fontWeight: '700', color: COLORS.text },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  locationText: { fontSize: FONTS.size.sm, color: COLORS.textSecondary },
  scroll: { padding: SPACING.xl, paddingBottom: SPACING.xxl },
  statusBanner: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    padding: SPACING.md, borderRadius: RADIUS.md, marginBottom: SPACING.xl,
  },
  bannerBroadcasting: { backgroundColor: COLORS.dangerLight },
  bannerAccepted: { backgroundColor: COLORS.successLight },
  bannerText: { fontSize: FONTS.size.sm, fontWeight: '500', flex: 1 },
  sosArea: { alignItems: 'center', paddingVertical: SPACING.xxl },
  sosHint: { marginTop: SPACING.xl, fontSize: FONTS.size.sm, color: COLORS.textMuted, textAlign: 'center' },
  resolveBtn: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    marginTop: SPACING.lg, backgroundColor: COLORS.successLight,
    paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md,
    borderRadius: RADIUS.round, borderWidth: 1, borderColor: COLORS.success + '40',
  },
  resolveBtnText: { color: COLORS.success, fontWeight: '600', fontSize: FONTS.size.md },
  cancelSosBtn: { marginTop: SPACING.md, padding: SPACING.md },
  cancelSosBtnText: { color: COLORS.textMuted, fontSize: FONTS.size.sm, textDecorationLine: 'underline' },
  sectionTitle: { fontSize: FONTS.size.lg, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  subtitleText: { fontSize: FONTS.size.md, color: COLORS.textSecondary, marginTop: SPACING.sm, textAlign: 'center' },
  infoGrid: { flexDirection: 'row', gap: SPACING.sm },
  infoCard: {
    flex: 1, backgroundColor: COLORS.surface, borderRadius: RADIUS.lg,
    padding: SPACING.md, alignItems: 'center', gap: 4, ...SHADOW.sm,
  },
  infoValue: { fontSize: FONTS.size.lg, fontWeight: '700', color: COLORS.text },
  infoLabel: { fontSize: FONTS.size.xs, color: COLORS.textMuted, textAlign: 'center' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  overlayCard: {
    backgroundColor: COLORS.surface, borderRadius: RADIUS.xl,
    padding: SPACING.xxl, alignItems: 'center', width: 280, gap: SPACING.md,
  },
  overlayTitle: { fontSize: FONTS.size.xl, fontWeight: '700', color: COLORS.text },
  countdownNum: { fontSize: 80, fontWeight: '800', color: COLORS.danger, lineHeight: 88 },
  overlaySubtitle: { fontSize: FONTS.size.sm, color: COLORS.textSecondary, textAlign: 'center' },
  cancelBtn: {
    backgroundColor: COLORS.dangerLight, paddingHorizontal: SPACING.xxl,
    paddingVertical: SPACING.md, borderRadius: RADIUS.round, marginTop: SPACING.sm,
  },
  cancelBtnText: { color: COLORS.danger, fontWeight: '700', fontSize: FONTS.size.md },
});
