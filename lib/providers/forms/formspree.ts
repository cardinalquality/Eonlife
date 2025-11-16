// Formspree form provider implementation

import { FormProvider, FormSubmission, FormResponse } from './types';
import { providersConfig } from '@/config/providers.config';

export class FormspreeProvider implements FormProvider {
  name = 'formspree';
  private endpoint: string;

  constructor() {
    this.endpoint = providersConfig.form.formspree.endpoint;
    if (!this.endpoint) {
      console.warn('Formspree endpoint not configured');
    }
  }

  async submit(data: FormSubmission): Promise<FormResponse> {
    if (!this.endpoint) {
      return {
        success: false,
        error: 'Formspree endpoint not configured',
      };
    }

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return {
        success: true,
        message: 'Form submitted successfully',
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
