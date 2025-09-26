/**
 * Profile API functions
 * Handles user profile management, preferences, and related data
 */

import { createClient } from '@/lib/supabase/client'
import { handleSupabaseError } from '@/lib/utils/error'
import type { 
  Profile, 
  ProfileInsert, 
  ProfileUpdate,
  UserPreference,
  ProfileInterest,
  VerificationDocument 
} from '@/lib/types/database'
import type { ProfileResponse, ProfileUpdateRequest } from '@/lib/types/api'

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
 * Profile API class
 */
export class ProfileAPI extends BaseAPI {
  /**
   * Get user profile by user ID
   */
  async getProfile(userId: string): Promise<Profile | null> {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single()
      
      if (error) {
        if (error.code === 'PGRST116') {
          return null // Profile not found
        }
        throw error
      }
      
      return data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Get profile by profile ID
   */
  async getProfileById(profileId: string): Promise<Profile | null> {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
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
   * Create a new profile
   */
  async createProfile(profileData: ProfileInsert): Promise<Profile> {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updates: ProfileUpdate): Promise<Profile> {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .update({
          ...updates,
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
   * Update profile by profile ID
   */
  async updateProfileById(profileId: string, updates: ProfileUpdate): Promise<Profile> {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profileId)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Delete profile (soft delete)
   */
  async deleteProfile(userId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('profiles')
        .update({ 
          is_banned: true,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
      
      if (error) throw error
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Get user preferences
   */
  async getUserPreferences(profileId: string): Promise<UserPreference | null> {
    try {
      const { data, error } = await this.supabase
        .from('user_preferences')
        .select('*')
        .eq('profile_id', profileId)
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
   * Update user preferences
   */
  async updateUserPreferences(profileId: string, preferences: Partial<UserPreference>): Promise<UserPreference> {
    try {
      const { data, error } = await this.supabase
        .from('user_preferences')
        .upsert({
          profile_id: profileId,
          ...preferences,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Get profile interests
   */
  async getProfileInterests(profileId: string): Promise<ProfileInterest[]> {
    try {
      const { data, error } = await this.supabase
        .from('profile_interests')
        .select('*')
        .eq('profile_id', profileId)
        .order('created_at', { ascending: true })
      
      if (error) throw error
      return data || []
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Add profile interest
   */
  async addProfileInterest(interest: Omit<ProfileInterest, 'id' | 'created_at'>): Promise<ProfileInterest> {
    try {
      const { data, error } = await this.supabase
        .from('profile_interests')
        .insert(interest)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Remove profile interest
   */
  async removeProfileInterest(interestId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('profile_interests')
        .delete()
        .eq('id', interestId)
      
      if (error) throw error
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Get verification documents
   */
  async getVerificationDocuments(profileId: string): Promise<VerificationDocument[]> {
    try {
      const { data, error } = await this.supabase
        .from('verification_documents')
        .select('*')
        .eq('profile_id', profileId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Add verification document
   */
  async addVerificationDocument(document: Omit<VerificationDocument, 'id' | 'created_at' | 'updated_at'>): Promise<VerificationDocument> {
    try {
      const { data, error } = await this.supabase
        .from('verification_documents')
        .insert(document)
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Update verification document status
   */
  async updateVerificationDocument(documentId: string, status: 'pending' | 'approved' | 'rejected', adminNotes?: string): Promise<VerificationDocument> {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      }
      
      if (status === 'approved') {
        updateData.verified_at = new Date().toISOString()
      }
      
      if (adminNotes) {
        updateData.admin_notes = adminNotes
      }

      const { data, error } = await this.supabase
        .from('verification_documents')
        .update(updateData)
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
   * Search profiles
   */
  async searchProfiles(query: string, filters?: {
    specialties?: string[];
    careerStages?: string[];
    ageRange?: [number, number];
    location?: string;
    verified?: boolean;
  }): Promise<Profile[]> {
    try {
      let queryBuilder = this.supabase
        .from('profiles')
        .select('*')
        .eq('is_banned', false)
        .eq('onboarding_completed', true)

      // Text search
      if (query) {
        queryBuilder = queryBuilder.or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,medical_specialty.ilike.%${query}%`)
      }

      // Apply filters
      if (filters?.specialties && filters.specialties.length > 0) {
        queryBuilder = queryBuilder.in('medical_specialty', filters.specialties)
      }

      if (filters?.careerStages && filters.careerStages.length > 0) {
        queryBuilder = queryBuilder.in('career_stage', filters.careerStages)
      }

      if (filters?.ageRange) {
        queryBuilder = queryBuilder
          .gte('age', filters.ageRange[0])
          .lte('age', filters.ageRange[1])
      }

      if (filters?.location) {
        queryBuilder = queryBuilder.ilike('city', `%${filters.location}%`)
      }

      if (filters?.verified !== undefined) {
        queryBuilder = queryBuilder.eq('is_verified', filters.verified)
      }

      const { data, error } = await queryBuilder
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      return data || []
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Get profile completion percentage
   */
  async getProfileCompletion(userId: string): Promise<number> {
    try {
      const profile = await this.getProfile(userId)
      if (!profile) return 0

      return profile.profile_completion || 0
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Calculate and update profile completion
   */
  async updateProfileCompletion(userId: string): Promise<number> {
    try {
      const profile = await this.getProfile(userId)
      if (!profile) return 0

      let score = 0
      
      // Basic Information (40 points)
      if (profile.first_name) score += 10
      if (profile.last_name) score += 10
      if (profile.age) score += 5
      if (profile.city) score += 10
      if (profile.nationality) score += 5

      // Medical Background (30 points)
      if (profile.medical_specialty) score += 20
      if (profile.looking_for) score += 10

      // Additional Information (30 points)
      if (profile.gender) score += 5
      if (profile.bio) score += 15
      if (profile.timezone) score += 10

      const completion = Math.min(score, 100)

      // Update the profile with new completion score
      await this.updateProfile(userId, { profile_completion: completion })

      return completion
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Get profiles by IDs
   */
  async getProfilesByIds(profileIds: string[]): Promise<Profile[]> {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
        .in('id', profileIds)
        .eq('is_banned', false)
      
      if (error) throw error
      return data || []
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * Get recent profiles
   */
  async getRecentProfiles(limit: number = 10): Promise<Profile[]> {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('is_banned', false)
        .eq('onboarding_completed', true)
        .order('created_at', { ascending: false })
        .limit(limit)
      
      if (error) throw error
      return data || []
    } catch (error) {
      throw this.handleError(error)
    }
  }
}

// Export API instance
export const profileAPI = new ProfileAPI()