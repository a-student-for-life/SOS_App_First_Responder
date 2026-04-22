// src/screens/HistoryScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import { useApp } from '../context/AppContext';
import { COLORS, SPACING, RADIUS, SHADOW, FONTS } from '../theme';

function HistoryItem({ item }) {
  const date = new Date(item.date);
  const formatted = date.toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
  const time = date.toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <View style={styles.card}>
      <View style={styles.iconCol}>
        <View style={[styles.icon, { backgroundColor: COLORS.successLight, borderColor: COLORS.success, borderWidth: 1 }]}>
          <Icon name="shield-checkmark" size={22} color={COLORS.success} />
        </View>
        <View style={styles.timeline} />
      </View>
      <View style={styles.content}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemTitle}>EMERGENCY RESOLVED</Text>
          <Text style={styles.timeLabel}>{time}</Text>
        </View>
        <Text style={styles.responder}>RESPONDER: <Text style={{color: COLORS.text}}>{item.responder.toUpperCase()}</Text></Text>
        <View style={styles.metaRow}>
          <Icon name="calendar-outline" size={14} color={COLORS.textMuted} />
          <Text style={styles.meta}>{formatted.toUpperCase()}</Text>
          <View style={[styles.statusBadge, { backgroundColor: COLORS.success }]}>
            <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export default function HistoryScreen() {
  const { emergencyHistory } = useApp();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.title}>LOG HISTORY</Text>
        <Text style={styles.subtitle}>{emergencyHistory.length} ARCHIVED EVENTS</Text>
      </View>

      <FlatList
        data={emergencyHistory}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <HistoryItem item={item} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Icon name="archive-outline" size={60} color={COLORS.surfaceAlt} />
            </View>
            <Text style={styles.emptyTitle}>NO HISTORY FOUND</Text>
            <Text style={styles.emptySubtitle}>
              Your emergency log is empty. Records of SOS alerts will appear here after resolution.
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xl,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '800',
    marginTop: 6,
    letterSpacing: 0.5,
  },
  list: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.md,
    ...SHADOW.sm,
  },
  iconCol: {
    alignItems: 'center',
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeline: {
    flex: 1,
    width: 2,
    backgroundColor: COLORS.border,
    marginTop: SPACING.xs,
    borderStyle: 'dashed',
    borderRadius: 1,
  },
  content: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.success,
    letterSpacing: 0.5,
  },
  timeLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '700',
  },
  responder: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginTop: 2,
    letterSpacing: 0.3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.lg,
  },
  meta: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    marginLeft: 'auto',
  },
  statusText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#000',
    letterSpacing: 0.5,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: SPACING.xxl,
  },
  emptyIconContainer: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center',
    marginBottom: SPACING.xl, borderWidth: 1, borderColor: COLORS.border,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: 1,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
  },
});
