// src/screens/WelcomeScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import { useApp } from '../context/AppContext';
import { COLORS, SPACING, RADIUS, SHADOW } from '../theme';
import { ensureSignedIn } from '../services/SOSService';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const { setUserId } = useApp();
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    setLoading(true);
    try {
      const user = await ensureSignedIn();
      setUserId(user.uid);
    } catch (e) {
      console.error('Sign in failed:', e);
      alert('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.content}>
        {/* Modern Styled Logo */}
        <View style={styles.logoSection}>
          <View style={styles.logoOuter}>
            <View style={styles.logoInner}>
              <Icon name="shield-half" size={70} color={COLORS.danger} />
              <View style={styles.pulseDot} />
            </View>
          </View>
          
          <View style={styles.titleContainer}>
             <Text style={styles.appName}>
               NEARBY<Text style={{color: COLORS.danger}}>RESPONDER</Text>
             </Text>
             <View style={styles.badge}>
               <Text style={styles.badgeText}>ELITE EMERGENCY NETWORK</Text>
             </View>
          </View>
        </View>

        {/* Feature Cards */}
        <View style={styles.featuresContainer}>
          <View style={styles.featureCard}>
            <View style={[styles.iconBox, { backgroundColor: COLORS.dangerLight }]}>
              <Icon name="flashlight" size={24} color={COLORS.danger} />
            </View>
            <View style={styles.featureInfo}>
              <Text style={styles.featureTitle}>Rapid Deployment</Text>
              <Text style={styles.featureText}>One-tap broadcast to all nearby responders in seconds.</Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <View style={[styles.iconBox, { backgroundColor: COLORS.primaryLight }]}>
              <Icon name="location" size={24} color={COLORS.primary} />
            </View>
            <View style={styles.featureInfo}>
              <Text style={styles.featureTitle}>Precision Tracking</Text>
              <Text style={styles.featureText}>Live GPS coordination between victims and responders.</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.mainButton} 
            onPress={handleStart}
            disabled={loading}
            activeOpacity={0.9}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <>
                <Text style={styles.buttonText}>INITIALIZE SYSTEM</Text>
                <View style={styles.buttonIcon}>
                  <Icon name="chevron-forward" size={18} color="#000" />
                </View>
              </>
            )}
          </TouchableOpacity>
          
          <View style={styles.disclaimerRow}>
            <Icon name="lock-closed" size={12} color={COLORS.textMuted} />
            <Text style={styles.disclaimer}>Secure E2E Encrypted Session</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { flex: 1, paddingHorizontal: SPACING.xl, justifyContent: 'space-between', paddingVertical: SPACING.xxl },
  
  logoSection: { alignItems: 'center', marginTop: 20 },
  logoOuter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  logoInner: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.lg,
    shadowColor: COLORS.danger,
    borderWidth: 2,
    borderColor: COLORS.danger,
  },
  pulseDot: {
    position: 'absolute',
    top: 25,
    right: 25,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.success,
    borderWidth: 2,
    borderColor: COLORS.surface,
  },

  titleContainer: { alignItems: 'center' },
  appName: { 
    fontSize: width * 0.075, // Responsive font size to ensure it fits one line
    fontWeight: '900', 
    color: COLORS.text, 
    letterSpacing: 1,
    textAlign: 'center',
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: RADIUS.round,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  badgeText: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
  },

  featuresContainer: { gap: SPACING.lg },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.lg,
  },
  featureInfo: { flex: 1 },
  featureTitle: { color: COLORS.text, fontSize: 16, fontWeight: '800' },
  featureText: { color: COLORS.textSecondary, fontSize: 13, marginTop: 4, lineHeight: 18, fontWeight: '500' },

  footer: { alignItems: 'center', paddingBottom: 10 },
  mainButton: {
    flexDirection: 'row', 
    backgroundColor: COLORS.primary,
    width: '100%', 
    height: 64, 
    borderRadius: RADIUS.md,
    alignItems: 'center', 
    justifyContent: 'center',
    ...SHADOW.md,
  },
  buttonText: { fontSize: 16, fontWeight: '900', color: '#000', letterSpacing: 1 },
  buttonIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  disclaimerRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: SPACING.xl },
  disclaimer: { fontSize: 11, color: COLORS.textMuted, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
});
