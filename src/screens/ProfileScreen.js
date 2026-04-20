// src/screens/ProfileScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import { useApp, USER_ROLE } from '../context/AppContext';
import { COLORS, SPACING, RADIUS, SHADOW, FONTS } from '../theme';

function SettingRow({ icon, label, value, onPress, danger, rightElement }) {
  return (
    <TouchableOpacity style={styles.settingRow} onPress={onPress} disabled={!onPress && !rightElement}>
      <View style={[styles.settingIcon, { backgroundColor: danger ? COLORS.dangerLight : COLORS.primaryLight }]}>
        <Icon name={icon} size={18} color={danger ? COLORS.danger : COLORS.primary} />
      </View>
      <Text style={[styles.settingLabel, danger && { color: COLORS.danger }]}>{label}</Text>
      {rightElement || (value !== undefined ? (
        <Text style={styles.settingValue}>{value}</Text>
      ) : (
        <Icon name="chevron-forward" size={16} color={COLORS.textMuted} />
      ))}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const { userRole, setUserRole, emergencyHistory } = useApp();
  const isVictim = userRole === USER_ROLE.VICTIM;

  const switchRole = () => {
    const newRole = isVictim ? USER_ROLE.RESPONDER : USER_ROLE.VICTIM;
    Alert.alert(
      `Switch to ${newRole === USER_ROLE.RESPONDER ? 'Responder' : 'User'} Mode`,
      newRole === USER_ROLE.RESPONDER
        ? 'You will start receiving SOS alerts from nearby users in emergency.'
        : 'You will switch back to user mode to send SOS alerts.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Switch', onPress: () => setUserRole(newRole) },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarInitial}>R</Text>
          </View>
          <Text style={styles.name}>Piyush Mistry</Text>
          <Text style={styles.email}>piyush@example.com</Text>

          {/* Role badge */}
          <View style={[styles.roleBadge, isVictim ? styles.roleVictim : styles.roleResponder]}>
            <Icon
              name={isVictim ? 'shield' : 'medkit'}
              size={14}
              color={isVictim ? COLORS.danger : COLORS.primary}
            />
            <Text style={[styles.roleText, { color: isVictim ? COLORS.danger : COLORS.primary }]}>
              {isVictim ? 'User Mode' : 'Responder Mode'}
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{emergencyHistory.length}</Text>
            <Text style={styles.statLabel}>SOS Sent</Text>
          </View>
          <View style={[styles.statBox, styles.statBoxMiddle]}>
            <Text style={styles.statNum}>3</Text>
            <Text style={styles.statLabel}>Contacts</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>Live</Text>
            <Text style={styles.statLabel}>Nearby</Text>
          </View>
        </View>

        {/* Role Switch */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Mode</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.roleSwitcher} onPress={switchRole}>
              <View style={styles.roleSwitchLeft}>
                <Icon
                  name="swap-horizontal"
                  size={22}
                  color={COLORS.primary}
                />
                <View>
                  <Text style={styles.switchTitle}>
                    Switch to {isVictim ? 'Responder' : 'User'} Mode
                  </Text>
                  <Text style={styles.switchSubtitle}>
                    {isVictim
                      ? 'Start receiving and responding to SOS alerts'
                      : 'Switch back to sending SOS alerts'}
                  </Text>
                </View>
              </View>
              <Icon name="chevron-forward" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Settings</Text>
          <View style={styles.card}>
            <SettingRow
              icon="notifications-outline"
              label="Notifications"
              value="Enabled"
            />
            <View style={styles.divider} />
            <SettingRow
              icon="location-outline"
              label="Location Sharing"
              value="Always"
            />
            <View style={styles.divider} />
            <SettingRow
              icon="radio-outline"
              label="Alert Radius"
              value="3 km"
            />
            <View style={styles.divider} />
            <SettingRow
              icon="people-outline"
              label="Trusted Contacts"
              value="3"
            />
          </View>
        </View>

        {/* Emergency */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Emergency</Text>
          <View style={styles.card}>
            <SettingRow
              icon="call-outline"
              label="Emergency Number"
              value="112"
            />
            <View style={styles.divider} />
            <SettingRow
              icon="medkit-outline"
              label="Medical Info"
              value="Not set"
            />
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <View style={styles.card}>
            <SettingRow
              icon="information-circle-outline"
              label="About App"
            />
            <View style={styles.divider} />
            <SettingRow
              icon="log-out-outline"
              label="Sign Out"
              danger
            />
          </View>
        </View>

        <Text style={styles.version}>Nearby Emergency Responder v1.0.0</Text>
      </ScrollView>
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
  avatarSection: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  avatarInitial: {
    fontSize: 36,
    fontWeight: '700',
    color: COLORS.primary,
  },
  name: {
    fontSize: FONTS.size.xl,
    fontWeight: '700',
    color: COLORS.text,
  },
  email: {
    fontSize: FONTS.size.sm,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.round,
    marginTop: SPACING.md,
  },
  roleVictim: {
    backgroundColor: COLORS.dangerLight,
  },
  roleResponder: {
    backgroundColor: COLORS.primaryLight,
  },
  roleText: {
    fontSize: FONTS.size.sm,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  statBoxMiddle: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: COLORS.border,
  },
  statNum: {
    fontSize: FONTS.size.xxl,
    fontWeight: '700',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: FONTS.size.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  section: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
  },
  sectionHeader: {
    fontSize: FONTS.size.xs,
    fontWeight: '600',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: SPACING.sm,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...SHADOW.sm,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  settingIcon: {
    width: 34,
    height: 34,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingLabel: {
    flex: 1,
    fontSize: FONTS.size.md,
    color: COLORS.text,
  },
  settingValue: {
    fontSize: FONTS.size.sm,
    color: COLORS.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginLeft: SPACING.lg + 34 + SPACING.md,
  },
  roleSwitcher: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  roleSwitchLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  switchTitle: {
    fontSize: FONTS.size.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  switchSubtitle: {
    fontSize: FONTS.size.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
    maxWidth: 220,
  },
  version: {
    textAlign: 'center',
    fontSize: FONTS.size.xs,
    color: COLORS.textMuted,
    padding: SPACING.xl,
    paddingBottom: SPACING.xxl,
  },
});
