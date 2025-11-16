// No-op form provider (for testing/development)

import { FormProvider, FormSubmission, FormResponse } from './types';

export class NoneFormProvider implements FormProvider {
  name = 'none';

  async submit(data: FormSubmission): Promise<FormResponse> {
    console.log('[NoneFormProvider] Form submission (no-op):', data);
    return {
      success: true,
      message: 'Form provider not configured (development mode)',
    };
  }

  validate(data: FormSubmission): boolean {
    return !!data.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email);
  }
}
