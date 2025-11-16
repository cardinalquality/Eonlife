// Analytics provider factory

import { AnalyticsProvider } from './types';
import { GoogleAnalyticsProvider } from './google-analytics';
import { PlausibleProvider } from './plausible';
import { MixpanelProvider } from './mixpanel';
import { NoneAnalyticsProvider } from './none';
import { providersConfig } from '@/config/providers.config';

let analyticsProviderInstance: AnalyticsProvider | null = null;

export function getAnalyticsProvider(): AnalyticsProvider {
  if (analyticsProviderInstance) {
    return analyticsProviderInstance;
  }

  const providerType = providersConfig.analytics.provider;

  switch (providerType) {
    case 'google-analytics':
      analyticsProviderInstance = new GoogleAnalyticsProvider();
      break;
    case 'plausible':
      analyticsProviderInstance = new PlausibleProvider();
      break;
    case 'mixpanel':
      analyticsProviderInstance = new MixpanelProvider();
      break;
    case 'none':
    default:
      analyticsProviderInstance = new NoneAnalyticsProvider();
      break;
  }

  return analyticsProviderInstance;
}

export * from './types';
