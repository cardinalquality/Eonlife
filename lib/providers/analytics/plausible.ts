// Plausible Analytics provider implementation

import { AnalyticsProvider, AnalyticsEvent } from './types';
import { providersConfig } from '@/config/providers.config';

declare global {
  interface Window {
    plausible?: (eventName: string, options?: { props?: Record<string, unknown> }) => void;
  }
}

export class PlausibleProvider implements AnalyticsProvider {
  name = 'plausible';
  private domain: string;

  constructor() {
    this.domain = providersConfig.analytics.plausible.domain;

    if (typeof window !== 'undefined' && this.domain) {
      this.init();
    }
  }

  private init() {
    const script = document.createElement('script');
    script.defer = true;
    script.dataset.domain = this.domain;
    script.src = 'https://plausible.io/js/script.js';
    document.head.appendChild(script);
  }

  track(event: AnalyticsEvent): void {
    if (typeof window !== 'undefined' && window.plausible) {
      window.plausible(event.name, { props: event.properties });
    }
  }

  page(pageName?: string, properties?: Record<string, unknown>): void {
    if (typeof window !== 'undefined' && window.plausible) {
      window.plausible('pageview', { props: { page: pageName, ...properties } });
    }
  }

  identify(): void {
    // Plausible doesn't support user identification
    console.warn('Plausible does not support user identification');
  }
}
