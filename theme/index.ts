export const Colors = {
  // Primary colors
  primary: '#007AFF',
  primaryLight: '#66B2FF',
  primaryDark: '#0056B3',

  // Secondary colors
  secondary: '#5856D6',
  accent: '#32D74B',

  // Background colors
  background: '#FFFFFF',
  surface: '#F2F2F7',
  surfaceVariant: '#E5E5EA',

  // Text colors
  text: '#000000',
  textSecondary: '#6D6D70',
  textTertiary: '#8E8E93',

  // Status colors
  success: '#32D74B',
  warning: '#FF9500',
  error: '#FF3B30',
  info: '#007AFF',

  // Border and divider colors
  border: '#D1D1D6',
  divider: '#E5E5EA',

  // Dark theme colors
  dark: {
    primary: '#0A84FF',
    primaryLight: '#40A6FF',
    primaryDark: '#0066CC',
    secondary: '#5E5CE6',
    accent: '#32D74B',
    background: '#000000',
    surface: '#1C1C1E',
    surfaceVariant: '#2C2C2E',
    text: '#FFFFFF',
    textSecondary: '#EBEBF5',
    textTertiary: '#8E8E93',
    success: '#32D74B',
    warning: '#FF9500',
    error: '#FF453A',
    info: '#64D2FF',
    border: '#38383A',
    divider: '#2C2C2E',
  },
};

export const Spacing = {
  xs: 4,
  small: 8,
  medium: 16,
  large: 24,
  xLarge: 32,
  xxLarge: 48,
};

export const BorderRadius = {
  small: 8,
  medium: 12,
  large: 16,
  xLarge: 24,
  full: 9999,
};

export const Shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
};

export const Typography = {
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
  button: {
    fontSize: 16,
    fontWeight: '500' as const,
    lineHeight: 24,
  },
};

export const Theme = {
  light: {
    colors: {
      primary: Colors.primary,
      primaryLight: Colors.primaryLight,
      primaryDark: Colors.primaryDark,
      secondary: Colors.secondary,
      accent: Colors.accent,
      background: Colors.background,
      surface: Colors.surface,
      surfaceVariant: Colors.surfaceVariant,
      text: Colors.text,
      textSecondary: Colors.textSecondary,
      textTertiary: Colors.textTertiary,
      success: Colors.success,
      warning: Colors.warning,
      error: Colors.error,
      info: Colors.info,
      border: Colors.border,
      divider: Colors.divider,
    },
    spacing: Spacing,
    borderRadius: BorderRadius,
    shadows: Shadows,
    typography: Typography,
  },
  dark: {
    colors: {
      primary: Colors.dark.primary,
      primaryLight: Colors.dark.primaryLight,
      primaryDark: Colors.dark.primaryDark,
      secondary: Colors.dark.secondary,
      accent: Colors.dark.accent,
      background: Colors.dark.background,
      surface: Colors.dark.surface,
      surfaceVariant: Colors.dark.surfaceVariant,
      text: Colors.dark.text,
      textSecondary: Colors.dark.textSecondary,
      textTertiary: Colors.dark.textTertiary,
      success: Colors.dark.success,
      warning: Colors.dark.warning,
      error: Colors.dark.error,
      info: Colors.dark.info,
      border: Colors.dark.border,
      divider: Colors.dark.divider,
    },
    spacing: Spacing,
    borderRadius: BorderRadius,
    shadows: Shadows,
    typography: Typography,
  },
};