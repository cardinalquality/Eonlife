// Global application configuration

// Determine the current environment
const getEnvironment = () => {
  // Check for explicit environment override
  const envOverride = process.env.NEXT_PUBLIC_ENVIRONMENT;
  if (envOverride) {
    return envOverride as 'development' | 'staging' | 'production';
  }

  // Detect environment based on URL or NODE_ENV
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';

  if (appUrl.includes('localhost') || appUrl.includes('127.0.0.1')) {
    return 'development';
  }

  if (appUrl.includes('staging') || appUrl.includes('preview')) {
    return 'staging';
  }

  if (process.env.NODE_ENV === 'production') {
    return 'production';
  }

  return 'development';
};

export const appConfig = {
  // Environment detection
  environment: getEnvironment(),
  isDevelopment: process.env.NODE_ENV === 'development',
  isStaging: getEnvironment() === 'staging',
  isProduction: process.env.NODE_ENV === 'production' && getEnvironment() === 'production',

  // Active product (set via environment variable or default)
  activeProduct: process.env.NEXT_PUBLIC_ACTIVE_PRODUCT || 'reluma',

  // API endpoints
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',

  // Feature flags
  features: {
    enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
    enablePayments: process.env.NEXT_PUBLIC_ENABLE_PAYMENTS === 'true',
    enableEmailMarketing: process.env.NEXT_PUBLIC_ENABLE_EMAIL === 'true',
  },

  // Database configuration
  database: {
    poolMin: parseInt(process.env.DB_POOL_MIN || '2', 10),
    poolMax: parseInt(process.env.DB_POOL_MAX || '20', 10),
    idleTimeout: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10),
    connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '2000', 10),
  },

  // Logging and debugging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    debug: process.env.DEBUG === 'true',
  },
} as const;
