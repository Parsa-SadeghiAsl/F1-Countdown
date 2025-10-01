import { MD3DarkTheme as DefaultTheme } from 'react-native-paper';

export const colors = {
  background: '#121212', // Near black
  primary: '#E10600',    // F1 Red
  card: '#1e1e1e',       // Dark gray for cards
  text: '#FFFFFF',       // White text
  subtle: '#a1a1a1',      // Lighter gray for descriptions
  border: '#2a2a2a',      // Subtle border color
};

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.background,
    surface: colors.card,
    text: colors.text,
  },
};
