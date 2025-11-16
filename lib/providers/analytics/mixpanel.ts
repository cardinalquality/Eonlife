// Mixpanel Analytics provider implementation

import { AnalyticsProvider, AnalyticsEvent } from './types';
import { providersConfig } from '@/config/providers.config';

declare global {
  interface Window {
    mixpanel?: {
      init: (token: string) => void;
      track: (event: string, properties?: Record<string, unknown>) => void;
      identify: (userId: string) => void;
      people: {
        set: (traits: Record<string, unknown>) => void;
      };
    };
  }
}

export class MixpanelProvider implements AnalyticsProvider {
  name = 'mixpanel';
  private token: string;

  constructor() {
    this.token = providersConfig.analytics.mixpanel.token;

    if (typeof window !== 'undefined' && this.token) {
      this.init();
    }
  }

  private init() {
    // Load Mixpanel script
    const script = document.createElement('script');
    script.src = 'https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js';
    script.async = true;
    script.onload = () => {
      if (window.mixpanel) {
        window.mixpanel.init(this.token);
      }
    };
    document.head.appendChild(script);
  }

  track(event: AnalyticsEvent): void {
    if (typeof window !== 'undefined' && window.mixpanel) {
      window.mixpanel.track(event.name, event.properties);
    }
  }

  page(pageName?: string, properties?: Record<string, unknown>): void {
    if (typeof window !== 'undefined' && window.mixpanel) {
      window.mixpanel.track('Page View', {
        page: pageName,
        ...properties,
      });
    }
  }

  identify(userId: string, traits?: Record<string, unknown>): void {
    if (typeof window !== 'undefined' && window.mixpanel) {
      window.mixpanel.identify(userId);
      if (traits) {
        window.mixpanel.people.set(traits);
      }
    }
  }
}
