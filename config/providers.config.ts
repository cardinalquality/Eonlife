// Service provider configuration

export const providersConfig = {
  // Form providers
  form: {
    provider: (process.env.NEXT_PUBLIC_FORM_PROVIDER || 'none') as 'formspree' | 'sendgrid' | 'custom' | 'none',
    formspree: {
      endpoint: process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT || '',
    },
    sendgrid: {
      apiKey: process.env.SENDGRID_API_KEY || '',
      endpoint: process.env.NEXT_PUBLIC_SENDGRID_ENDPOINT || '/api/form/sendgrid',
    },
    custom: {
      endpoint: process.env.NEXT_PUBLIC_CUSTOM_FORM_ENDPOINT || '/api/form',
    },
  },

  // Analytics providers
  analytics: {
    provider: (process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER || 'none') as 'google-analytics' | 'plausible' | 'mixpanel' | 'none',
    googleAnalytics: {
      measurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '',
    },
    plausible: {
      domain: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN || '',
    },
    mixpanel: {
      token: process.env.NEXT_PUBLIC_MIXPANEL_TOKEN || '',
    },
  },

  // Payment providers
  payment: {
    provider: (process.env.NEXT_PUBLIC_PAYMENT_PROVIDER || 'none') as 'stripe' | 'paypal' | 'square' | 'shopify' | 'none',
    stripe: {
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
    },
    paypal: {
      clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '',
    },
    square: {
      applicationId: process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID || '',
      locationId: process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID || '',
    },
    shopify: {
      domain: process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN || '',
      storefrontToken: process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN || '',
    },
  },

  // Email marketing providers
  email: {
    provider: (process.env.NEXT_PUBLIC_EMAIL_PROVIDER || 'none') as 'mailchimp' | 'convertkit' | 'sendgrid' | 'none',
    mailchimp: {
      apiKey: process.env.MAILCHIMP_API_KEY || '',
      listId: process.env.MAILCHIMP_LIST_ID || '',
    },
    convertkit: {
      apiKey: process.env.CONVERTKIT_API_KEY || '',
      formId: process.env.CONVERTKIT_FORM_ID || '',
    },
    sendgrid: {
      apiKey: process.env.SENDGRID_API_KEY || '',
      listId: process.env.SENDGRID_LIST_ID || '',
    },
  },
} as const;
