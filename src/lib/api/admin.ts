/**
 * Admin API functions
 * Handles administrative operations, user management, and system monitoring
 */

import { createClient } from '@/lib/supabase/client'
import { handleSupabaseError } from '@/lib/utils/error'
import type { 
  Profile, 
  Match, 
  ChatMessage, 
  Notification,
  VerificationDocument,
  MatchingLog 
} from '@/lib/types/database'
import type { 
  ApiResponse, 
  PaginatedResponse 
} from '@/lib/types/api'

/**
 * Base API class with common functionality
 */
class BaseAPI {
  protected supabase = createClient()

  protected handleError(error: unknown) {
    return handleSupabaseError(error)
  }
}

/**
 * Admin API class
 */
export class AdminAPI extends BaseAPI {
  /**
   * Get all users with pagination
   */
  async getUsers(page: number = 1, limit: number = 20, filters?: {
    search?: string;
    role?: string;
    verified?: boolean;
    banned?: boolean;
  }): Promise<PaginatedResponse<Profile>> {
    try {
      let query = this.supabase
        .from('profiles')
        .select('*', { count: 'exact' })

      // Apply filters
      if (filters?.search) {
        query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`)
      }

      if (filters?.role) {
        query = query.eq('role', filters.role)
      }

      if (filters?.verified !== undefined) {
        query = query.eq('is_verified', filters.verified)
      }

      if (filters?.banned !== undefined) {
        query = query.eq('is_banned', filters.banned)
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1)

      if (error) throw error

      return {
        success: true,
        data: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
          hasNext: page * limit < (count || 0),
          hasPrev: page > 1,
        },
      }
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Get user by ID
   */
  async getUser(userId: string): Promise<Profile | null> {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single()
      
      if (error) {
        if (error.code === 'PGRST116') {
          return null
        }
        throw error
      }
      
      return data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Update user role
   */
  async updateUserRole(userId: string, role: 'user' | 'admin' | 'moderator'): Promise<Profile> {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .update({ 
          role,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Ban/unban user
   */
  async toggleUserBan(userId: string, banned: boolean): Promise<Profile> {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .update({ 
          is_banned: banned,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Get all matches
   */
  async getMatches(page: number = 1, limit: number = 20, filters?: {
    status?: string;
    search?: string;
  }): Promise<PaginatedResponse<Match>> {
    try {
      let query = this.supabase
        .from('matches')
        .select('*', { count: 'exact' })

      if (filters?.status) {
        query = query.eq('status', filters.status)
      }

      if (filters?.search) {
        query = query.ilike('group_name', `%${filters.search}%`)
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1)

      if (error) throw error

      return {
        success: true,
        data: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
          hasNext: page * limit < (count || 0),
          hasPrev: page > 1,
        },
      }
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Get match details with members
   */
  async getMatchDetails(matchId: string): Promise<Match & { members: any[] }> {
    try {
      // Get match
      const { data: match, error: matchError } = await this.supabase
        .from('matches')
        .select('*')
        .eq('id', matchId)
        .single()
      
      if (matchError) throw matchError

      // Get members
      const { data: members, error: membersError } = await this.supabase
        .from('match_members')
        .select(`
          *,
          profiles!match_members_profile_id_fkey(
            id,
            first_name,
            last_name,
            email,
            medical_specialty,
            career_stage
          )
        `)
        .eq('match_id', matchId)
        .eq('is_active', true)
      
      if (membersError) throw membersError

      return {
        ...match,
        members: members || [],
      }
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Delete match
   */
  async deleteMatch(matchId: string): Promise<void> {
    try {
      // First, deactivate all members
      await this.supabase
        .from('match_members')
        .update({ is_active: false })
        .eq('match_id', matchId)

      // Then delete the match
      const { error } = await this.supabase
        .from('matches')
        .delete()
        .eq('id', matchId)
      
      if (error) throw error
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Get all verification documents
   */
  async getVerificationDocuments(page: number = 1, limit: number = 20, filters?: {
    status?: string;
    documentType?: string;
  }): Promise<PaginatedResponse<VerificationDocument & { profile: Profile }>> {
    try {
      let query = this.supabase
        .from('verification_documents')
        .select(`
          *,
          profiles!verification_documents_profile_id_fkey(
            id,
            first_name,
            last_name,
            email,
            user_id
          )
        `, { count: 'exact' })

      if (filters?.status) {
        query = query.eq('status', filters.status)
      }

      if (filters?.documentType) {
        query = query.eq('document_type', filters.documentType)
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1)

      if (error) throw error

      return {
        success: true,
        data: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
          hasNext: page * limit < (count || 0),
          hasPrev: page > 1,
        },
      }
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Approve verification document
   */
  async approveVerificationDocument(documentId: string, adminNotes?: string): Promise<VerificationDocument> {
    try {
      const { data, error } = await this.supabase
        .from('verification_documents')
        .update({
          status: 'approved',
          admin_notes: adminNotes,
          verified_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', documentId)
        .select()
        .single()
      
      if (error) throw error

      // Update user verification status
      await this.supabase
        .from('profiles')
        .update({ is_verified: true })
        .eq('id', data.profile_id)

      return data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Reject verification document
   */
  async rejectVerificationDocument(documentId: string, adminNotes: string): Promise<VerificationDocument> {
    try {
      const { data, error } = await this.supabase
        .from('verification_documents')
        .update({
          status: 'rejected',
          admin_notes: adminNotes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', documentId)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Get system statistics
   */
  async getSystemStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    totalMatches: number;
    activeMatches: number;
    pendingVerifications: number;
    totalMessages: number;
  }> {
    try {
      // Get user counts
      const { count: totalUsers } = await this.supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      const { count: activeUsers } = await this.supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_banned', false)

      // Get match counts
      const { count: totalMatches } = await this.supabase
        .from('matches')
        .select('*', { count: 'exact', head: true })

      const { count: activeMatches } = await this.supabase
        .from('matches')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')

      // Get verification counts
      const { count: pendingVerifications } = await this.supabase
        .from('verification_documents')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')

      // Get message count
      const { count: totalMessages } = await this.supabase
        .from('chat_messages')
        .select('*', { count: 'exact', head: true })

      return {
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        totalMatches: totalMatches || 0,
        activeMatches: activeMatches || 0,
        pendingVerifications: pendingVerifications || 0,
        totalMessages: totalMessages || 0,
      }
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Get matching logs
   */
  async getMatchingLogs(page: number = 1, limit: number = 20): Promise<PaginatedResponse<MatchingLog>> {
    try {
      const { data, error, count } = await this.supabase
        .from('matching_logs')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1)

      if (error) throw error

      return {
        success: true,
        data: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
          hasNext: page * limit < (count || 0),
          hasPrev: page > 1,
        },
      }
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Run matching algorithm
   */
  async runMatchingAlgorithm(): Promise<ApiResponse> {
    try {
      const { data, error } = await this.supabase
        .rpc('run_matching_algorithm')
      
      if (error) {
        return {
          success: false,
          error: error.message,
        }
      }

      return {
        success: true,
        data,
        message: 'Matching algorithm completed successfully',
      }
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error).message,
      }
    }
  }

  /**
   * Get recent activity
   */
  async getRecentActivity(limit: number = 50): Promise<{
    newUsers: Profile[];
    newMatches: Match[];
    newMessages: ChatMessage[];
  }> {
    try {
      // Get recent users
      const { data: newUsers } = await this.supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      // Get recent matches
      const { data: newMatches } = await this.supabase
        .from('matches')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      // Get recent messages
      const { data: newMessages } = await this.supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      return {
        newUsers: newUsers || [],
        newMatches: newMatches || [],
        newMessages: newMessages || [],
      }
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Send system notification
   */
  async sendSystemNotification(notification: {
    title: string;
    message: string;
    type: string;
    userIds?: string[];
  }): Promise<void> {
    try {
      if (notification.userIds && notification.userIds.length > 0) {
        // Send to specific users
        const notifications = notification.userIds.map(userId => ({
          profile_id: userId,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          is_read: false,
        }))

        const { error } = await this.supabase
          .from('notifications')
          .insert(notifications)

        if (error) throw error
      } else {
        // Send to all users
        const { data: profiles } = await this.supabase
          .from('profiles')
          .select('id')
          .eq('is_banned', false)

        if (profiles && profiles.length > 0) {
          const notifications = profiles.map(profile => ({
            profile_id: profile.id,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            is_read: false,
          }))

          const { error } = await this.supabase
            .from('notifications')
            .insert(notifications)

          if (error) throw error
        }
      }
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Get user activity logs
   */
  async getUserActivityLogs(userId: string, limit: number = 100): Promise<any[]> {
    try {
      // This would require a separate activity_logs table
      // For now, return empty array
      return []
    } catch (error) {
      throw this.handleError(error)
    }
  }
}

// Export API instance
export const adminAPI = new AdminAPI()
