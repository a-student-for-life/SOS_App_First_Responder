// src/screens/AlertInboxScreen.js
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import { useApp } from '../context/AppContext';
import AlertCard from '../components/AlertCard';
import { COLORS, SPACING, RADIUS, FONTS, SHADOW } from '../theme';

export default function AlertInboxScreen({ navigation }) {
  const {
    incomingAlerts, acceptAlert, responderAvailable,
    setResponderAvailable, responderActiveAlert,
  } = useApp();

  const pendingAlerts = incomingAlerts.filter(a => a.status === 'broadcasting');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>INCOMING ALERTS</Text>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: responderAvailable ? COLORS.success : COLORS.textMuted }]} />
            <Text style={styles.subtitle}>
              {responderAvailable ? 'Accepting Emergency Calls' : 'Currently Offline'}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.toggle, responderAvailable ? styles.toggleOn : styles.toggleOff]}
          onPress={() => setResponderAvailable(!responderAvailable)}
          activeOpacity={0.8}
        >
          <Icon 
            name={responderAvailable ? 'notifications' : 'notifications-off'} 
            size={20} 
            color={responderAvailable ? '#FFF' : COLORS.textMuted} 
          />
        </TouchableOpacity>
      </View>

      {responderActiveAlert && (
        <TouchableOpacity
          style={styles.activeBanner}
          onPress={() => navigation.navigate('Navigate', { alert: responderActiveAlert })}
          activeOpacity={0.9}
        >
          <View style={styles.activeBannerInner}>
            <Icon name="navigate" size={20} color="#000" />
            <View style={{ flex: 1 }}>
              <Text style={styles.activeBannerText}>ACTIVE RESPONSE IN PROGRESS</Text>
              <Text style={styles.activeBannerSubtext}>Distance: {responderActiveAlert.distance ?? '?'} km</Text>
            </View>
            <Icon name="chevron-forward" size={20} color="#000" />
          </View>
        </TouchableOpacity>
      )}

      {!responderAvailable && (
        <View style={styles.offlineBanner}>
          <Icon name="alert-circle" size={18} color={COLORS.warning} />
          <Text style={styles.offlineText}>YOU ARE NOT RECEIVING ALERTS</Text>
        </View>
      )}

      <FlatList
        data={responderAvailable ? pendingAlerts : []}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <AlertCard
            alert={item}
            onPress={(alert) => {
              acceptAlert(alert);
              navigation.navigate('Navigate', { alert });
            }}
            onAccept={(alert) => {
              acceptAlert(alert);
              navigation.navigate('Navigate', { alert });
            }}
            onDecline={() => {}}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Icon 
                name={responderAvailable ? 'radio' : 'moon'} 
                size={60} 
                color={COLORS.surfaceAlt} 
              />
            </View>
            <Text style={styles.emptyTitle}>
              {responderAvailable ? 'NO ACTIVE ALERTS' : 'RESPONDER OFFLINE'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {responderAvailable
                ? 'Standby... New emergency signals will appear here instantly.'
                : 'Enable availability to start receiving nearby emergency signals.'}
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
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
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  subtitle: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600' },
  toggle: {
    width: 48, height: 48, borderRadius: RADIUS.md,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
  },
  toggleOn: { backgroundColor: COLORS.success, borderColor: COLORS.success },
  toggleOff: { backgroundColor: COLORS.surface, borderColor: COLORS.border },
  activeBanner: {
    padding: SPACING.lg,
    backgroundColor: COLORS.primary,
    ...SHADOW.md,
  },
  activeBannerInner: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
  },
  activeBannerText: { color: '#000', fontWeight: '900', fontSize: 13, letterSpacing: 0.5 },
  activeBannerSubtext: { color: 'rgba(0,0,0,0.7)', fontWeight: '700', fontSize: 11, marginTop: 2 },
  offlineBanner: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    backgroundColor: COLORS.surface, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  offlineText: { fontSize: 12, color: COLORS.warning, fontWeight: '800', flex: 1, letterSpacing: 0.5 },
  list: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
  emptyState: { alignItems: 'center', paddingTop: 80, paddingHorizontal: SPACING.xxl },
  emptyIconContainer: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center',
    marginBottom: SPACING.xl, borderWidth: 1, borderColor: COLORS.border,
  },
  emptyTitle: { fontSize: 18, fontWeight: '900', color: COLORS.text, letterSpacing: 1 },
  emptySubtitle: { fontSize: 14, color: COLORS.textSecondary, marginTop: SPACING.md, textAlign: 'center', lineHeight: 22, fontWeight: '500' },
});
