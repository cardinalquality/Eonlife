// Google Analytics provider implementation

import { AnalyticsProvider, AnalyticsEvent } from './types';
import { providersConfig } from '@/config/providers.config';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export class GoogleAnalyticsProvider implements AnalyticsProvider {
  name = 'google-analytics';
  private measurementId: string;

  constructor() {
    this.measurementId = providersConfig.analytics.googleAnalytics.measurementId;

    if (typeof window !== 'undefined' && this.measurementId) {
      this.init();
    }
  }

  private init() {
    // Load GA script
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.measurementId}`;
    script.async = true;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer?.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', this.measurementId);
  }

  track(event: AnalyticsEvent): void {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', event.name, event.properties);
    }
  }

  page(pageName?: string, properties?: Record<string, unknown>): void {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'page_view', {
        page_title: pageName,
        ...properties,
      });
    }
  }

  identify(userId: string, traits?: Record<string, unknown>): void {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('set', 'user_properties', {
        user_id: userId,
        ...traits,
      });
    }
  }
}
