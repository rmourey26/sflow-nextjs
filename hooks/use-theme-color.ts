import { appDarkTheme, appLightTheme } from '@/lib/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof appLightTheme & keyof typeof appDarkTheme
) {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return theme === 'dark' ? appDarkTheme[colorName] : appLightTheme[colorName];
  }
}
