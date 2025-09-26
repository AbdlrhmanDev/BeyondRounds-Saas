// ==============================================
// Authentication Types
// ==============================================
// Types for authentication, user sessions, and authorization

import React from 'react';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';
import type { Profile, UserRole } from './database';

// ==============================================
// SUPABASE AUTH TYPES
// ==============================================

export type AuthUser = SupabaseUser;
export type AuthSession = Session;

// ==============================================
// AUTHENTICATION STATE TYPES
// ==============================================

export interface AuthState {
  user: AuthUser | null;
  session: AuthSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isInitialized: boolean;
}
export interface AuthContextType extends AuthState {
  signIn: (_email: string, _password: string) => Promise<AuthResult>;
  signUp: (_email: string, _password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  resetPassword: (_email: string) => Promise<AuthResult>;
  updatePassword: (_password: string) => Promise<AuthResult>;
  refreshSession: () => Promise<void>;
}

// ==============================================
// AUTHENTICATION RESULT TYPES
// ==============================================

export interface AuthResult {
  success: boolean;
  user?: AuthUser;
  session?: AuthSession;
  error?: string;
  message?: string;
}

export interface SignInResult extends AuthResult {
  user?: AuthUser;
  session?: AuthSession;
}

export interface SignUpResult extends AuthResult {
  user?: AuthUser;
  session?: AuthSession;
  needsEmailVerification?: boolean;
}

export interface PasswordResetResult extends AuthResult {
  emailSent?: boolean;
}

// ==============================================
// USER PROFILE TYPES
// ==============================================

export interface UserWithProfile extends AuthUser {
  profile?: Profile;
}

export interface AuthUserWithProfile {
  user: AuthUser;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isVerified: boolean;
  isOnboarded: boolean;
}

// ==============================================
// AUTHENTICATION HOOK TYPES
// ==============================================

export interface UseAuthUserReturn {
  user: AuthUser | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isVerified: boolean;
  isOnboarded: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export interface UseAuthSessionReturn {
  session: AuthSession | null;
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refreshSession: () => Promise<void>;
}

// ==============================================
// AUTHENTICATION FORM TYPES
// ==============================================

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignUpFormData {
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
  acceptPrivacy: boolean;
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
  token: string;
}

export interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// ==============================================
// AUTHENTICATION ERROR TYPES
// ==============================================

export interface AuthError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export type AuthErrorCode = 
  | 'invalid_credentials'
  | 'email_not_confirmed'
  | 'weak_password'
  | 'email_already_registered'
  | 'user_not_found'
  | 'too_many_requests'
  | 'network_error'
  | 'unknown_error';

// ==============================================
// AUTHORIZATION TYPES
// ==============================================

export interface Permission {
  resource: string;
  action: string;
  conditions?: Record<string, unknown>;
}

export interface Role {
  name: UserRole;
  permissions: Permission[];
  description?: string;
}

export interface AuthorizationContext {
  user: AuthUser;
  profile: Profile;
  role: UserRole;
  permissions: Permission[];
}

// ==============================================
// ROUTE PROTECTION TYPES
// ==============================================

export interface RouteConfig {
  path: string;
  requiresAuth: boolean;
  requiresProfile?: boolean;
  requiresVerification?: boolean;
  requiresOnboarding?: boolean;
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

export interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAuth?: boolean;
  requireProfile?: boolean;
  requireVerification?: boolean;
  requireOnboarding?: boolean;
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

// ==============================================
// SESSION MANAGEMENT TYPES
// ==============================================

export interface SessionConfig {
  autoRefresh: boolean;
  refreshThreshold: number; // seconds before expiry to refresh
  persistSession: boolean;
  storageKey: string;
}

export interface SessionStorage {
  getItem: (_key: string) => string | null;
  setItem: (_key: string, _value: string) => void;
  removeItem: (_key: string) => void;
}

// ==============================================
// AUTHENTICATION EVENTS
// ==============================================

export type AuthEvent = 
  | 'SIGNED_IN'
  | 'SIGNED_OUT'
  | 'TOKEN_REFRESHED'
  | 'USER_UPDATED'
  | 'PASSWORD_RECOVERY'
  | 'EMAIL_CONFIRMED';

export interface AuthEventData {
  event: AuthEvent;
  session?: AuthSession;
  user?: AuthUser;
  timestamp: string;
}

export type AuthEventListener = (_data: AuthEventData) => void;

// ==============================================
// OAUTH PROVIDER TYPES
// ==============================================

export type OAuthProvider = 
  | 'google'
  | 'github'
  | 'linkedin'
  | 'twitter'
  | 'facebook'
  | 'apple';

export interface OAuthConfig {
  provider: OAuthProvider;
  redirectTo?: string;
  scopes?: string[];
}

export interface OAuthResult extends AuthResult {
  provider: OAuthProvider;
  redirectUrl?: string;
}

// ==============================================
// EMAIL VERIFICATION TYPES
// ==============================================

export interface EmailVerificationConfig {
  templateId: string;
  redirectTo?: string;
  subject?: string;
}

export interface EmailVerificationResult extends AuthResult {
  emailSent: boolean;
  verificationToken?: string;
}

// ==============================================
// TWO-FACTOR AUTHENTICATION TYPES
// ==============================================

export interface TwoFactorConfig {
  enabled: boolean;
  method: 'totp' | 'sms' | 'email';
  backupCodes?: string[];
}

export interface TwoFactorSetup {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export interface TwoFactorVerification {
  code: string;
  backupCode?: string;
}

// ==============================================
// AUTHENTICATION MIDDLEWARE TYPES
// ==============================================

export interface AuthMiddlewareConfig {
  publicRoutes: string[];
  protectedRoutes: string[];
  adminRoutes: string[];
  redirectTo: {
    login: string;
    dashboard: string;
    admin: string;
  };
}

export interface AuthMiddlewareContext {
  user: AuthUser | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isVerified: boolean;
  isOnboarded: boolean;
  currentPath: string;
  redirectTo?: string;
}

// ==============================================
// AUTHENTICATION API TYPES
// ==============================================

export interface AuthAPI {
  getCurrentUser: () => Promise<AuthUser | null>;
  getCurrentSession: () => Promise<AuthSession | null>;
  signIn: (_email: string, _password: string) => Promise<SignInResult>;
  signUp: (_email: string, _password: string) => Promise<SignUpResult>;
  signOut: () => Promise<void>;
  resetPassword: (_email: string) => Promise<PasswordResetResult>;
  updatePassword: (_password: string) => Promise<AuthResult>;
  refreshSession: () => Promise<AuthSession | null>;
  verifyEmail: (_token: string) => Promise<AuthResult>;
  resendVerification: (_email: string) => Promise<AuthResult>;
}

// ==============================================
// AUTHENTICATION UTILITY TYPES
// ==============================================

export interface AuthUtils {
  isEmailValid: (_email: string) => boolean;
  isPasswordStrong: (_password: string) => boolean;
  generatePassword: (_length?: number) => string;
  hashPassword: (_password: string) => Promise<string>;
  verifyPassword: (_password: string, _hash: string) => Promise<boolean>;
  generateToken: (_payload: Record<string, unknown>) => string;
  verifyToken: (_token: string) => Record<string, unknown>;
  sanitizeEmail: (_email: string) => string;
}

// ==============================================
// AUTHENTICATION CONSTANTS
// ==============================================

export const AUTH_ROUTES = {
  LOGIN: '/auth/login',
  SIGNUP: '/auth/sign-up',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  VERIFY_EMAIL: '/auth/verify-email',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  SETTINGS: '/settings',
} as const;

export const AUTH_STORAGE_KEYS = {
  SESSION: 'supabase.auth.session',
  USER: 'supabase.auth.user',
  PROFILE: 'beyondrounds.profile',
  PREFERENCES: 'beyondrounds.preferences',
} as const;

export const AUTH_ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_NOT_CONFIRMED: 'Please check your email and confirm your account',
  WEAK_PASSWORD: 'Password must be at least 8 characters long',
  EMAIL_ALREADY_REGISTERED: 'An account with this email already exists',
  USER_NOT_FOUND: 'No account found with this email',
  TOO_MANY_REQUESTS: 'Too many attempts. Please try again later',
  NETWORK_ERROR: 'Network error. Please check your connection',
  UNKNOWN_ERROR: 'An unexpected error occurred',
} as const;
