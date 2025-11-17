import '@/styles/global.css';
import { ThemeProvider } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect, useMemo } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';

import { AnalyticsProvider } from '@/lib/analytics/provider';
import { queryClient } from '@/lib/api/query-client';
import { navigationDarkTheme, navigationLightTheme } from '@/lib/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

SplashScreen.preventAutoHideAsync().catch(() => {
  // It's safe to ignore this promise rejection if the splash screen was already hidden.
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [fontsLoaded, fontError]);

  const theme = useMemo(
    () => (colorScheme === 'dark' ? navigationDarkTheme : navigationLightTheme),
    [colorScheme],
  );

  const statusBarStyle = colorScheme === 'dark' ? 'light' : 'dark';

  const onLayoutRootView = useCallback(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [fontsLoaded]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AnalyticsProvider>
            <ThemeProvider value={theme}>
              <StatusBar style={statusBarStyle} />
              <Stack
                screenOptions={{
                  headerShown: false,
                  animation: 'fade',
                }}
              >
                <Stack.Screen name="index" />
                <Stack.Screen name="onboarding/index" />
                <Stack.Screen name="dashboard/index" />
                <Stack.Screen name="insights/index" />
                <Stack.Screen name="goals/index" />
                <Stack.Screen name="pricing/index" />
                <Stack.Screen name="settings/index" />
                <Stack.Screen name="support/index" />
              </Stack>
            </ThemeProvider>
          </AnalyticsProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
