// Analytics provider interface

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, unknown>;
}

export interface AnalyticsProvider {
  name: string;
  track(event: AnalyticsEvent): void;
  page(pageName?: string, properties?: Record<string, unknown>): void;
  identify(userId: string, traits?: Record<string, unknown>): void;
}
