// Unified provider registry

import { getFormProvider as getFormProviderImpl } from './forms';
import { getAnalyticsProvider as getAnalyticsProviderImpl } from './analytics';

export { getFormProviderImpl as getFormProvider };
export type { FormProvider, FormSubmission, FormResponse } from './forms/types';

export { getAnalyticsProviderImpl as getAnalyticsProvider };
export type { AnalyticsProvider, AnalyticsEvent } from './analytics/types';

// Convenience function to initialize all providers
export function initializeProviders() {
  if (typeof window === 'undefined') {
    return;
  }

  // Initialize analytics provider (auto-initializes on instantiation)
  getAnalyticsProviderImpl();
}
