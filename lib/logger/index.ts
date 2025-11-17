import * as Sentry from 'sentry-expo';

type LoggerLevel = 'debug' | 'info' | 'warn' | 'error';

let sentryEnabled = false;

export function initLogger(dsn?: string) {
  if (dsn && !sentryEnabled) {
    Sentry.init({
      dsn,
      enableInExpoDevelopment: false,
      debug: false,
    });
    sentryEnabled = true;
  }
}

export function setSentryUserConsent(granted: boolean) {
  if (granted) {
    Sentry.Native.setUser({ consent: 'granted' });
  } else {
    Sentry.Native.setUser(null);
  }
}

export function log(level: LoggerLevel, message: string, extra?: Record<string, unknown>) {
  const payload = extra ? { message, extra } : { message };

  switch (level) {
    case 'debug':
    case 'info':
      console.log('[SaverFlow]', payload);
      break;
    case 'warn':
      console.warn('[SaverFlow]', payload);
      break;
    case 'error':
      console.error('[SaverFlow]', payload);
      if (sentryEnabled) {
        Sentry.Native.captureMessage(message, {
          level: 'error',
          extra,
        });
      }
      break;
    default:
      console.log('[SaverFlow]', payload);
  }
}

export function captureException(error: unknown, context?: Record<string, unknown>) {
  console.error('[SaverFlow] exception', error, context);
  if (sentryEnabled) {
    Sentry.Native.captureException(error, { extra: context });
  }
}
