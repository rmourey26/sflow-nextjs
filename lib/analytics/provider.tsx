import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import posthog from 'posthog-js';

import { log } from '@/lib/logger';

type AnalyticsClient = {
  capture: (event: string, properties?: Record<string, unknown>) => Promise<void> | void;
  identify?: (id: string, properties?: Record<string, unknown>) => Promise<void> | void;
  screen?: (name: string, properties?: Record<string, unknown>) => Promise<void> | void;
  alias?: (alias: string) => Promise<void> | void;
  optOut?: () => Promise<void> | void;
  optIn?: () => Promise<void> | void;
};

type AnalyticsContextValue = {
  ready: boolean;
  track: (event: string, properties?: Record<string, unknown>) => void;
  identify: (id: string, properties?: Record<string, unknown>) => void;
  screen: (name: string, properties?: Record<string, unknown>) => void;
  optOut: () => void;
  optIn: () => void;
};

const defaultValue: AnalyticsContextValue = {
  ready: false,
  track: () => undefined,
  identify: () => undefined,
  screen: () => undefined,
  optOut: () => undefined,
  optIn: () => undefined,
};

export const AnalyticsContext = createContext(defaultValue);

type ProviderProps = {
  children: ReactNode;
};

export function AnalyticsProvider({ children }: ProviderProps) {
  const [ready, setReady] = useState(false);
  const clientRef = useRef<AnalyticsClient | null>(null);
  const [hasOptedOut, setHasOptedOut] = useState(false);

  const extra = Constants?.expoConfig?.extra ?? {};
  const apiKey =
    extra?.posthogKey ?? process.env.EXPO_PUBLIC_POSTHOG_KEY ?? process.env.EXPO_PUBLIC_POSTHOG_API_KEY;
  const apiHost =
    extra?.posthogHost ?? process.env.EXPO_PUBLIC_POSTHOG_HOST ?? 'https://app.posthog.com';

  useEffect(() => {
    if (!apiKey || ready) {
      setReady(true);
      return;
    }

    let isMounted = true;

    async function init() {
      try {
        if (Platform.OS === 'web') {
          posthog.init(apiKey, {
            api_host: apiHost,
            autocapture: false,
            capture_pageview: false,
            loaded: () => {
              if (isMounted) {
                clientRef.current = {
                  capture: (event, properties) => {
                    posthog.capture(event, properties);
                  },
                  identify: (id, properties) => {
                    posthog.identify(id, properties);
                  },
                  alias: (alias) => {
                    posthog.alias(alias);
                  },
                  optOut: () => {
                    posthog.opt_out_capturing();
                  },
                  optIn: () => {
                    posthog.opt_in_capturing();
                  },
                };
                setReady(true);
              }
            },
          });
        } else {
          const nativeModule = await import('posthog-react-native');
          const NativePostHog = (nativeModule.default ?? nativeModule.PostHog) as new (
            apiKey: string,
            options: { host?: string },
          ) => {
            capture: (event: string, properties?: Record<string, unknown>) => Promise<void> | void;
            identify?: (id: string, properties?: Record<string, unknown>) => Promise<void> | void;
            alias?: (alias: string) => Promise<void> | void;
            optOut?: () => Promise<void> | void;
            optIn?: () => Promise<void> | void;
            screen?: (name: string, properties?: Record<string, unknown>) => Promise<void> | void;
          };

          const nativeClient = new NativePostHog(apiKey, {
            host: apiHost,
          });

          if (isMounted) {
            clientRef.current = {
              capture: (event, properties) => nativeClient.capture(event, properties),
              identify: nativeClient.identify
                ? (id: string, properties?: Record<string, unknown>) => nativeClient.identify?.(id, properties)
                : undefined,
              alias: nativeClient.alias ? (alias: string) => nativeClient.alias?.(alias) : undefined,
              optOut: nativeClient.optOut ? () => nativeClient.optOut?.() : undefined,
              optIn: nativeClient.optIn ? () => nativeClient.optIn?.() : undefined,
              screen: nativeClient.screen
                ? (name: string, properties?: Record<string, unknown>) => nativeClient.screen?.(name, properties)
                : undefined,
            };
            setReady(true);
          }
        }
      } catch (error) {
        log('warn', 'Analytics init failed', { error });
        if (isMounted) {
          setReady(true);
        }
      }
    }

    init();

    return () => {
      isMounted = false;
    };
  }, [apiHost, apiKey, ready]);

  const track = useCallback<AnalyticsContextValue['track']>(
    (event, properties) => {
      const client = clientRef.current;
      if (!client || hasOptedOut) {
        return;
      }
      void client.capture(event, properties);
    },
    [hasOptedOut],
  );

  const identify = useCallback<AnalyticsContextValue['identify']>(
    (id, properties) => {
      const client = clientRef.current;
      if (!client || !client.identify || hasOptedOut) {
        return;
      }
      void client.identify(id, properties);
    },
    [hasOptedOut],
  );

  const screen = useCallback<AnalyticsContextValue['screen']>(
    (name, properties) => {
      const client = clientRef.current;
      if (!client || !client.screen || hasOptedOut) {
        return;
      }
      void client.screen(name, properties);
    },
    [hasOptedOut],
  );

  const optOut = useCallback(() => {
    const client = clientRef.current;
    if (client?.optOut) {
      client.optOut();
      setHasOptedOut(true);
    }
  }, []);

  const optIn = useCallback(() => {
    const client = clientRef.current;
    if (client?.optIn) {
      client.optIn();
      setHasOptedOut(false);
    }
  }, []);

  const value = useMemo<AnalyticsContextValue>(
    () => ({
      ready,
      track,
      identify,
      screen,
      optOut,
      optIn,
    }),
    [identify, optIn, optOut, ready, screen, track],
  );

  return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>;
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within AnalyticsProvider');
  }
  return context;
}
