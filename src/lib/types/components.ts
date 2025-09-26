// ==============================================
// Component Types
// ==============================================
// Types for React component props and interfaces

/* eslint-disable @typescript-eslint/no-explicit-any, no-unused-vars */
import { ReactNode } from 'react';
import { Profile, ChatRoom, ChatMessage, Notification } from './database';
import { AuthUser } from './auth';

// ==============================================
// COMMON COMPONENT TYPES
// ==============================================

export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
}

export interface LoadingProps extends BaseComponentProps {
  isLoading: boolean;
  loadingText?: string;
  size?: 'sm' | 'md' | 'lg';
}

export interface ErrorProps extends BaseComponentProps {
  error: string | Error;
  onRetry?: () => void;
  showRetry?: boolean;
}

// ==============================================
// AUTH COMPONENT TYPES
// ==============================================

export interface LoginFormProps {
  onSuccess?: (user: AuthUser) => void;
  onError?: (error: string) => void;
  redirectTo?: string;
}

export interface SignUpFormProps {
  onSuccess?: (user: AuthUser) => void;
  onError?: (error: string) => void;
  redirectTo?: string;
}

export interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  requireAuth?: boolean;
  requireProfile?: boolean;
  requireVerification?: boolean;
}

// ==============================================
// DASHBOARD COMPONENT TYPES
// ==============================================

export interface DashboardStats {
  totalMatches: number;
  activeGroups: number;
  messagesSent: number;
  profileViews: number;
  newMatches: number;
  responseRate: number;
  avgCompatibility: number;
  weeklyActivity: number;
}

export interface RecentMatch {
  id: string;
  name: string;
  specialty: string | null;
  compatibility: number | null;
  lastActive: string;
  avatar: string;
  status: 'new' | 'active' | 'pending';
  mutualInterests: number;
  location: string;
  age: number;
  careerStage: string;
}

export interface ActiveGroup {
  id: string;
  name: string;
  members: number;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  avatar: string;
  color: string;
}

export interface UserDashboardProps {
  user: AuthUser;
  stats: DashboardStats;
  recentMatches: RecentMatch[];
  activeGroups: ActiveGroup[];
  notifications: Notification[];
  profile?: Profile;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  icon?: ReactNode;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
}

// ==============================================
// PROFILE COMPONENT TYPES
// ==============================================

export interface ProfileEditorProps {
  onProfileUpdate?: (user: any) => void;
  showCompletionPrompts?: boolean;
}

export interface ProfileViewProps {
  profile: Profile;
  isOwnProfile?: boolean;
  onEdit?: () => void;
  onMessage?: () => void;
  onMatch?: () => void;
}

export interface ProfileCardProps {
  profile: Profile;
  showActions?: boolean;
  onView?: () => void;
  onMessage?: () => void;
  onMatch?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export interface ProfileFormProps {
  initialData?: Partial<Profile>;
  onSubmit: (data: Profile) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  mode?: 'create' | 'edit';
}

// ==============================================
// CHAT COMPONENT TYPES
// ==============================================

export interface ChatProps {
  chatRoomId: string;
  userId: string;
  onNavigate?: (page: string) => void;
}

export interface ChatListProps {
  userId: string;
  onChatSelect: (chatRoomId: string) => void;
  selectedChatId?: string;
}

export interface ChatRoomProps {
  chatRoom: ChatRoom;
  messages: ChatMessage[];
  currentUserId: string;
  onSendMessage: (content: string) => void;
  onTyping?: (isTyping: boolean) => void;
  isLoading?: boolean;
}

export interface MessageProps {
  message: ChatMessage;
  isOwn: boolean;
  showAvatar?: boolean;
  showTimestamp?: boolean;
  onReply?: (messageId: string) => void;
  onEdit?: (messageId: string) => void;
  onDelete?: (messageId: string) => void;
}

export interface MessageInputProps {
  onSend: (content: string) => void;
  onTyping?: (isTyping: boolean) => void;
  placeholder?: string;
  disabled?: boolean;
  replyTo?: ChatMessage;
  onCancelReply?: () => void;
}

export interface TypingIndicatorProps {
  users: Array<{
    id: string;
    name: string;
  }>;
}

// ==============================================
// MATCHING COMPONENT TYPES
// ==============================================

export interface GroupMatchingProps {
  userId: string;
  onMatchCreated?: (matchId: string) => void;
  onError?: (error: string) => void;
}

export interface MatchCardProps {
  match: {
    id: string;
    groupName: string;
    members: Array<{
      id: string;
      name: string;
      specialty: string;
      avatar: string;
    }>;
    compatibility: number;
    reason: string;
    createdAt: string;
  };
  onView?: () => void;
  onJoin?: () => void;
  onDecline?: () => void;
}

export interface CompatibilityMeterProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animated?: boolean;
}

// ==============================================
// NOTIFICATION COMPONENT TYPES
// ==============================================

export interface NotificationListProps {
  notifications: Notification[];
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
  onDelete: (notificationId: string) => void;
  isLoading?: boolean;
}

export interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (notificationId: string) => void;
  onDelete: (notificationId: string) => void;
  showActions?: boolean;
}

export interface NotificationBadgeProps {
  count: number;
  maxCount?: number;
  showZero?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'red' | 'blue' | 'green' | 'yellow';
}

// ==============================================
// FORM COMPONENT TYPES
// ==============================================

export interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'textarea' | 'select' | 'checkbox' | 'radio';
  value?: string | number | boolean;
  onChange: (value: string | number | boolean) => void;
  onBlur?: () => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helpText?: string;
  options?: Array<{
    value: string | number;
    label: string;
  }>;
  rows?: number;
  min?: number;
  max?: number;
  step?: number;
}

export interface SelectProps {
  value: string | number;
  onChange: (value: string | number) => void;
  options: Array<{
    value: string | number;
    label: string;
    disabled?: boolean;
  }>;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  multiple?: boolean;
  searchable?: boolean;
}

export interface FileUploadProps {
  onUpload: (file: globalThis.File) => void;
  accept?: string;
  maxSize?: number;
  multiple?: boolean;
  disabled?: boolean;
  error?: string;
  preview?: boolean;
}

// ==============================================
// MODAL COMPONENT TYPES
// ==============================================

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closable?: boolean;
  showOverlay?: boolean;
}

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

// ==============================================
// NAVIGATION COMPONENT TYPES
// ==============================================

export interface NavItemProps {
  href: string;
  label: string;
  icon?: ReactNode;
  badge?: number;
  isActive?: boolean;
  onClick?: () => void;
}

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user?: AuthUser;
  profile?: Profile;
  currentPath?: string;
  onNavigate: (path: string) => void;
  onLogout: () => void;
}

export interface BreadcrumbProps {
  items: Array<{
    label: string;
    href?: string;
    isActive?: boolean;
  }>;
}

// ==============================================
// LAYOUT COMPONENT TYPES
// ==============================================

export interface LayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  showHeader?: boolean;
  showSidebar?: boolean;
  showFooter?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

export interface HeaderProps {
  user?: AuthUser;
  profile?: Profile;
  onMenuClick?: () => void;
  onProfileClick?: () => void;
  onLogout?: () => void;
  showNotifications?: boolean;
  notificationCount?: number;
}

export interface FooterProps {
  links?: Array<{
    label: string;
    href: string;
  }>;
  copyright?: string;
}

// ==============================================
// UTILITY COMPONENT TYPES
// ==============================================

export interface AvatarProps {
  src?: string;
  alt: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  shape?: 'circle' | 'square';
  fallback?: string;
  status?: 'online' | 'offline' | 'away' | 'busy';
  onClick?: () => void;
}

export interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export interface ButtonProps {
  children: ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
}

export interface CardProps {
  children: ReactNode;
  title?: string;
  description?: string;
  className?: string;
  hoverable?: boolean;
  onClick?: () => void;
}

export interface TooltipProps {
  children: ReactNode;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  disabled?: boolean;
}

// ==============================================
// DATA DISPLAY TYPES
// ==============================================

export interface TableProps<T = Record<string, unknown>> {
  data: T[];
  columns: Array<{
    key: keyof T;
    label: string;
    sortable?: boolean;
    render?: (value: unknown, row: T) => ReactNode;
  }>;
  onSort?: (key: keyof T, direction: 'asc' | 'desc') => void;
  onRowClick?: (row: T) => void;
  loading?: boolean;
  emptyMessage?: string;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showSizeChanger?: boolean;
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
  total?: number;
}

export interface SearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onSearch?: (query: string) => void;
  onClear?: () => void;
  loading?: boolean;
  suggestions?: string[];
  onSuggestionSelect?: (suggestion: string) => void;
}
