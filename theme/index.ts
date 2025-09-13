export const Colors = {
  primary: '#6200EE',
  accent: '#03DAC6',
  background: '#FFFFFF',
  text: '#000000',
  error: '#B00020',
  // Dark theme colors
  dark_primary: '#BB86FC',
  dark_accent: '#03DAC6',
  dark_background: '#121212',
  dark_text: '#FFFFFF',
  dark_error: '#CF6679',
};

export const Spacing = {
  small: 8,
  medium: 16,
  large: 24,
  xLarge: 32,
};

export const Typography = {
  h1: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  h2: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  body: {
    fontSize: 16,
    fontWeight: 'normal',
  },
};

export const Theme = {
  light: {
    colors: {
      primary: Colors.primary,
      accent: Colors.accent,
      background: Colors.background,
      text: Colors.text,
      error: Colors.error,
    },
    spacing: Spacing,
    typography: Typography,
  },
  dark: {
    colors: {
      primary: Colors.dark_primary,
      accent: Colors.dark_accent,
      background: Colors.dark_background,
      text: Colors.dark_text,
      error: Colors.dark_error,
    },
    spacing: Spacing,
    typography: Typography,
  },
};