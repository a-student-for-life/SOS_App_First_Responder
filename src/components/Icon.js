// src/components/Icon.js
// Emoji-based icon replacement — no font loading, works everywhere
import React from 'react';
import { Text } from 'react-native';

const ICONS = {
  // Navigation & UI
  'chevron-forward': '›',
  'close': '✕',
  'checkmark': '✓',
  'checkmark-circle': '✅',
  'checkmark-circle-outline': '⭕',
  'add': '+',
  'menu': '☰',
  'search': '🔍',
  'swap-horizontal': '⇄',

  // Person & profile
  'person': '👤',
  'person-circle-outline': '👤',
  'people-outline': '👥',

  // Location & navigation
  'location': '📍',
  'navigate': '🧭',
  'navigate-circle-outline': '🧭',
  'navigate-outline': '🧭',
  'map': '🗺️',

  // Emergency & safety
  'shield': '🛡️',
  'shield-outline': '🛡️',
  'shield-checkmark': '✅',
  'shield-checkmark-outline': '🛡️',
  'shield-half': '🛡️',
  'warning': '⚠️',
  'alert-circle': '⚠️',
  'medkit': '🩺',
  'medkit-outline': '🩺',
  'call': '📞',
  'call-outline': '📞',
  'flame': '🔥',
  'car-crash': '🚗',

  // Status & info
  'notifications': '🔔',
  'notifications-outline': '🔔',
  'notifications-off-outline': '🔕',
  'radio': '📡',
  'radio-outline': '📡',
  'time': '🕐',
  'time-outline': '🕐',
  'information-circle-outline': 'ℹ️',

  // Actions
  'log-out-outline': '🚪',
  'moon-outline': '🌙',
  'checkmark-done': '✓✓',

  // Misc
  'location-outline': '📍',
};

export default function Icon({ name, size = 16, color, style }) {
  const emoji = ICONS[name] || '•';
  return (
    <Text style={[{ fontSize: size, color: color || undefined, lineHeight: size + 4 }, style]}>
      {emoji}
    </Text>
  );
}
