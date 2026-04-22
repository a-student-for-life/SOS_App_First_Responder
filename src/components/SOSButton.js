// src/components/SOSButton.js
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Platform,
} from 'react-native';
import { COLORS, RADIUS, SHADOW, FONTS } from '../theme';

export default function SOSButton({ onPress, onLongPress, disabled, pulsing }) {
  const scale = useRef(new Animated.Value(1)).current;
  const ring1 = useRef(new Animated.Value(0)).current;
  const ring2 = useRef(new Animated.Value(0)).current;
  const ring3 = useRef(new Animated.Value(0)).current;
  const glow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (pulsing) {
      // Scale pulse (Native)
      Animated.loop(
        Animated.sequence([
          Animated.timing(scale, { toValue: 1.08, duration: 600, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start();

      // Ripple rings (Native)
      const ripple = (anim, delay) =>
        Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(anim, { toValue: 1, duration: 1500, useNativeDriver: true }),
          ])
        ).start();
      ripple(ring1, 0);
      ripple(ring2, 500);
      ripple(ring3, 1000);

      // Glow intensity pulse (JS Driven - because shadows don't support native driver)
      Animated.loop(
        Animated.sequence([
          Animated.timing(glow, { toValue: 1, duration: 600, useNativeDriver: false }),
          Animated.timing(glow, { toValue: 0, duration: 600, useNativeDriver: false }),
        ])
      ).start();
    } else {
      scale.setValue(1);
      ring1.setValue(0);
      ring2.setValue(0);
      ring3.setValue(0);
      glow.setValue(0);
    }
  }, [pulsing]);

  const makeRingStyle = (anim) => ({
    transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [1, 2.8] }) }],
    opacity: anim.interpolate({ inputRange: [0, 0.1, 0.5, 1], outputRange: [0, 0.6, 0.2, 0] }),
  });

  // These properties cannot use useNativeDriver: true
  const glowStyle = {
    shadowRadius: glow.interpolate({ inputRange: [0, 1], outputRange: [15, 35] }),
    shadowOpacity: glow.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0.9] }),
    elevation: glow.interpolate({ inputRange: [0, 1], outputRange: [10, 20] }),
  };

  return (
    <View style={styles.wrapper}>
      {/* Ripple rings */}
      <Animated.View style={[styles.ring, makeRingStyle(ring1)]} />
      <Animated.View style={[styles.ring, makeRingStyle(ring2)]} />
      <Animated.View style={[styles.ring, makeRingStyle(ring3)]} />

      {/* 
          IMPORTANT FIX: We split the animations into two wrappers. 
          React Native does not allow mixing native and JS-driven animations on the same View.
          The outer View handles the JS shadows, the inner handles the native scaling.
      */}
      <Animated.View style={[styles.glowWrapper, pulsing && glowStyle]}>
        <Animated.View style={{ transform: [{ scale }] }}>
          <TouchableOpacity
            style={[styles.button, disabled && styles.buttonDisabled]}
            onPress={onPress}
            onLongPress={onLongPress}
            activeOpacity={0.7}
            disabled={disabled}
          >
            <View style={styles.innerRing}>
              <Text style={styles.label}>SOS</Text>
              <Text style={styles.sublabel}>TAP FOR EMERGENCY</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const SIZE = 200;

const styles = StyleSheet.create({
  wrapper: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowWrapper: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: 'transparent', // Shadow container
    ...SHADOW.lg,
    shadowColor: COLORS.danger,
  },
  ring: {
    position: 'absolute',
    width: SIZE - 20,
    height: SIZE - 20,
    borderRadius: (SIZE - 20) / 2,
    backgroundColor: COLORS.danger,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  button: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: COLORS.danger,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  innerRing: {
    width: SIZE - 16,
    height: SIZE - 16,
    borderRadius: (SIZE - 16) / 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.8,
    backgroundColor: '#333',
    borderColor: '#444',
  },
  label: {
    color: '#FFF',
    fontSize: 52,
    fontWeight: '900',
    letterSpacing: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  sublabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 10,
    fontWeight: '700',
    marginTop: -2,
    letterSpacing: 1.5,
  },
});
