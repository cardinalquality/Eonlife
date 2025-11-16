// Form provider interface

export interface FormSubmission {
  name?: string;
  email: string;
  phone?: string;
  message?: string;
  [key: string]: unknown;
}

export interface FormResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface FormProvider {
  name: string;
  submit(data: FormSubmission): Promise<FormResponse>;
  validate?(data: FormSubmission): boolean;
}
