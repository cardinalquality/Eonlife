// No-op analytics provider (for testing/development)

import { AnalyticsProvider, AnalyticsEvent } from './types';

export class NoneAnalyticsProvider implements AnalyticsProvider {
  name = 'none';

  track(event: AnalyticsEvent): void {
    console.log('[NoneAnalyticsProvider] Track event:', event);
  }

  page(pageName?: string, properties?: Record<string, unknown>): void {
    console.log('[NoneAnalyticsProvider] Page view:', pageName, properties);
  }

  identify(userId: string, traits?: Record<string, unknown>): void {
    console.log('[NoneAnalyticsProvider] Identify user:', userId, traits);
  }
}
