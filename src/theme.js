// src/theme.js
export const COLORS = {
  // Core brand
  danger: '#FF3B30', // Vibrant red for high visibility
  dangerLight: 'rgba(255, 59, 48, 0.15)',
  dangerDark: '#D70015',
  primary: '#0A84FF', // Bright iOS-style blue
  primaryLight: 'rgba(10, 132, 255, 0.15)',
  success: '#32D74B', // Vibrant green
  successLight: 'rgba(50, 215, 75, 0.15)',
  warning: '#FFD60A', // Vibrant yellow
  warningLight: 'rgba(255, 214, 10, 0.15)',

  // UI (High-Contrast Dark)
  background: '#000000', // Pure black for OLED efficiency and high contrast
  surface: '#1C1C1E', // Dark gray surface
  surfaceAlt: '#2C2C2E', // Slightly lighter surface
  border: '#3A3A3C',
  borderLight: '#2C2C2E',

  // Text
  text: '#FFFFFF',
  textSecondary: '#EBEBF5',
  textMuted: '#8E8E93',

  // Emergency type colors
  medical: '#FF3B30',
  accident: '#FF9500',
  fire: '#FF453A',
  security: '#5E5CE6',
};

export const FONTS = {
  regular: 'System',
  size: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 22,
    xxl: 30,
    xxxl: 52,
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
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  round: 999,
};

export const SHADOW = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 6,
  },
  lg: {
    shadowColor: '#FF3B30', // Red glow for emergency elements
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
};
