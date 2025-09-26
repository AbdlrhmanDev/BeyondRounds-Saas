// ==============================================
// API Types
// ==============================================
// Types for API responses, requests, and data structures

// ==============================================
// BASE API RESPONSE TYPES
// ==============================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

// ==============================================
// DASHBOARD API TYPES
// ==============================================

export interface DashboardData {
  stats: {
    totalMatches: number;
    activeGroups: number;
    messagesSent: number;
    profileViews: number;
    newMatches: number;
    responseRate: number;
    avgCompatibility: number;
    weeklyActivity: number;
  };
  recentMatches: Array<{
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
  }>;
  activeGroups: Array<{
    id: string;
    name: string;
    members: number;
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: number;
    avatar: string;
    color: string;
  }>;
  notifications: Array<{
    id: string;
    type: string;
    title: string;
    message: string;
    time: string;
    read: boolean;
    priority: 'high' | 'medium' | 'low';
  }>;
}

// ==============================================
// MATCHING API TYPES
// ==============================================

export interface MatchingRequest {
  userId: string;
  preferences?: {
    maxDistance?: number;
    ageRange?: [number, number];
    specialties?: string[];
    careerStages?: string[];
  };
}

export interface MatchingResponse {
  matches: Array<{
    id: string;
    groupName: string;
    members: Array<{
      id: string;
      name: string;
      specialty: string;
      compatibility: number;
      avatar: string;
    }>;
    compatibility: number;
    reason: string;
    createdAt: string;
  }>;
  unmatchedUsers: number;
  totalGroups: number;
}

// ==============================================
// MESSAGING API TYPES
// ==============================================

export interface MessageRequest {
  chatRoomId: string;
  content: string;
  replyToId?: string;
}

export interface MessageResponse {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  createdAt: string;
  isEdited: boolean;
  replyTo?: {
    id: string;
    content: string;
    senderName: string;
  };
}

export interface ChatRoomResponse {
  id: string;
  name: string;
  matchId: string;
  members: Array<{
    id: string;
    name: string;
    avatar: string;
    isOnline: boolean;
  }>;
  lastMessage?: MessageResponse;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

// ==============================================
// PROFILE API TYPES
// ==============================================

export interface ProfileUpdateRequest {
  firstName?: string;
  lastName?: string;
  age?: number;
  gender?: string;
  city?: string;
  medicalSpecialty?: string;
  careerStage?: string;
  bio?: string;
  profilePicture?: File;
  interests?: string[];
  preferences?: {
    genderPreference?: string;
    specialtyPreference?: string;
    ageRangeMin?: number;
    ageRangeMax?: number;
    maxDistanceKm?: number;
    activityLevel?: string;
    socialEnergy?: string;
    conversationStyle?: string;
    meetingFrequency?: string;
    lifeStage?: string;
  };
}

export interface ProfileResponse {
  id: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  age: number | null;
  gender: string | null;
  city: string;
  medicalSpecialty: string | null;
  careerStage: string | null;
  bio: string | null;
  profilePictureUrl: string | null;
  isVerified: boolean;
  profileCompletion: number;
  createdAt: string;
  updatedAt: string;
  interests: Array<{
    id: string;
    name: string;
    category: string;
  }>;
  preferences: {
    genderPreference: string;
    specialtyPreference: string;
    ageRangeMin: number;
    ageRangeMax: number;
    maxDistanceKm: number;
    activityLevel: string;
    socialEnergy: string;
    conversationStyle: string;
    meetingFrequency: string;
    lifeStage: string;
  } | null;
}

// ==============================================
// NOTIFICATION API TYPES
// ==============================================

export interface NotificationResponse {
  id: string;
  type: string;
  title: string;
  message: string;
  data: any;
  isRead: boolean;
  createdAt: string;
  readAt: string | null;
}

export interface NotificationRequest {
  type: string;
  title: string;
  message: string;
  data?: any;
  userIds?: string[];
}

// ==============================================
// VERIFICATION API TYPES
// ==============================================

export interface VerificationRequest {
  documentType: 'id_card' | 'medical_license' | 'selfie';
  file: File;
}

export interface VerificationResponse {
  id: string;
  documentType: string;
  status: 'pending' | 'approved' | 'rejected';
  fileUrl: string;
  adminNotes: string | null;
  verifiedAt: string | null;
  createdAt: string;
}

// ==============================================
// SEARCH API TYPES
// ==============================================

export interface SearchRequest {
  query?: string;
  filters?: {
    specialties?: string[];
    careerStages?: string[];
    ageRange?: [number, number];
    location?: string;
    verified?: boolean;
  };
  pagination?: {
    page: number;
    limit: number;
  };
}

export interface SearchResponse {
  results: Array<{
    id: string;
    name: string;
    specialty: string;
    careerStage: string;
    location: string;
    age: number;
    avatar: string;
    compatibility: number;
    mutualInterests: string[];
  }>;
  total: number;
  page: number;
  limit: number;
}

// ==============================================
// ANALYTICS API TYPES
// ==============================================

export interface AnalyticsResponse {
  userStats: {
    totalMatches: number;
    activeGroups: number;
    messagesSent: number;
    profileViews: number;
    responseRate: number;
    avgCompatibility: number;
  };
  weeklyActivity: Array<{
    date: string;
    matches: number;
    messages: number;
    profileViews: number;
  }>;
  compatibilityDistribution: Array<{
    range: string;
    count: number;
  }>;
  topInterests: Array<{
    name: string;
    count: number;
  }>;
}

// ==============================================
// FILE UPLOAD TYPES
// ==============================================

export interface FileUploadRequest {
  file: File;
  type: 'profile_picture' | 'verification_document';
  metadata?: {
    documentType?: string;
    description?: string;
  };
}

export interface FileUploadResponse {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
}

// ==============================================
// WEBSOCKET TYPES
// ==============================================

export interface WebSocketMessage {
  type: 'message' | 'typing' | 'user_online' | 'user_offline' | 'match_created' | 'notification';
  data: any;
  timestamp: string;
  userId?: string;
  chatRoomId?: string;
}

export interface TypingIndicator {
  userId: string;
  userName: string;
  chatRoomId: string;
  isTyping: boolean;
}

// ==============================================
// ERROR TYPES
// ==============================================

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  code: string;
  details?: ValidationError[];
  timestamp: string;
}
