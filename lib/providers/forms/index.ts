// Form provider factory

import { FormProvider } from './types';
import { FormspreeProvider } from './formspree';
import { SendGridProvider } from './sendgrid';
import { CustomFormProvider } from './custom';
import { NoneFormProvider } from './none';
import { providersConfig } from '@/config/providers.config';

let formProviderInstance: FormProvider | null = null;

export function getFormProvider(): FormProvider {
  if (formProviderInstance) {
    return formProviderInstance;
  }

  const providerType = providersConfig.form.provider;

  switch (providerType) {
    case 'formspree':
      formProviderInstance = new FormspreeProvider();
      break;
    case 'sendgrid':
      formProviderInstance = new SendGridProvider();
      break;
    case 'custom':
      formProviderInstance = new CustomFormProvider();
      break;
    case 'none':
    default:
      formProviderInstance = new NoneFormProvider();
      break;
  }

  return formProviderInstance;
}

export * from './types';
