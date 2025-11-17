import { DarkTheme as NavigationDarkTheme, DefaultTheme as NavigationLightTheme } from '@react-navigation/native';

export const colors = {
  navy: '#0A1930',
  blue: '#4A90E2',
  lime: '#B9F46E',
  gray: '#6B7280',
  offwhite: '#FAFAFA',
  white: '#FFFFFF',
  slate: '#1F2A3D',
};

export type ColorToken = keyof typeof colors;

export const typography = {
  fontFamily: 'Inter',
  display: 'Inter',
};

export const appLightTheme = {
  primary: colors.blue,
  background: colors.offwhite,
  surface: colors.white,
  text: colors.navy,
  subtle: colors.gray,
  success: colors.lime,
};

export const appDarkTheme = {
  primary: colors.blue,
  background: colors.navy,
  surface: colors.slate,
  text: colors.offwhite,
  subtle: colors.gray,
  success: colors.lime,
};

export const navigationLightTheme = {
  ...NavigationLightTheme,
  colors: {
    ...NavigationLightTheme.colors,
    background: appLightTheme.background,
    card: appLightTheme.surface,
    primary: appLightTheme.primary,
    text: appLightTheme.text,
    border: 'rgba(10, 25, 48, 0.08)',
  },
};

export const navigationDarkTheme = {
  ...NavigationDarkTheme,
  colors: {
    ...NavigationDarkTheme.colors,
    background: appDarkTheme.background,
    card: appDarkTheme.surface,
    primary: appDarkTheme.primary,
    text: appDarkTheme.text,
    border: 'rgba(255, 255, 255, 0.12)',
  },
};
