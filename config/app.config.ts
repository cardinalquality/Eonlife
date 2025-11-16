// Global application configuration

export const appConfig = {
  // Active product (set via environment variable or default)
  activeProduct: process.env.NEXT_PUBLIC_ACTIVE_PRODUCT || 'reluma',

  // Development settings
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',

  // API endpoints
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',

  // Feature flags
  features: {
    enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
    enablePayments: process.env.NEXT_PUBLIC_ENABLE_PAYMENTS === 'true',
    enableEmailMarketing: process.env.NEXT_PUBLIC_ENABLE_EMAIL === 'true',
  },
} as const;
