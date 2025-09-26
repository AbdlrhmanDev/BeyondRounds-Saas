/**
 * Application Configuration Constants
 * Centralized configuration values for the application
 */

// Environment Configuration
export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_TEST: process.env.NODE_ENV === 'test',
} as const

// Application Configuration
export const APP_CONFIG = {
  NAME: 'BeyondRounds',
  DESCRIPTION: 'Professional networking platform for medical professionals',
  VERSION: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  API_URL: process.env.NEXT_PUBLIC_API_URL || '/api',
  WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000',
} as const

// Database Configuration
export const DATABASE_CONFIG = {
  CONNECTION_STRING: process.env.DATABASE_URL || '',
  POOL_SIZE: parseInt(process.env.DB_POOL_SIZE || '10'),
  CONNECTION_TIMEOUT: parseInt(process.env.DB_CONNECTION_TIMEOUT || '30000'),
  QUERY_TIMEOUT: parseInt(process.env.DB_QUERY_TIMEOUT || '60000'),
} as const

// Authentication Configuration
export const AUTH_CONFIG = {
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d',
  SESSION_TIMEOUT: parseInt(process.env.SESSION_TIMEOUT || '3600000'), // 1 hour
  MAX_LOGIN_ATTEMPTS: parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5'),
  LOCKOUT_DURATION: parseInt(process.env.LOCKOUT_DURATION || '900000'), // 15 minutes
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REQUIRE_UPPERCASE: true,
  PASSWORD_REQUIRE_LOWERCASE: true,
  PASSWORD_REQUIRE_NUMBERS: true,
  PASSWORD_REQUIRE_SYMBOLS: true,
} as const

// File Upload Configuration
export const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
  MAX_IMAGE_SIZE: parseInt(process.env.MAX_IMAGE_SIZE || '5242880'), // 5MB
  MAX_DOCUMENT_SIZE: parseInt(process.env.MAX_DOCUMENT_SIZE || '10485760'), // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'image/jpeg', 'image/png'],
  UPLOAD_DIR: process.env.UPLOAD_DIR || './uploads',
  CDN_URL: process.env.CDN_URL || '',
} as const

// Email Configuration
export const EMAIL_CONFIG = {
  PROVIDER: process.env.EMAIL_PROVIDER || 'smtp',
  SMTP_HOST: process.env.SMTP_HOST || 'localhost',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587'),
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  FROM_EMAIL: process.env.FROM_EMAIL || 'noreply@beyondrounds.com',
  FROM_NAME: process.env.FROM_NAME || 'BeyondRounds',
  REPLY_TO: process.env.REPLY_TO || 'support@beyondrounds.com',
} as const

// Payment Configuration
export const PAYMENT_CONFIG = {
  STRIPE_PUBLIC_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || '',
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',
  CURRENCY: 'USD',
  TAX_RATE: 0.08, // 8%
  SUBSCRIPTION_PLANS: {
    FREE: {
      name: 'Free',
      price: 0,
      features: ['Basic matching', 'Limited messages'],
    },
    PREMIUM: {
      name: 'Premium',
      price: 29.99,
      features: ['Advanced matching', 'Unlimited messages', 'Priority support'],
    },
    PROFESSIONAL: {
      name: 'Professional',
      price: 49.99,
      features: ['All Premium features', 'Group matching', 'Analytics'],
    },
  },
} as const

// Matching Configuration
export const MATCHING_CONFIG = {
  MAX_MATCHES_PER_DAY: parseInt(process.env.MAX_MATCHES_PER_DAY || '50'),
  COMPATIBILITY_THRESHOLD: 0.6,
  LOCATION_RADIUS: parseInt(process.env.LOCATION_RADIUS || '50'), // km
  AGE_RANGE: {
    MIN: 18,
    MAX: 100,
  },
  GROUP_SIZE: {
    MIN: 3,
    MAX: 8,
  },
  MATCHING_ALGORITHM: 'weighted_score',
  WEIGHTS: {
    SPECIALTY: 0.3,
    LOCATION: 0.2,
    INTERESTS: 0.2,
    CAREER_STAGE: 0.15,
    AGE: 0.1,
    ACTIVITY_LEVEL: 0.05,
  },
} as const

// Notification Configuration
export const NOTIFICATION_CONFIG = {
  ENABLE_EMAIL: process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true',
  ENABLE_PUSH: process.env.ENABLE_PUSH_NOTIFICATIONS === 'true',
  ENABLE_SMS: process.env.ENABLE_SMS_NOTIFICATIONS === 'true',
  BATCH_SIZE: parseInt(process.env.NOTIFICATION_BATCH_SIZE || '100'),
  RETRY_ATTEMPTS: parseInt(process.env.NOTIFICATION_RETRY_ATTEMPTS || '3'),
  RETRY_DELAY: parseInt(process.env.NOTIFICATION_RETRY_DELAY || '5000'),
} as const

// Rate Limiting Configuration
export const RATE_LIMIT_CONFIG = {
  WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW || '900000'), // 15 minutes
  MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX || '100'),
  SKIP_SUCCESSFUL_REQUESTS: false,
  SKIP_FAILED_REQUESTS: false,
} as const

// Cache Configuration
export const CACHE_CONFIG = {
  TTL: parseInt(process.env.CACHE_TTL || '3600'), // 1 hour
  MAX_ITEMS: parseInt(process.env.CACHE_MAX_ITEMS || '1000'),
  ENABLE_REDIS: process.env.ENABLE_REDIS === 'true',
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
} as const

// Security Configuration
export const SECURITY_CONFIG = {
  CORS_ORIGINS: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
  HELMET_ENABLED: process.env.HELMET_ENABLED !== 'false',
  CSRF_ENABLED: process.env.CSRF_ENABLED === 'true',
  RATE_LIMITING_ENABLED: process.env.RATE_LIMITING_ENABLED !== 'false',
  CONTENT_SECURITY_POLICY: {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'"],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'data:', 'https:'],
    'connect-src': ["'self'", 'https:', 'wss:'],
  },
} as const

// Logging Configuration
export const LOGGING_CONFIG = {
  LEVEL: process.env.LOG_LEVEL || 'info',
  FORMAT: process.env.LOG_FORMAT || 'json',
  ENABLE_CONSOLE: process.env.ENABLE_CONSOLE_LOGGING !== 'false',
  ENABLE_FILE: process.env.ENABLE_FILE_LOGGING === 'true',
  LOG_FILE: process.env.LOG_FILE || './logs/app.log',
  MAX_FILE_SIZE: process.env.LOG_MAX_FILE_SIZE || '10m',
  MAX_FILES: process.env.LOG_MAX_FILES || '5',
} as const

// Feature Flags
export const FEATURE_FLAGS = {
  ENABLE_CHAT: process.env.ENABLE_CHAT !== 'false',
  ENABLE_VIDEO_CALLS: process.env.ENABLE_VIDEO_CALLS === 'true',
  ENABLE_GROUP_MATCHING: process.env.ENABLE_GROUP_MATCHING !== 'false',
  ENABLE_VERIFICATION: process.env.ENABLE_VERIFICATION !== 'false',
  ENABLE_ANALYTICS: process.env.ENABLE_ANALYTICS === 'true',
  ENABLE_BETA_FEATURES: process.env.ENABLE_BETA_FEATURES === 'true',
  ENABLE_MAINTENANCE_MODE: process.env.ENABLE_MAINTENANCE_MODE === 'true',
} as const

// UI Configuration
export const UI_CONFIG = {
  THEME: {
    DEFAULT: 'light',
    SUPPORTED: ['light', 'dark', 'system'],
  },
  LANGUAGE: {
    DEFAULT: 'ar',
    SUPPORTED: ['ar', 'en'],
  },
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 20,
    PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  },
  ANIMATION: {
    ENABLED: true,
    DURATION: 300,
  },
  BREAKPOINTS: {
    SM: 640,
    MD: 768,
    LG: 1024,
    XL: 1280,
    '2XL': 1536,
  },
} as const

// API Configuration
export const API_CONFIG = {
  TIMEOUT: parseInt(process.env.API_TIMEOUT || '10000'),
  RETRY_ATTEMPTS: parseInt(process.env.API_RETRY_ATTEMPTS || '3'),
  RETRY_DELAY: parseInt(process.env.API_RETRY_DELAY || '1000'),
  VERSION: process.env.API_VERSION || 'v1',
  BASE_PATH: process.env.API_BASE_PATH || '/api',
} as const

// WebSocket Configuration
export const WEBSOCKET_CONFIG = {
  HEARTBEAT_INTERVAL: parseInt(process.env.WS_HEARTBEAT_INTERVAL || '30000'),
  RECONNECT_INTERVAL: parseInt(process.env.WS_RECONNECT_INTERVAL || '5000'),
  MAX_RECONNECT_ATTEMPTS: parseInt(process.env.WS_MAX_RECONNECT_ATTEMPTS || '5'),
  PING_TIMEOUT: parseInt(process.env.WS_PING_TIMEOUT || '60000'),
} as const

// Development Configuration
export const DEV_CONFIG = {
  ENABLE_DEBUG: process.env.ENABLE_DEBUG === 'true',
  ENABLE_DEVTOOLS: process.env.ENABLE_DEVTOOLS === 'true',
  MOCK_API: process.env.MOCK_API === 'true',
  SEED_DATABASE: process.env.SEED_DATABASE === 'true',
} as const

// Helper Functions
export const getConfig = (key: string, defaultValue?: any): any => {
  return process.env[key] || defaultValue
}

export const isFeatureEnabled = (feature: keyof typeof FEATURE_FLAGS): boolean => {
  return FEATURE_FLAGS[feature]
}

export const getUploadLimit = (type: 'image' | 'document'): number => {
  return type === 'image' ? UPLOAD_CONFIG.MAX_IMAGE_SIZE : UPLOAD_CONFIG.MAX_DOCUMENT_SIZE
}

export const getSubscriptionPlan = (planName: string) => {
  return PAYMENT_CONFIG.SUBSCRIPTION_PLANS[planName as keyof typeof PAYMENT_CONFIG.SUBSCRIPTION_PLANS]
}
