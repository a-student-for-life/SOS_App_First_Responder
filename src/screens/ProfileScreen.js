// src/screens/ProfileScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  StatusBar,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import { useApp, USER_ROLE } from '../context/AppContext';
import { COLORS, SPACING, RADIUS, SHADOW, FONTS } from '../theme';

function SettingRow({ icon, label, value, onPress, danger, rightElement }) {
  return (
    <TouchableOpacity style={styles.settingRow} onPress={onPress} disabled={!onPress && !rightElement} activeOpacity={0.7}>
      <View style={[styles.settingIcon, { backgroundColor: danger ? COLORS.dangerLight : COLORS.surfaceAlt, borderColor: danger ? COLORS.danger : COLORS.border, borderWidth: 1 }]}>
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
  const { userRole, setUserRole, emergencyHistory, trustedContacts, updateContacts, logout } = useApp();
  const [addingContact, setAddingContact] = React.useState(false);
  const [newContactName, setNewContactName] = React.useState('');
  const [newContactPhone, setNewContactPhone] = React.useState('');
  const isVictim = userRole === USER_ROLE.VICTIM;

  const handleAddContact = () => {
    if (!newContactName || !newContactPhone) {
      Alert.alert('Error', 'Please enter both name and phone number');
      return;
    }
    updateContacts([...trustedContacts, { name: newContactName, phone: newContactPhone }]);
    setNewContactName('');
    setNewContactPhone('');
    setAddingContact(false);
  };

  const switchRole = () => {
    const newRole = isVictim ? USER_ROLE.RESPONDER : USER_ROLE.VICTIM;
    Alert.alert(
      `Switch Mode`,
      `Switching to ${newRole === USER_ROLE.RESPONDER ? 'RESPONDER' : 'USER'} MODE.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Switch', onPress: () => setUserRole(newRole) },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.title}>IDENTITY & CONFIG</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarInitial}>PM</Text>
          </View>
          <Text style={styles.name}>PIYUSH MISTRY</Text>
          <Text style={styles.email}>piyush@example.com</Text>

          {/* Role badge */}
          <View style={[styles.roleBadge, isVictim ? styles.roleVictim : styles.roleResponder]}>
            <Icon
              name={isVictim ? 'shield' : 'medkit'}
              size={14}
              color="#FFF"
            />
            <Text style={styles.roleText}>
              {isVictim ? 'USER MODE ACTIVE' : 'RESPONDER MODE ACTIVE'}
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{emergencyHistory.length}</Text>
            <Text style={styles.statLabel}>SOS SENT</Text>
          </View>
          <View style={[styles.statBox, styles.statBoxMiddle]}>
            <Text style={styles.statNum}>{trustedContacts.length}</Text>
            <Text style={styles.statLabel}>CONTACTS</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>LIVE</Text>
            <Text style={styles.statLabel}>STATUS</Text>
          </View>
        </View>

        {/* Role Switch */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Operational Mode</Text>
          <TouchableOpacity style={styles.card} onPress={switchRole} activeOpacity={0.8}>
            <View style={styles.roleSwitcher}>
              <View style={styles.roleSwitchLeft}>
                <View style={styles.switchIconContainer}>
                  <Icon name="swap-horizontal" size={24} color={COLORS.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.switchTitle}>
                    SWITCH TO {isVictim ? 'RESPONDER' : 'USER'} MODE
                  </Text>
                  <Text style={styles.switchSubtitle}>
                    {isVictim
                      ? 'Begin receiving and responding to nearby SOS signals.'
                      : 'Switch back to sending emergency alerts.'}
                  </Text>
                </View>
                <Icon name="chevron-forward" size={20} color={COLORS.textMuted} />
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Configuration</Text>
          <View style={styles.card}>
            <SettingRow
              icon="notifications"
              label="Push Notifications"
              value="ACTIVE"
            />
            <View style={styles.divider} />
            <SettingRow
              icon="location"
              label="Real-time Tracking"
              value="ALWAYS ON"
            />
            <View style={styles.divider} />
            <SettingRow
              icon="radio"
              label="Alert Scan Radius"
              value="5 KM"
            />
          </View>
        </View>

        {/* Contacts */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeader}>Trusted Contacts</Text>
            <TouchableOpacity onPress={() => setAddingContact(!addingContact)}>
              <Text style={styles.addText}>{addingContact ? 'CANCEL' : '+ ADD NEW'}</Text>
            </TouchableOpacity>
          </View>

          {addingContact && (
            <View style={[styles.card, { padding: SPACING.lg, marginBottom: SPACING.md }]}>
              <Text style={styles.inputLabel}>Contact Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Rahul Sharma"
                placeholderTextColor={COLORS.textMuted}
                value={newContactName}
                onChangeText={setNewContactName}
              />
              <Text style={[styles.inputLabel, { marginTop: SPACING.md }]}>Phone Number</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. +91 9876543210"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="phone-pad"
                value={newContactPhone}
                onChangeText={setNewContactPhone}
              />
              <TouchableOpacity style={styles.saveBtn} onPress={handleAddContact}>
                <Text style={styles.saveBtnText}>SAVE CONTACT</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.card}>
            {trustedContacts.length === 0 ? (
              <View style={styles.emptyContacts}>
                <Text style={styles.emptyContactsText}>No trusted contacts configured.</Text>
              </View>
            ) : (
              trustedContacts.map((contact, index) => (
                <View key={index}>
                  <TouchableOpacity 
                    style={styles.contactRow}
                    activeOpacity={0.7}
                    onPress={() => {
                      Alert.alert(
                        'Remove Contact',
                        `Remove ${contact.name} from your trusted list?`,
                        [
                          { text: 'Cancel', style: 'cancel' },
                          { 
                            text: 'Remove', 
                            onPress: () => {
                              const newContacts = trustedContacts.filter((_, i) => i !== index);
                              updateContacts(newContacts);
                            },
                            style: 'destructive'
                          },
                        ]
                      );
                    }}
                  >
                    <View style={styles.contactIcon}>
                      <Icon name="person" size={16} color={COLORS.textSecondary} />
                    </View>
                    <View style={styles.contactInfo}>
                      <Text style={styles.contactName}>{contact.name.toUpperCase()}</Text>
                      <Text style={styles.contactPhone}>{contact.phone}</Text>
                    </View>
                    <Icon name="trash-outline" size={18} color={COLORS.danger} />
                  </TouchableOpacity>
                  {index < trustedContacts.length - 1 && <View style={styles.divider} />}
                </View>
              ))
            )}
          </View>
        </View>

        {/* Security */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Security & System</Text>
          <View style={styles.card}>
            <SettingRow
              icon="shield-checkmark"
              label="Encryption Status"
              value="END-TO-END"
            />
            <View style={styles.divider} />
            <SettingRow
              icon="log-out"
              label="Terminate Session"
              danger
              onPress={() => {
                Alert.alert(
                  'Terminate Session',
                  'Are you sure you want to log out? You will stop receiving alerts.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Log Out', onPress: logout, style: 'destructive' },
                  ]
                );
              }}
            />
          </View>
        </View>

        <Text style={styles.version}>NEARBY RESPENDER ENGINE v1.2.0 (DARK)</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    paddingHorizontal: SPACING.xl, paddingVertical: SPACING.xl,
    backgroundColor: COLORS.background, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  title: { fontSize: 22, fontWeight: '900', color: COLORS.text, letterSpacing: 1 },
  avatarSection: {
    alignItems: 'center', paddingVertical: SPACING.xxl,
    backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  avatar: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: COLORS.surfaceAlt, alignItems: 'center', justifyContent: 'center',
    marginBottom: SPACING.md, borderWidth: 2, borderColor: COLORS.primary,
  },
  avatarInitial: { fontSize: 32, fontWeight: '900', color: COLORS.primary },
  name: { fontSize: 20, fontWeight: '900', color: COLORS.text, letterSpacing: 0.5 },
  email: { fontSize: 13, color: COLORS.textMuted, marginTop: 4, fontWeight: '600' },
  roleBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingVertical: 6, borderRadius: RADIUS.sm, marginTop: SPACING.lg,
  },
  roleVictim: { backgroundColor: COLORS.danger },
  roleResponder: { backgroundColor: COLORS.primary },
  roleText: { fontSize: 11, fontWeight: '900', color: '#FFF', letterSpacing: 0.5 },
  statsRow: {
    flexDirection: 'row', backgroundColor: COLORS.background,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  statBox: { flex: 1, alignItems: 'center', paddingVertical: SPACING.xl },
  statBoxMiddle: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: COLORS.border },
  statNum: { fontSize: 24, fontWeight: '900', color: COLORS.text },
  statLabel: { fontSize: 10, color: COLORS.textMuted, marginTop: 4, fontWeight: '800' },
  section: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.xl },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  sectionHeader: { fontSize: 11, fontWeight: '900', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: SPACING.sm },
  addText: { fontSize: 11, fontWeight: '900', color: COLORS.primary, letterSpacing: 0.5 },
  card: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border },
  settingRow: { flexDirection: 'row', alignItems: 'center', padding: SPACING.lg, gap: SPACING.md },
  settingIcon: { width: 38, height: 38, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center' },
  settingLabel: { flex: 1, fontSize: 15, color: COLORS.text, fontWeight: '600' },
  settingValue: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '800' },
  divider: { height: 1, backgroundColor: COLORS.border, marginLeft: SPACING.lg },
  emptyContacts: { padding: SPACING.xl, alignItems: 'center' },
  emptyContactsText: { color: COLORS.textMuted, fontSize: 13, fontWeight: '500' },
  contactRow: { flexDirection: 'row', alignItems: 'center', padding: SPACING.lg, gap: SPACING.md },
  contactIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border },
  contactInfo: { flex: 1 },
  contactName: { fontSize: 14, fontWeight: '800', color: COLORS.text },
  contactPhone: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2, fontWeight: '600' },
  roleSwitcher: { padding: SPACING.lg },
  roleSwitchLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.lg },
  switchIconContainer: { width: 48, height: 48, borderRadius: RADIUS.md, backgroundColor: COLORS.primaryLight, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.primary },
  switchTitle: { fontSize: 15, fontWeight: '900', color: COLORS.text, letterSpacing: 0.5 },
  switchSubtitle: { fontSize: 12, color: COLORS.textSecondary, marginTop: 4, fontWeight: '500', lineHeight: 18 },
  version: { textAlign: 'center', fontSize: 10, color: COLORS.textMuted, padding: SPACING.xxl, fontWeight: '800', letterSpacing: 1 },
  
  // Input Styles
  inputLabel: { fontSize: 12, fontWeight: '800', color: COLORS.textSecondary, marginBottom: 8, letterSpacing: 0.5 },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    marginTop: SPACING.xl,
    padding: SPACING.lg,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    ...SHADOW.sm,
  },
  saveBtnText: { color: '#000', fontWeight: '900', fontSize: 14, letterSpacing: 1 },
});
