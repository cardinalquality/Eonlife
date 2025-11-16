// Custom API form provider implementation

import { FormProvider, FormSubmission, FormResponse } from './types';
import { providersConfig } from '@/config/providers.config';

export class CustomFormProvider implements FormProvider {
  name = 'custom';
  private endpoint: string;

  constructor() {
    this.endpoint = providersConfig.form.custom.endpoint;
  }

  async submit(data: FormSubmission): Promise<FormResponse> {
    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Form submission failed');
      }

      return {
        success: true,
        message: result.message || 'Form submitted successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Form submission failed',
      };
    }
  }

  validate(data: FormSubmission): boolean {
    return !!data.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email);
  }
}
