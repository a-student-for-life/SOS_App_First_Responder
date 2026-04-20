// src/components/SOSButton.js
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from 'react-native';
import { COLORS, RADIUS, SHADOW } from '../theme';

export default function SOSButton({ onPress, onLongPress, disabled, pulsing }) {
  const scale = useRef(new Animated.Value(1)).current;
  const ring1 = useRef(new Animated.Value(0)).current;
  const ring2 = useRef(new Animated.Value(0)).current;
  const ring3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (pulsing) {
      const pulse = () =>
        Animated.loop(
          Animated.sequence([
            Animated.timing(scale, { toValue: 1.04, duration: 700, useNativeDriver: true }),
            Animated.timing(scale, { toValue: 1, duration: 700, useNativeDriver: true }),
          ])
        ).start();
      pulse();

      const ripple = (anim, delay) =>
        Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(anim, { toValue: 1, duration: 1800, useNativeDriver: true }),
          ])
        ).start();
      ripple(ring1, 0);
      ripple(ring2, 600);
      ripple(ring3, 1200);
    } else {
      scale.setValue(1);
      ring1.setValue(0);
      ring2.setValue(0);
      ring3.setValue(0);
    }
  }, [pulsing]);

  const makeRingStyle = (anim) => ({
    transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [1, 2.2] }) }],
    opacity: anim.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 0.35, 0] }),
  });

  return (
    <View style={styles.wrapper}>
      {/* Ripple rings */}
      <Animated.View style={[styles.ring, makeRingStyle(ring1)]} />
      <Animated.View style={[styles.ring, makeRingStyle(ring2)]} />
      <Animated.View style={[styles.ring, makeRingStyle(ring3)]} />

      {/* Main button */}
      <Animated.View style={{ transform: [{ scale }] }}>
        <TouchableOpacity
          style={[styles.button, disabled && styles.buttonDisabled]}
          onPress={onPress}
          onLongPress={onLongPress}
          activeOpacity={0.85}
          disabled={disabled}
        >
          <Text style={styles.label}>SOS</Text>
          <Text style={styles.sublabel}>Press to Alert</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const SIZE = 180;

const styles = StyleSheet.create({
  wrapper: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: COLORS.danger,
  },
  button: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: COLORS.danger,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.lg,
    shadowColor: COLORS.danger,
    shadowOpacity: 0.5,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  label: {
    color: '#FFF',
    fontSize: 42,
    fontWeight: '800',
    letterSpacing: 2,
  },
  sublabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 2,
    letterSpacing: 0.5,
  },
});
