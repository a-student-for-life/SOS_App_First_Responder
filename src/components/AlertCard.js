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
        activeOpacity={0.7}
      >
        <View style={[styles.typeIcon, { backgroundColor: config.color + '30' }]}>
          <Icon name={config.icon} size={20} color={config.color} />
        </View>
        <View style={styles.info}>
          <Text style={styles.type}>{alert.emergencyType}</Text>
          <Text style={styles.meta}>{alert.distance} km · {timeAgo(alert.timestamp ?? alert.createdAt)}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: alert.status === 'accepted' ? COLORS.successLight : COLORS.surfaceAlt }]}>
          <Text style={[styles.badgeText, { color: alert.status === 'accepted' ? COLORS.success : COLORS.textMuted }]}>
            {alert.status.toUpperCase()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress?.(alert)}
      activeOpacity={0.8}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.typeIcon, { backgroundColor: config.color + '20', borderColor: config.color, borderWidth: 1 }]}>
          <Icon name={config.icon} size={22} color={config.color} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.type}>{alert.emergencyType.toUpperCase()} EMERGENCY</Text>
          <Text style={styles.time}>{timeAgo(alert.timestamp ?? alert.createdAt)}</Text>
        </View>
        <View style={[styles.urgentBadge, { backgroundColor: COLORS.danger }]}>
          <Text style={styles.urgentText}>URGENT</Text>
        </View>
      </View>

      {/* Details */}
      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <Icon name="location" size={16} color={COLORS.primary} />
          <Text style={styles.detail}>{alert.distance} km away</Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="time-outline" size={16} color={COLORS.warning} />
          <Text style={styles.detail}>ETA: ~{Math.ceil(alert.distance / 0.4)} min</Text>
        </View>
      </View>

      <View style={styles.coordBox}>
        <Icon name="navigate-outline" size={14} color={COLORS.textMuted} />
        <Text style={styles.coords} numberOfLines={1}>
          LOCATION: {alert.lat.toFixed(5)}, {alert.lng.toFixed(5)}
        </Text>
      </View>

      {/* Actions */}
      {alert.status === 'pending' && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.btn, styles.btnDecline]}
            onPress={() => onDecline(alert.id)}
          >
            <Text style={styles.btnDeclineText}>IGNORE</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btn, styles.btnAccept]}
            onPress={() => onAccept(alert)}
          >
            <Icon name="navigate" size={18} color="#000" />
            <Text style={styles.btnAcceptText}>ACCEPT & RESPOND</Text>
          </TouchableOpacity>
        </View>
      )}

      {alert.status === 'accepted' && (
        <View style={[styles.acceptedBanner]}>
          <Icon name="checkmark-circle" size={18} color={COLORS.success} />
          <Text style={styles.acceptedText}>ACTIVE RESPONSE SESSION</Text>
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
    borderWidth: 1,
    borderColor: COLORS.border,
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
    marginBottom: SPACING.lg,
  },
  typeIcon: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  headerText: {
    flex: 1,
  },
  type: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: 0.5,
  },
  time: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
    fontWeight: '500',
  },
  urgentBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  urgentText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 1,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detail: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '700',
  },
  coordBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: SPACING.lg,
    paddingLeft: SPACING.sm,
  },
  coords: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.md,
    gap: 8,
  },
  btnDecline: {
    backgroundColor: COLORS.surfaceAlt,
    borderWidth: 1,
    borderColor: COLORS.border,
    flex: 0.35,
  },
  btnAccept: {
    backgroundColor: COLORS.primary,
    flex: 0.65,
    ...SHADOW.sm,
  },
  btnDeclineText: {
    color: COLORS.textSecondary,
    fontWeight: '800',
    fontSize: 12,
  },
  btnAcceptText: {
    color: '#000',
    fontWeight: '900',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  acceptedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.successLight,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.success,
  },
  acceptedText: {
    color: COLORS.success,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
  },
  info: {
    flex: 1,
  },
  meta: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
    fontWeight: '500',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
});
