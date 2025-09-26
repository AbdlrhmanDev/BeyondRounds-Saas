/**
 * Route Constants
 * Centralized route definitions for the application
 */

// Public Routes
export const PUBLIC_ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  HOW_IT_WORKS: '/how-matching-works',
  FAQ: '/faq',
  CONTACT: '/contact',
  PRICING: '/pricing',
  PRIVACY: '/privacy',
} as const

// Authentication Routes
export const AUTH_ROUTES = {
  LOGIN: '/auth/login',
  SIGNUP: '/auth/sign-up',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  VERIFY_EMAIL: '/auth/verify-email',
} as const

// Protected Routes (require authentication)
export const PROTECTED_ROUTES = {
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  MATCHES: '/matches',
  MESSAGES: '/messages',
  NOTIFICATIONS: '/notifications',
  SETTINGS: '/settings',
  PREFERENCES: '/preferences',
  SUBSCRIPTION: '/subscription',
  PAYMENT: '/payment',
  ONBOARDING: '/onboarding',
} as const

// Admin Routes (require admin privileges)
export const ADMIN_ROUTES = {
  ADMIN_PANEL: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_VERIFICATION: '/admin/verification',
  ADMIN_MATCHING: '/admin/matching',
  ADMIN_WEEKLY_MATCHING: '/admin/weekly-matching',
  ADMIN_ANALYTICS: '/admin/analytics',
  ADMIN_SETTINGS: '/admin/settings',
} as const

// API Routes
export const API_ROUTES = {
  AUTH: '/api/auth',
  USERS: '/api/users',
  PROFILES: '/api/profiles',
  MATCHES: '/api/matches',
  MESSAGES: '/api/messages',
  NOTIFICATIONS: '/api/notifications',
  PAYMENTS: '/api/payments',
  VERIFICATION: '/api/verification',
  ADMIN: '/api/admin',
} as const

// Dynamic Routes
export const DYNAMIC_ROUTES = {
  USER_PROFILE: (userId: string) => `/profile/${userId}`,
  MATCH_DETAILS: (matchId: string) => `/matches/${matchId}`,
  MESSAGE_THREAD: (threadId: string) => `/messages/${threadId}`,
  VERIFICATION_DETAILS: (verificationId: string) => `/admin/verification/${verificationId}`,
} as const

// Route Groups
export const ROUTE_GROUPS = {
  PUBLIC: Object.values(PUBLIC_ROUTES),
  AUTH: Object.values(AUTH_ROUTES),
  PROTECTED: Object.values(PROTECTED_ROUTES),
  ADMIN: Object.values(ADMIN_ROUTES),
} as const

// Route Types
export type PublicRoute = typeof PUBLIC_ROUTES[keyof typeof PUBLIC_ROUTES]
export type AuthRoute = typeof AUTH_ROUTES[keyof typeof AUTH_ROUTES]
export type ProtectedRoute = typeof PROTECTED_ROUTES[keyof typeof PROTECTED_ROUTES]
export type AdminRoute = typeof ADMIN_ROUTES[keyof typeof ADMIN_ROUTES]
export type ApiRoute = typeof API_ROUTES[keyof typeof API_ROUTES]

// Route Validation
export const isPublicRoute = (path: string): boolean => {
  return ROUTE_GROUPS.PUBLIC.includes(path as PublicRoute)
}

export const isAuthRoute = (path: string): boolean => {
  return ROUTE_GROUPS.AUTH.includes(path as AuthRoute)
}

export const isProtectedRoute = (path: string): boolean => {
  return ROUTE_GROUPS.PROTECTED.includes(path as ProtectedRoute)
}

export const isAdminRoute = (path: string): boolean => {
  return ROUTE_GROUPS.ADMIN.includes(path as AdminRoute)
}
