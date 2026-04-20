// src/components/AlertCard.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from '../components/Icon';
import { COLORS, SPACING, RADIUS, SHADOW, FONTS } from '../theme';

const TYPE_CONFIG = {
  Medical: { icon: 'medkit', color: COLORS.medical },
  Accident: { icon: 'car-crash', color: COLORS.accident },
  Fire: { icon: 'flame', color: COLORS.fire },
  Security: { icon: 'shield-half', color: COLORS.security },
};

function timeAgo(timestamp) {
  if (!timestamp) return 'Just now';
  // Firestore serverTimestamp() returns a Timestamp object with .toMillis()
  const ms = typeof timestamp?.toMillis === 'function'
    ? timestamp.toMillis()
    : typeof timestamp === 'number'
      ? timestamp
      : Date.parse(timestamp);
  if (!ms || isNaN(ms)) return 'Just now';
  const secs = Math.floor((Date.now() - ms) / 1000);
  if (secs < 5) return 'Just now';
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

export default function AlertCard({ alert, onAccept, onDecline, onPress, compact }) {
  const config = TYPE_CONFIG[alert.emergencyType] || TYPE_CONFIG.Medical;

  if (compact) {
    return (
      <TouchableOpacity
        style={[styles.card, styles.cardCompact]}
        onPress={() => onPress?.(alert)}
        activeOpacity={onPress ? 0.7 : 1}
      >
        <View style={[styles.typeIcon, { backgroundColor: config.color + '20' }]}>
          <Icon name={config.icon} size={20} color={config.color} />
        </View>
        <View style={styles.info}>
          <Text style={styles.type}>{alert.emergencyType}</Text>
          <Text style={styles.meta}>{alert.distance} km · {timeAgo(alert.timestamp ?? alert.createdAt)}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: config.color + '15' }]}>
          <Text style={[styles.badgeText, { color: config.color }]}>
            {alert.status === 'accepted' ? 'Accepted' : 'Pending'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress?.(alert)}
      activeOpacity={onPress ? 0.75 : 1}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.typeIcon, { backgroundColor: config.color + '20' }]}>
          <Icon name={config.icon} size={22} color={config.color} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.type}>{alert.emergencyType} Emergency</Text>
          <Text style={styles.time}>{timeAgo(alert.timestamp ?? alert.createdAt)}</Text>
        </View>
        <View style={[styles.urgentBadge, { backgroundColor: COLORS.dangerLight }]}>
          <Text style={[styles.urgentText, { color: COLORS.danger }]}>URGENT</Text>
        </View>
      </View>

      {/* Details */}
      <View style={styles.detailRow}>
        <Icon name="location" size={14} color={COLORS.textMuted} />
        <Text style={styles.detail}>{alert.distance} km away</Text>
        <Icon name="time-outline" size={14} color={COLORS.textMuted} style={{ marginLeft: SPACING.md }} />
        <Text style={styles.detail}>~{Math.ceil(alert.distance / 0.4)} min ETA</Text>
      </View>

      <View style={styles.detailRow}>
        <Icon name="navigate-outline" size={14} color={COLORS.textMuted} />
        <Text style={styles.detail} numberOfLines={1}>
          {alert.lat.toFixed(4)}, {alert.lng.toFixed(4)}
        </Text>
      </View>

      {/* Actions */}
      {alert.status === 'pending' && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.btn, styles.btnDecline]}
            onPress={() => onDecline(alert.id)}
          >
            <Icon name="close" size={18} color={COLORS.textSecondary} />
            <Text style={styles.btnDeclineText}>Decline</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btn, styles.btnAccept]}
            onPress={() => onAccept(alert)}
          >
            <Icon name="checkmark" size={18} color="#FFF" />
            <Text style={styles.btnAcceptText}>Accept & Navigate</Text>
          </TouchableOpacity>
        </View>
      )}

      {alert.status === 'accepted' && (
        <View style={[styles.acceptedBanner]}>
          <Icon name="checkmark-circle" size={16} color={COLORS.success} />
          <Text style={styles.acceptedText}>You're responding to this</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOW.md,
  },
  cardCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  headerText: {
    flex: 1,
  },
  type: {
    fontSize: FONTS.size.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  time: {
    fontSize: FONTS.size.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  urgentBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.round,
  },
  urgentText: {
    fontSize: FONTS.size.xs,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
    gap: 4,
  },
  detail: {
    fontSize: FONTS.size.sm,
    color: COLORS.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    gap: 6,
  },
  btnDecline: {
    backgroundColor: COLORS.surfaceAlt,
    borderWidth: 1,
    borderColor: COLORS.border,
    flex: 0.4,
  },
  btnAccept: {
    backgroundColor: COLORS.primary,
    flex: 0.6,
  },
  btnDeclineText: {
    color: COLORS.textSecondary,
    fontWeight: '600',
    fontSize: FONTS.size.sm,
  },
  btnAcceptText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: FONTS.size.sm,
  },
  acceptedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: SPACING.md,
    backgroundColor: COLORS.successLight,
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
  },
  acceptedText: {
    color: COLORS.success,
    fontSize: FONTS.size.sm,
    fontWeight: '500',
  },
  // compact styles
  info: {
    flex: 1,
  },
  meta: {
    fontSize: FONTS.size.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.round,
  },
  badgeText: {
    fontSize: FONTS.size.xs,
    fontWeight: '600',
  },
});