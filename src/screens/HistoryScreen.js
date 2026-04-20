// src/screens/HistoryScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
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
        <View style={[styles.icon, { backgroundColor: COLORS.successLight }]}>
          <Icon name="shield-checkmark" size={20} color={COLORS.success} />
        </View>
        <View style={styles.timeline} />
      </View>
      <View style={styles.content}>
        <Text style={styles.itemTitle}>Emergency Alert</Text>
        <Text style={styles.responder}>Responder: {item.responder}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.meta}>{formatted}</Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.meta}>{time}</Text>
          <View style={[styles.statusBadge, { backgroundColor: COLORS.successLight }]}>
            <Text style={[styles.statusText, { color: COLORS.success }]}>{item.status}</Text>
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
      <View style={styles.header}>
        <Text style={styles.title}>History</Text>
        <Text style={styles.subtitle}>{emergencyHistory.length} events</Text>
      </View>

      <FlatList
        data={emergencyHistory}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <HistoryItem item={item} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="shield-checkmark-outline" size={64} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No emergencies yet</Text>
            <Text style={styles.emptySubtitle}>
              Your SOS history will appear here after you send your first alert.
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
  subtitle: {
    fontSize: FONTS.size.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  list: {
    padding: SPACING.xl,
    paddingBottom: SPACING.xxl,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.sm,
    ...SHADOW.sm,
    gap: SPACING.md,
  },
  iconCol: {
    alignItems: 'center',
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeline: {
    flex: 1,
    width: 2,
    backgroundColor: COLORS.borderLight,
    marginTop: SPACING.xs,
  },
  content: {
    flex: 1,
  },
  itemTitle: {
    fontSize: FONTS.size.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  responder: {
    fontSize: FONTS.size.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
  },
  meta: {
    fontSize: FONTS.size.xs,
    color: COLORS.textMuted,
  },
  metaDot: {
    color: COLORS.textMuted,
    fontSize: FONTS.size.xs,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.round,
    marginLeft: 'auto',
  },
  statusText: {
    fontSize: FONTS.size.xs,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: SPACING.xxl,
  },
  emptyTitle: {
    fontSize: FONTS.size.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: SPACING.lg,
  },
  emptySubtitle: {
    fontSize: FONTS.size.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
});
