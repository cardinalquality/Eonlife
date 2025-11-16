'use client';

import { useEffect } from 'react';
import { getAnalyticsProvider, AnalyticsEvent } from '@/lib/providers';

export function useAnalytics() {
  const provider = getAnalyticsProvider();

  useEffect(() => {
    // Track page view on mount
    provider.page(window.location.pathname);
  }, [provider]);

  const track = (event: AnalyticsEvent) => {
    provider.track(event);
  };

  const page = (pageName?: string, properties?: Record<string, unknown>) => {
    provider.page(pageName, properties);
  };

  const identify = (userId: string, traits?: Record<string, unknown>) => {
    provider.identify(userId, traits);
  };

  return {
    track,
    page,
    identify,
  };
}
