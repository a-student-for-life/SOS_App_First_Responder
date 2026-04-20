// src/theme.js
export const COLORS = {
  // Core brand
  danger: '#E8302A',
  dangerLight: '#FDECEA',
  dangerDark: '#B71C1C',
  primary: '#1A73E8',
  primaryLight: '#E8F0FE',
  success: '#1B8B44',
  successLight: '#E6F4EA',
  warning: '#F29900',
  warningLight: '#FEF3E2',

  // UI
  background: '#F5F5F5',
  surface: '#FFFFFF',
  surfaceAlt: '#F8F9FA',
  border: '#E0E0E0',
  borderLight: '#F0F0F0',

  // Text
  text: '#1A1A1A',
  textSecondary: '#5F6368',
  textMuted: '#9AA0A6',

  // Emergency type colors
  medical: '#E53935',
  accident: '#FB8C00',
  fire: '#E91E63',
  security: '#5C6BC0',
};

export const FONTS = {
  regular: 'System',
  size: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 28,
    xxxl: 48,
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 999,
};

export const SHADOW = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
};
