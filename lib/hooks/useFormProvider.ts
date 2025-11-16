'use client';

import { useState } from 'react';
import { getFormProvider, FormSubmission, FormResponse } from '@/lib/providers';

export function useFormProvider() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [response, setResponse] = useState<FormResponse | null>(null);

  const submitForm = async (data: FormSubmission): Promise<FormResponse> => {
    setIsSubmitting(true);
    setResponse(null);

    try {
      const provider = getFormProvider();
      const result = await provider.submit(data);
      setResponse(result);
      return result;
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetResponse = () => {
    setResponse(null);
  };

  return {
    submitForm,
    isSubmitting,
    response,
    resetResponse,
  };
}
