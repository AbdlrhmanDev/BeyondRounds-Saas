/**
 * API Endpoints Constants
 * Centralized API endpoint definitions
 */

// Base API URL
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api'

// Authentication Endpoints
export const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  SIGNUP: '/auth/signup',
  LOGOUT: '/auth/logout',
  REFRESH: '/auth/refresh',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  VERIFY_EMAIL: '/auth/verify-email',
  RESEND_VERIFICATION: '/auth/resend-verification',
  CHANGE_PASSWORD: '/auth/change-password',
} as const

// User Endpoints
export const USER_ENDPOINTS = {
  PROFILE: '/users/profile',
  UPDATE_PROFILE: '/users/profile',
  DELETE_ACCOUNT: '/users/account',
  UPLOAD_AVATAR: '/users/avatar',
  GET_USER: (userId: string) => `/users/${userId}`,
  SEARCH_USERS: '/users/search',
  GET_USER_PREFERENCES: '/users/preferences',
  UPDATE_USER_PREFERENCES: '/users/preferences',
} as const

// Profile Endpoints
export const PROFILE_ENDPOINTS = {
  GET_PROFILE: '/profiles',
  UPDATE_PROFILE: '/profiles',
  COMPLETE_PROFILE: '/profiles/complete',
  GET_PROFILE_COMPLETION: '/profiles/completion',
  UPLOAD_DOCUMENTS: '/profiles/documents',
  DELETE_DOCUMENT: (documentId: string) => `/profiles/documents/${documentId}`,
} as const

// Matching Endpoints
export const MATCHING_ENDPOINTS = {
  GET_MATCHES: '/matches',
  GET_MATCH: (matchId: string) => `/matches/${matchId}`,
  LIKE_MATCH: (matchId: string) => `/matches/${matchId}/like`,
  PASS_MATCH: (matchId: string) => `/matches/${matchId}/pass`,
  GET_COMPATIBILITY: (userId: string) => `/matches/compatibility/${userId}`,
  GET_MATCH_HISTORY: '/matches/history',
  CREATE_GROUP_MATCH: '/matches/groups',
  GET_GROUP_MATCHES: '/matches/groups',
  JOIN_GROUP_MATCH: (groupId: string) => `/matches/groups/${groupId}/join`,
  LEAVE_GROUP_MATCH: (groupId: string) => `/matches/groups/${groupId}/leave`,
} as const

// Messaging Endpoints
export const MESSAGING_ENDPOINTS = {
  GET_CONVERSATIONS: '/messages/conversations',
  GET_CONVERSATION: (conversationId: string) => `/messages/conversations/${conversationId}`,
  SEND_MESSAGE: '/messages',
  GET_MESSAGES: (conversationId: string) => `/messages/conversations/${conversationId}/messages`,
  MARK_AS_READ: (messageId: string) => `/messages/${messageId}/read`,
  DELETE_MESSAGE: (messageId: string) => `/messages/${messageId}`,
  GET_UNREAD_COUNT: '/messages/unread-count',
} as const

// Notification Endpoints
export const NOTIFICATION_ENDPOINTS = {
  GET_NOTIFICATIONS: '/notifications',
  MARK_AS_READ: (notificationId: string) => `/notifications/${notificationId}/read`,
  MARK_ALL_AS_READ: '/notifications/read-all',
  DELETE_NOTIFICATION: (notificationId: string) => `/notifications/${notificationId}`,
  GET_UNREAD_COUNT: '/notifications/unread-count',
  UPDATE_PREFERENCES: '/notifications/preferences',
} as const

// Payment Endpoints
export const PAYMENT_ENDPOINTS = {
  CREATE_SUBSCRIPTION: '/payments/subscription',
  UPDATE_SUBSCRIPTION: '/payments/subscription',
  CANCEL_SUBSCRIPTION: '/payments/subscription/cancel',
  GET_SUBSCRIPTION: '/payments/subscription',
  GET_PAYMENT_HISTORY: '/payments/history',
  CREATE_PAYMENT_INTENT: '/payments/intent',
  CONFIRM_PAYMENT: '/payments/confirm',
  GET_PAYMENT_METHODS: '/payments/methods',
  ADD_PAYMENT_METHOD: '/payments/methods',
  DELETE_PAYMENT_METHOD: (methodId: string) => `/payments/methods/${methodId}`,
} as const

// Verification Endpoints
export const VERIFICATION_ENDPOINTS = {
  UPLOAD_DOCUMENT: '/verification/documents',
  GET_VERIFICATION_STATUS: '/verification/status',
  SUBMIT_VERIFICATION: '/verification/submit',
  GET_VERIFICATION_DOCUMENTS: '/verification/documents',
  DELETE_VERIFICATION_DOCUMENT: (documentId: string) => `/verification/documents/${documentId}`,
} as const

// Admin Endpoints
export const ADMIN_ENDPOINTS = {
  GET_USERS: '/admin/users',
  GET_USER: (userId: string) => `/admin/users/${userId}`,
  UPDATE_USER: (userId: string) => `/admin/users/${userId}`,
  DELETE_USER: (userId: string) => `/admin/users/${userId}`,
  GET_VERIFICATIONS: '/admin/verifications',
  APPROVE_VERIFICATION: (verificationId: string) => `/admin/verifications/${verificationId}/approve`,
  REJECT_VERIFICATION: (verificationId: string) => `/admin/verifications/${verificationId}/reject`,
  GET_ANALYTICS: '/admin/analytics',
  GET_MATCHING_STATS: '/admin/matching/stats',
  TRIGGER_WEEKLY_MATCHING: '/admin/matching/weekly',
  GET_SYSTEM_LOGS: '/admin/logs',
} as const

// File Upload Endpoints
export const UPLOAD_ENDPOINTS = {
  UPLOAD_IMAGE: '/upload/image',
  UPLOAD_DOCUMENT: '/upload/document',
  DELETE_FILE: (fileId: string) => `/upload/${fileId}`,
} as const

// WebSocket Endpoints
export const WEBSOCKET_ENDPOINTS = {
  MESSAGES: '/ws/messages',
  NOTIFICATIONS: '/ws/notifications',
  MATCHES: '/ws/matches',
} as const

// API Response Status Codes
export const API_STATUS = {
  SUCCESS: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const

// API Error Codes
export const API_ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
  CONFLICT_ERROR: 'CONFLICT_ERROR',
  RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
} as const

// Request Timeouts (in milliseconds)
export const API_TIMEOUTS = {
  DEFAULT: 10000, // 10 seconds
  UPLOAD: 30000,  // 30 seconds
  LONG_RUNNING: 60000, // 60 seconds
} as const

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  DEFAULT_PAGE: 1,
} as const

// API Headers
export const API_HEADERS = {
  CONTENT_TYPE: 'Content-Type',
  AUTHORIZATION: 'Authorization',
  ACCEPT: 'Accept',
  USER_AGENT: 'User-Agent',
} as const

// Content Types
export const CONTENT_TYPES = {
  JSON: 'application/json',
  FORM_DATA: 'multipart/form-data',
  URL_ENCODED: 'application/x-www-form-urlencoded',
} as const
