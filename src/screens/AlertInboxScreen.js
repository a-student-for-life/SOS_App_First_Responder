// src/screens/AlertInboxScreen.js
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import { useApp } from '../context/AppContext';
import AlertCard from '../components/AlertCard';
import { COLORS, SPACING, RADIUS, FONTS } from '../theme';

export default function AlertInboxScreen({ navigation }) {
  const {
    incomingAlerts, acceptAlert, responderAvailable,
    setResponderAvailable, responderActiveAlert,
  } = useApp();

  const pendingAlerts = incomingAlerts.filter(a => a.status === 'broadcasting');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Alert Inbox</Text>
          <Text style={styles.subtitle}>
            {pendingAlerts.length} pending · {responderAvailable ? 'Accepting' : 'Offline'}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.toggle, responderAvailable ? styles.toggleOn : styles.toggleOff]}
          onPress={() => setResponderAvailable(!responderAvailable)}
        >
          <View style={[styles.toggleDot, responderAvailable ? styles.toggleDotOn : styles.toggleDotOff]} />
          <Text style={[styles.toggleText, { color: responderAvailable ? COLORS.success : COLORS.textMuted }]}>
            {responderAvailable ? 'Available' : 'Offline'}
          </Text>
        </TouchableOpacity>
      </View>

      {responderActiveAlert && (
        <TouchableOpacity
          style={styles.activeBanner}
          onPress={() => navigation.navigate('Navigate', { alert: responderActiveAlert })}
        >
          <Icon name="navigate" size={18} color="#FFF" />
          <Text style={styles.activeBannerText}>
            Navigating to victim · {responderActiveAlert.distance ?? '?'} km
          </Text>
          <Icon name="chevron-forward" size={16} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>
      )}

      {!responderAvailable && (
        <View style={styles.offlineBanner}>
          <Icon name="moon-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.offlineText}>You're offline. Toggle to receive alerts.</Text>
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
            <Icon name="notifications-off-outline" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>
              {responderAvailable ? 'No alerts nearby' : 'You are offline'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {responderAvailable
                ? 'When someone triggers SOS nearby, it will appear here instantly.'
                : 'Enable availability to start receiving alerts.'}
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
    paddingHorizontal: SPACING.xl, paddingVertical: SPACING.lg,
    backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  title: { fontSize: FONTS.size.xl, fontWeight: '700', color: COLORS.text },
  subtitle: { fontSize: FONTS.size.sm, color: COLORS.textMuted, marginTop: 2 },
  toggle: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    borderRadius: RADIUS.round, borderWidth: 1,
  },
  toggleOn: { backgroundColor: COLORS.successLight, borderColor: COLORS.success + '40' },
  toggleOff: { backgroundColor: COLORS.surfaceAlt, borderColor: COLORS.border },
  toggleDot: { width: 8, height: 8, borderRadius: 4 },
  toggleDotOn: { backgroundColor: COLORS.success },
  toggleDotOff: { backgroundColor: COLORS.textMuted },
  toggleText: { fontSize: FONTS.size.sm, fontWeight: '600' },
  activeBanner: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    backgroundColor: COLORS.primary, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md,
  },
  activeBannerText: { flex: 1, color: '#FFF', fontWeight: '600', fontSize: FONTS.size.sm },
  offlineBanner: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
    backgroundColor: COLORS.surfaceAlt, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  offlineText: { fontSize: FONTS.size.sm, color: COLORS.textSecondary, flex: 1 },
  list: { padding: SPACING.xl, paddingBottom: SPACING.xxl },
  emptyState: { alignItems: 'center', paddingTop: 60, paddingHorizontal: SPACING.xxl },
  emptyTitle: { fontSize: FONTS.size.lg, fontWeight: '600', color: COLORS.text, marginTop: SPACING.lg, textAlign: 'center' },
  emptySubtitle: { fontSize: FONTS.size.sm, color: COLORS.textSecondary, marginTop: SPACING.sm, textAlign: 'center', lineHeight: 20 },
});