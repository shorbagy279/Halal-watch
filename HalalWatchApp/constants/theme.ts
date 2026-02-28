// constants/theme.ts

export const Colors = {
  // Deep forest greens - primary palette
  background: '#080F09',
  surface: '#0D1A10',
  surfaceElevated: '#132018',
  surfaceHigh: '#1A2E1E',
  border: '#1F3524',
  borderLight: '#2A4A30',

  // Brand greens
  primary: '#2ECC71',
  primaryDim: '#27AE60',
  primaryGlow: '#58D68D',
  primaryMuted: '#1A5C32',
  primaryFaint: '#0D2E19',

  // Gold accent (Islamic geometric motif accent)
  gold: '#D4AF37',
  goldDim: '#B8962E',
  goldFaint: '#2A2210',

  // Text
  textPrimary: '#E8F5E9',
  textSecondary: '#8FAF94',
  textMuted: '#4A6B50',
  textInverse: '#080F09',

  // Score colors
  scoreGood: '#2ECC71',
  scoreCaution: '#F39C12',
  scoreBad: '#E74C3C',

  // Verdict
  verdictAppropriate: '#2ECC71',
  verdictCaution: '#F39C12',
  verdictInappropriate: '#E74C3C',

  // Overlays
  overlay: 'rgba(8, 15, 9, 0.85)',
  overlayLight: 'rgba(8, 15, 9, 0.5)',
  glassGreen: 'rgba(46, 204, 113, 0.08)',
  glassBorder: 'rgba(46, 204, 113, 0.15)',
};

export const Typography = {
  // Display - Amiri-like feel (Arabic/Islamic aesthetic)
  displayFamily: 'serif',

  sizes: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    xxl: 30,
    xxxl: 38,
    display: 48,
  },

  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    black: '900' as const,
  },

  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.8,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  section: 64,
};

export const Radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  xxl: 28,
  full: 999,
};

export const Shadows = {
  greenGlow: {
    shadowColor: '#2ECC71',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  subtle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
};