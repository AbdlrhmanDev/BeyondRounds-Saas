/**
 * API layer for centralized data fetching
 * Provides typed API functions with error handling
 */

// Export all API modules
export * from './auth'
export * from './profile'
export * from './chat'
export * from './admin'

// Legacy exports for backward compatibility
export { AuthAPI, authAPI } from './auth'
export { ProfileAPI, profileAPI } from './profile'
export { ChatAPI, chatAPI } from './chat'
export { AdminAPI, adminAPI } from './admin'
