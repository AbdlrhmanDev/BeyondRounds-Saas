// ==============================================
// BeyondRounds Type Exports
// ==============================================
// Centralized type exports for clean imports

// Database types (primary)
export * from './database';

// API types
export * from './api';

// Component types (explicit exports to avoid conflicts)
export type { 
  AuthGuardProps as ComponentAuthGuardProps,
  LoginFormProps,
  UserDashboardProps,
  ChatProps,
  NotificationListProps,
  FileUploadProps,
  TableProps,
  PaginationProps,
  SearchProps
} from './components';

// Authentication types
export * from './auth';

// Legacy exports for backward compatibility (explicit exports to avoid conflicts)
export type {
  ApiResponse as LegacyApiResponse,
  DashboardData as LegacyDashboardData
} from './api';

export type {
  UserFormData,
  InstitutionData
} from './database';



