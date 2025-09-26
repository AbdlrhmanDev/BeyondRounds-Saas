#!/usr/bin/env node

/**
 * Comprehensive Test Data Generator for BeyondRounds Medical Matching System
 * Creates realistic test data for all database tables based on the provided schema
 * 
 * WARNING: This script will clean up existing test data first
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Comprehensive medical professionals data with all required fields
const medicalProfessionals = [
  {
    email: 'dr.ahmed.alharbi@beyondrounds.com',
    password: 'MedicalPass123!',
    first_name: 'أحمد',
    last_name: 'الغربي',
    age: 35,
    gender: 'male',
    nationality: 'Saudi',
    city: 'Riyadh',
    timezone: 'Asia/Riyadh',
    medical_specialty: 'Cardiology',
    bio: 'استشاري أمراض القلب والشرايين مع خبرة 15 عاماً في علاج أمراض القلب المعقدة والجراحات التداخلية',
    looking_for: 'Professional networking and medical collaboration',
    hospital: 'King Fahd Medical City',
    phone: '+966501234567',
    experience_years: 15,
    languages: ['Arabic', 'English'],
    certifications: ['Saudi Board of Cardiology', 'Fellowship in Interventional Cardiology'],
    interests: ['Interventional Cardiology', 'Heart Failure Management', 'Preventive Cardiology'],
    specialties: [
      { specialty: 'Cardiology', is_primary: true, years_experience: 15 },
      { specialty: 'Interventional Cardiology', is_primary: false, years_experience: 8 }
    ],
    preferences: {
      gender_preference: 'no-preference',
      specialty_preference: 'no-preference',
      meeting_frequency: 'weekly',
      preferred_times: 'Evenings and weekends',
      dietary_preferences: 'Halal',
      activity_level: 'moderate',
      social_energy_level: 'high',
      conversation_style: 'professional',
      life_stage: 'established-career',
      ideal_weekend: 'outdoor-activities'
    },
    meeting_activities: [
      { activity: 'Medical conferences', priority: 5 },
      { activity: 'Coffee meetings', priority: 4 },
      { activity: 'Hospital rounds', priority: 3 }
    ],
    availability_slots: [
      { day_of_week: 1, start_time: '18:00', end_time: '20:00' },
      { day_of_week: 3, start_time: '18:00', end_time: '20:00' },
      { day_of_week: 5, start_time: '19:00', end_time: '21:00' }
    ]
  },
  {
    email: 'dr.sara.almansouri@beyondrounds.com',
    password: 'MedicalPass123!',
    first_name: 'سارة',
    last_name: 'المنصوري',
    age: 32,
    gender: 'female',
    nationality: 'Saudi',
    city: 'Jeddah',
    timezone: 'Asia/Riyadh',
    medical_specialty: 'Pediatrics',
    bio: 'استشارية طب الأطفال مع تخصص في أمراض الأطفال حديثي الولادة والعناية المركزة',
    looking_for: 'Medical collaboration and professional development',
    hospital: 'King Abdulaziz Hospital',
    phone: '+966502345678',
    experience_years: 12,
    languages: ['Arabic', 'English', 'French'],
    certifications: ['Saudi Board of Pediatrics', 'Neonatal Intensive Care'],
    interests: ['Neonatology', 'Pediatric Emergency', 'Child Development'],
    specialties: [
      { specialty: 'Pediatrics', is_primary: true, years_experience: 12 },
      { specialty: 'Neonatology', is_primary: false, years_experience: 6 }
    ],
    preferences: {
      gender_preference: 'no-preference',
      specialty_preference: 'no-preference',
      meeting_frequency: 'bi-weekly',
      preferred_times: 'Afternoon and evening',
      dietary_preferences: 'Vegetarian',
      activity_level: 'low',
      social_energy_level: 'medium',
      conversation_style: 'casual',
      life_stage: 'early-career',
      ideal_weekend: 'quiet-activities'
    },
    meeting_activities: [
      { activity: 'Case discussions', priority: 5 },
      { activity: 'Research collaboration', priority: 4 },
      { activity: 'Lunch meetings', priority: 3 }
    ],
    availability_slots: [
      { day_of_week: 2, start_time: '17:00', end_time: '19:00' },
      { day_of_week: 4, start_time: '17:00', end_time: '19:00' },
      { day_of_week: 6, start_time: '14:00', end_time: '16:00' }
    ]
  },
  {
    email: 'dr.mohammed.alshehri@beyondrounds.com',
    password: 'MedicalPass123!',
    first_name: 'محمد',
    last_name: 'الشهري',
    age: 38,
    gender: 'male',
    nationality: 'Saudi',
    city: 'Dammam',
    timezone: 'Asia/Riyadh',
    medical_specialty: 'Orthopedics',
    bio: 'استشاري جراحة العظام والمفاصل مع خبرة في جراحات العمود الفقري والجراحات الروبوتية',
    looking_for: 'Professional networking and surgical collaboration',
    hospital: 'King Fahd Specialist Hospital',
    phone: '+966503456789',
    experience_years: 18,
    languages: ['Arabic', 'English'],
    certifications: ['Saudi Board of Orthopedics', 'Spine Surgery Fellowship'],
    interests: ['Spine Surgery', 'Joint Replacement', 'Sports Medicine'],
    specialties: [
      { specialty: 'Orthopedics', is_primary: true, years_experience: 18 },
      { specialty: 'Spine Surgery', is_primary: false, years_experience: 10 }
    ],
    preferences: {
      gender_preference: 'no-preference',
      specialty_preference: 'no-preference',
      meeting_frequency: 'monthly',
      preferred_times: 'Evenings',
      dietary_preferences: 'Halal',
      activity_level: 'high',
      social_energy_level: 'high',
      conversation_style: 'professional',
      life_stage: 'established-career',
      ideal_weekend: 'sports-activities'
    },
    meeting_activities: [
      { activity: 'Surgical planning', priority: 5 },
      { activity: 'Sports activities', priority: 4 },
      { activity: 'Medical conferences', priority: 3 }
    ],
    availability_slots: [
      { day_of_week: 1, start_time: '19:00', end_time: '21:00' },
      { day_of_week: 3, start_time: '19:00', end_time: '21:00' },
      { day_of_week: 6, start_time: '16:00', end_time: '18:00' }
    ]
  },
  {
    email: 'dr.fatima.alqahtani@beyondrounds.com',
    password: 'MedicalPass123!',
    first_name: 'فاطمة',
    last_name: 'القحطاني',
    age: 30,
    gender: 'female',
    nationality: 'Saudi',
    city: 'Riyadh',
    timezone: 'Asia/Riyadh',
    medical_specialty: 'Dermatology',
    bio: 'استشارية الأمراض الجلدية مع تخصص في علاج الأمراض الجلدية المعقدة والجراحات التجميلية',
    looking_for: 'Medical collaboration and research opportunities',
    hospital: 'King Saud Medical City',
    phone: '+966504567890',
    experience_years: 10,
    languages: ['Arabic', 'English'],
    certifications: ['Saudi Board of Dermatology', 'Cosmetic Dermatology'],
    interests: ['Medical Dermatology', 'Cosmetic Procedures', 'Skin Cancer Treatment'],
    specialties: [
      { specialty: 'Dermatology', is_primary: true, years_experience: 10 },
      { specialty: 'Cosmetic Dermatology', is_primary: false, years_experience: 5 }
    ],
    preferences: {
      gender_preference: 'no-preference',
      specialty_preference: 'no-preference',
      meeting_frequency: 'weekly',
      preferred_times: 'Morning and afternoon',
      dietary_preferences: 'Halal',
      activity_level: 'moderate',
      social_energy_level: 'medium',
      conversation_style: 'casual',
      life_stage: 'early-career',
      ideal_weekend: 'cultural-activities'
    },
    meeting_activities: [
      { activity: 'Case presentations', priority: 5 },
      { activity: 'Research meetings', priority: 4 },
      { activity: 'Coffee discussions', priority: 3 }
    ],
    availability_slots: [
      { day_of_week: 2, start_time: '09:00', end_time: '11:00' },
      { day_of_week: 4, start_time: '09:00', end_time: '11:00' },
      { day_of_week: 6, start_time: '10:00', end_time: '12:00' }
    ]
  },
  {
    email: 'dr.khalid.alrashid@beyondrounds.com',
    password: 'MedicalPass123!',
    first_name: 'خالد',
    last_name: 'الراشد',
    age: 42,
    gender: 'male',
    nationality: 'Saudi',
    city: 'Jeddah',
    timezone: 'Asia/Riyadh',
    medical_specialty: 'Neurology',
    bio: 'استشاري أمراض الأعصاب مع خبرة في علاج السكتات الدماغية والاضطرابات العصبية المعقدة',
    looking_for: 'Professional networking and academic collaboration',
    hospital: 'King Fahd Hospital',
    phone: '+966505678901',
    experience_years: 20,
    languages: ['Arabic', 'English', 'German'],
    certifications: ['Saudi Board of Neurology', 'Stroke Medicine Fellowship'],
    interests: ['Stroke Medicine', 'Epilepsy', 'Movement Disorders'],
    specialties: [
      { specialty: 'Neurology', is_primary: true, years_experience: 20 },
      { specialty: 'Stroke Medicine', is_primary: false, years_experience: 12 }
    ],
    preferences: {
      gender_preference: 'no-preference',
      specialty_preference: 'no-preference',
      meeting_frequency: 'bi-weekly',
      preferred_times: 'Evenings',
      dietary_preferences: 'Halal',
      activity_level: 'low',
      social_energy_level: 'medium',
      conversation_style: 'professional',
      life_stage: 'established-career',
      ideal_weekend: 'intellectual-activities'
    },
    meeting_activities: [
      { activity: 'Academic discussions', priority: 5 },
      { activity: 'Research collaboration', priority: 4 },
      { activity: 'Case reviews', priority: 3 }
    ],
    availability_slots: [
      { day_of_week: 1, start_time: '18:00', end_time: '20:00' },
      { day_of_week: 3, start_time: '18:00', end_time: '20:00' },
      { day_of_week: 5, start_time: '19:00', end_time: '21:00' }
    ]
  }
]

// Payment plans for subscriptions
const paymentPlans = [
  {
    name: 'Basic Plan',
    description: 'Essential features for medical professionals',
    price_cents: 2999, // $29.99
    currency: 'GBP',
    billing_interval: 'month',
    stripe_price_id: 'price_basic_monthly',
    is_active: true,
    trial_days: 7,
    features: {
      max_matches_per_week: 5,
      advanced_search: false,
      priority_support: false,
      analytics: false
    }
  },
  {
    name: 'Professional Plan',
    description: 'Advanced features for active professionals',
    price_cents: 5999, // $59.99
    currency: 'GBP',
    billing_interval: 'month',
    stripe_price_id: 'price_professional_monthly',
    is_active: true,
    trial_days: 14,
    features: {
      max_matches_per_week: 15,
      advanced_search: true,
      priority_support: true,
      analytics: true
    }
  },
  {
    name: 'Premium Plan',
    description: 'Full features for medical leaders',
    price_cents: 9999, // $99.99
    currency: 'GBP',
    billing_interval: 'month',
    stripe_price_id: 'price_premium_monthly',
    is_active: true,
    trial_days: 30,
    features: {
      max_matches_per_week: -1, // Unlimited
      advanced_search: true,
      priority_support: true,
      analytics: true,
      custom_matching: true
    }
  }
]

async function cleanupExistingData() {
  console.log('🧹 Cleaning up existing test data...')
  
  try {
    // Delete in reverse dependency order
    const tables = [
      'message_reactions',
      'message_read_status',
      'chat_messages',
      'chat_rooms',
      'feedback_improvement_areas',
      'feedback_positive_aspects',
      'feedback',
      'match_members',
      'matches',
      'match_history',
      'match_batches',
      'notifications',
      'payments',
      'user_subscriptions',
      'user_preferences',
      'profile_availability_slots',
      'profile_interests',
      'profile_meeting_activities',
      'profile_preferences',
      'profile_specialties',
      'verification_documents',
      'profiles',
      'payment_plans',
      'audit_log'
    ]

    for (const table of tables) {
      try {
        const { error } = await supabase
          .from(table)
          .delete()
          .like('email', '%@beyondrounds.com')

        if (error && !error.message.includes('relation') && !error.message.includes('does not exist')) {
          console.log(`⚠️  ${table} cleanup warning:`, error.message)
        }
      } catch (err) {
        // Ignore table not found errors
      }
    }

    // Clean up auth users
    const { data: users } = await supabase.auth.admin.listUsers()
    const testUsers = users.users.filter(user => user.email.includes('@beyondrounds.com'))
    
    for (const user of testUsers) {
      const { error } = await supabase.auth.admin.deleteUser(user.id)
      if (error) {
        console.log(`⚠️  Could not delete user ${user.email}:`, error.message)
      }
    }
    
    console.log(`✅ Cleaned up existing test data`)
  } catch (error) {
    console.log('⚠️  Cleanup warning:', error.message)
  }
}

async function createPaymentPlans() {
  console.log('\n💳 Creating payment plans...')
  
  try {
    for (const plan of paymentPlans) {
      const { error } = await supabase
        .from('payment_plans')
        .insert(plan)

      if (error) {
        console.log(`⚠️  Payment plan ${plan.name} warning:`, error.message)
      } else {
        console.log(`✅ Created payment plan: ${plan.name}`)
      }
    }
  } catch (error) {
    console.log('⚠️  Payment plans creation warning:', error.message)
  }
}

async function createMedicalProfessionals() {
  console.log('\n👥 Creating Medical Professional Accounts...')
  console.log('=============================================')
  
  const createdUsers = []
  
  for (let i = 0; i < medicalProfessionals.length; i++) {
    const prof = medicalProfessionals[i]
    
    try {
      console.log(`\n📝 Creating user ${i + 1}/${medicalProfessionals.length}: ${prof.email}`)
      
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: prof.email,
        password: prof.password,
        email_confirm: true,
        user_metadata: {
          first_name: prof.first_name,
          last_name: prof.last_name,
          medical_specialty: prof.medical_specialty,
          city: prof.city
        }
      })

      if (authError) {
        console.error(`❌ Auth error for ${prof.email}:`, authError.message)
        continue
      }

      // Create main profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: authData.user.id,
          email: prof.email,
          first_name: prof.first_name,
          last_name: prof.last_name,
          age: prof.age,
          gender: prof.gender,
          nationality: prof.nationality,
          city: prof.city,
          timezone: prof.timezone,
          role: 'user',
          is_verified: true,
          is_banned: false,
          medical_specialty: prof.medical_specialty,
          bio: prof.bio,
          looking_for: prof.looking_for,
          profile_completion: 100,
          onboarding_completed: true,
          last_active_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (profileError) {
        console.error(`❌ Profile error for ${prof.email}:`, profileError.message)
        continue
      }

      // Create profile specialties
      for (const specialty of prof.specialties) {
        await supabase
          .from('profile_specialties')
          .insert({
            profile_id: profileData.id,
            specialty: specialty.specialty,
            is_primary: specialty.is_primary,
            years_experience: specialty.years_experience,
            created_at: new Date().toISOString()
          })
      }

      // Create profile preferences
      await supabase
        .from('profile_preferences')
        .insert({
          profile_id: profileData.id,
          ...prof.preferences,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      // Create meeting activities
      for (const activity of prof.meeting_activities) {
        await supabase
          .from('profile_meeting_activities')
          .insert({
            profile_id: profileData.id,
            activity: activity.activity,
            priority: activity.priority,
            created_at: new Date().toISOString()
          })
      }

      // Create availability slots
      for (const slot of prof.availability_slots) {
        await supabase
          .from('profile_availability_slots')
          .insert({
            profile_id: profileData.id,
            day_of_week: slot.day_of_week,
            start_time: slot.start_time,
            end_time: slot.end_time,
            timezone: prof.timezone,
            created_at: new Date().toISOString()
          })
      }

      // Create user preferences
      await supabase
        .from('user_preferences')
        .insert({
          profile_id: profileData.id,
          email_notifications: true,
          push_notifications: true,
          weekly_match_reminders: true,
          marketing_emails: false,
          privacy_level: 'standard',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      // Create verification documents
      await supabase
        .from('verification_documents')
        .insert({
          profile_id: profileData.id,
          id_document_url: `https://example.com/docs/${prof.email.split('@')[0]}-id.pdf`,
          selfie_url: `https://example.com/docs/${prof.email.split('@')[0]}-selfie.jpg`,
          license_url: `https://example.com/docs/${prof.email.split('@')[0]}-license.pdf`,
          status: 'approved',
          admin_notes: 'Automatically approved for test data',
          submitted_at: new Date().toISOString(),
          reviewed_at: new Date().toISOString(),
          reviewed_by: null // Will be set to admin later
        })

      // Create subscription (random plan)
      const randomPlan = paymentPlans[Math.floor(Math.random() * paymentPlans.length)]
      await supabase
        .from('user_subscriptions')
        .insert({
          profile_id: profileData.id,
          payment_plan_id: null, // Will be set after payment plans are created
          stripe_customer_id: `cus_test_${profileData.id.substring(0, 8)}`,
          stripe_subscription_id: `sub_test_${profileData.id.substring(0, 8)}`,
          status: 'active',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          trial_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      console.log(`✅ Created: ${prof.first_name} ${prof.last_name} (${prof.medical_specialty})`)
      createdUsers.push({ ...prof, profileId: profileData.id, userId: authData.user.id })
      
    } catch (error) {
      console.error(`❌ Unexpected error for ${prof.email}:`, error.message)
    }
  }
  
  return createdUsers
}

async function createAdminAccount() {
  console.log('\n👑 Creating Admin Account...')
  console.log('============================')
  
  try {
    // Check if admin exists
    const { data: users } = await supabase.auth.admin.listUsers()
    const existingAdmin = users.users.find(u => u.email === 'admin@beyondrounds.com')
    
    if (existingAdmin) {
      console.log('✅ Admin account already exists')
      return existingAdmin
    }

    // Create admin user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'admin@beyondrounds.com',
      password: 'AdminPassword123!',
      email_confirm: true,
      user_metadata: {
        first_name: 'Admin',
        last_name: 'User',
        role: 'admin'
      }
    })

    if (authError) {
      console.error('❌ Admin auth error:', authError.message)
      return null
    }

    // Create admin profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: authData.user.id,
        email: 'admin@beyondrounds.com',
        first_name: 'Admin',
        last_name: 'User',
        age: 35,
        gender: 'prefer-not-to-say',
        nationality: 'Saudi',
        city: 'Riyadh',
        timezone: 'Asia/Riyadh',
        role: 'admin',
        is_verified: true,
        is_banned: false,
        medical_specialty: 'Administration',
        bio: 'System Administrator for BeyondRounds Medical Matching Platform',
        looking_for: 'Platform management and user support',
        profile_completion: 100,
        onboarding_completed: true,
        last_active_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (profileError) {
      console.error('❌ Admin profile error:', profileError.message)
      return null
    }

    console.log('✅ Admin account created successfully')
    return { ...authData.user, profileId: profileData.id }
    
  } catch (error) {
    console.error('❌ Admin creation error:', error.message)
    return null
  }
}

async function createSampleMatches(users) {
  console.log('\n💕 Creating Sample Matches...')
  console.log('==============================')
  
  try {
    // Create match batch
    const { data: batchData, error: batchError } = await supabase
      .from('match_batches')
      .insert({
        batch_date: new Date().toISOString().split('T')[0],
        total_eligible_users: users.length,
        total_groups_created: 2,
        total_users_matched: 4,
        algorithm_version: 'v2.0',
        processing_started_at: new Date().toISOString(),
        processing_completed_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (batchError) {
      console.log('⚠️  Match batch creation warning:', batchError.message)
    }

    // Create sample matches
    const matches = [
      {
        batch_id: batchData?.id,
        group_name: 'Cardiology & Neurology Collaboration',
        match_week: new Date().toISOString().split('T')[0],
        group_size: 2,
        average_compatibility: 92,
        algorithm_version: 'v2.0',
        matching_criteria: {
          specialty_compatibility: 'high',
          city_preference: 'same',
          experience_level: 'similar'
        },
        success_metrics: {
          response_rate: 100,
          engagement_score: 95
        },
        last_activity_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        batch_id: batchData?.id,
        group_name: 'Pediatrics & Dermatology Network',
        match_week: new Date().toISOString().split('T')[0],
        group_size: 2,
        average_compatibility: 88,
        algorithm_version: 'v2.0',
        matching_criteria: {
          specialty_compatibility: 'medium',
          city_preference: 'different',
          experience_level: 'varied'
        },
        success_metrics: {
          response_rate: 100,
          engagement_score: 90
        },
        last_activity_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]

    const createdMatches = []
    for (const match of matches) {
      const { data: matchData, error: matchError } = await supabase
        .from('matches')
        .insert(match)
        .select()
        .single()

      if (matchError) {
        console.log('⚠️  Match creation warning:', matchError.message)
      } else {
        createdMatches.push(matchData)
        console.log(`✅ Created match: ${match.group_name}`)
      }
    }

    // Create match members
    if (createdMatches.length >= 2) {
      const matchMembers = [
        // Match 1: Cardiology & Neurology
        { match_id: createdMatches[0].id, profile_id: users[0].profileId, compatibility_score: 95 },
        { match_id: createdMatches[0].id, profile_id: users[4].profileId, compatibility_score: 89 },
        // Match 2: Pediatrics & Dermatology
        { match_id: createdMatches[1].id, profile_id: users[1].profileId, compatibility_score: 92 },
        { match_id: createdMatches[1].id, profile_id: users[3].profileId, compatibility_score: 84 }
      ]

      for (const member of matchMembers) {
        await supabase
          .from('match_members')
          .insert({
            ...member,
            compatibility_factors: {
              specialty_match: 0.8,
              city_match: 0.6,
              experience_match: 0.9
            },
            joined_at: new Date().toISOString(),
            is_active: true
          })
      }

      console.log(`✅ Created ${matchMembers.length} match members`)
    }

    return createdMatches
  } catch (error) {
    console.log('⚠️  Sample matches creation warning:', error.message)
    return []
  }
}

async function createSampleChats(matches, users) {
  console.log('\n💬 Creating Sample Chat Rooms...')
  console.log('=================================')
  
  try {
    const chatRooms = []
    
    for (const match of matches) {
      const { data: chatRoomData, error: chatRoomError } = await supabase
        .from('chat_rooms')
        .insert({
          match_id: match.id,
          name: match.group_name,
          description: `Chat room for ${match.group_name}`,
          is_active: true,
          is_archived: false,
          message_count: 3,
          last_message_at: new Date().toISOString(),
          settings: {
            allow_file_sharing: true,
            allow_voice_messages: false,
            moderation_enabled: true
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (chatRoomError) {
        console.log('⚠️  Chat room creation warning:', chatRoomError.message)
      } else {
        chatRooms.push(chatRoomData)
        console.log(`✅ Created chat room: ${match.group_name}`)
      }
    }

    // Create sample messages
    const sampleMessages = [
      {
        chat_room_id: chatRooms[0]?.id,
        match_id: matches[0]?.id,
        sender_id: users[0].profileId,
        content: 'مرحباً! أتطلع للتعاون في مجال أمراض القلب والأعصاب',
        is_edited: false,
        edit_count: 0,
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
      },
      {
        chat_room_id: chatRooms[0]?.id,
        match_id: matches[0]?.id,
        sender_id: users[4].profileId,
        content: 'أهلاً وسهلاً! لديك خبرة ممتازة في أمراض القلب',
        is_edited: false,
        edit_count: 0,
        created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() // 1 hour ago
      },
      {
        chat_room_id: chatRooms[0]?.id,
        match_id: matches[0]?.id,
        sender_id: users[0].profileId,
        content: 'شكراً لك! هل تريد مناقشة حالة معينة؟',
        is_edited: false,
        edit_count: 0,
        created_at: new Date().toISOString()
      }
    ]

    for (const message of sampleMessages) {
      if (message.chat_room_id && message.match_id && message.sender_id) {
        await supabase
          .from('chat_messages')
          .insert({
            ...message,
            search_vector: message.content
          })
      }
    }

    console.log(`✅ Created ${sampleMessages.length} sample messages`)
    return chatRooms
  } catch (error) {
    console.log('⚠️  Sample chats creation warning:', error.message)
    return []
  }
}

async function createSampleNotifications(users) {
  console.log('\n🔔 Creating Sample Notifications...')
  console.log('====================================')
  
  try {
    const notifications = [
      {
        profile_id: users[0].profileId,
        title: 'New Match Available!',
        message: 'You have a new potential match with Dr. Khalid Alrashid',
        data: { match_type: 'new', specialty: 'Neurology' },
        is_read: false,
        is_sent: true,
        sent_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      },
      {
        profile_id: users[1].profileId,
        title: 'Weekly Match Summary',
        message: 'You have 3 new matches this week',
        data: { match_count: 3, week: 'current' },
        is_read: true,
        read_at: new Date().toISOString(),
        is_sent: true,
        sent_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      },
      {
        profile_id: users[2].profileId,
        title: 'Profile Verification Complete',
        message: 'Your profile has been verified successfully',
        data: { verification_status: 'approved' },
        is_read: false,
        is_sent: true,
        sent_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      }
    ]

    for (const notification of notifications) {
      await supabase
        .from('notifications')
        .insert(notification)
    }

    console.log(`✅ Created ${notifications.length} sample notifications`)
  } catch (error) {
    console.log('⚠️  Sample notifications creation warning:', error.message)
  }
}

async function generateComprehensiveTestData() {
  console.log('🏥 BeyondRounds Medical Matching System')
  console.log('========================================')
  console.log('Comprehensive Test Data Generator')
  console.log('Creating complete test data for all tables\n')

  try {
    // Cleanup existing data
    await cleanupExistingData()
    
    // Create payment plans first
    await createPaymentPlans()
    
    // Create medical professionals
    const createdUsers = await createMedicalProfessionals()
    
    // Create admin account
    await createAdminAccount()
    
    // Create sample matches
    const matches = await createSampleMatches(createdUsers)
    
    // Create sample chats
    await createSampleChats(matches, createdUsers)
    
    // Create sample notifications
    await createSampleNotifications(createdUsers)
    
    console.log('\n🎉 Comprehensive Test Data Generation Complete!')
    console.log('===============================================')
    console.log(`✅ Created ${createdUsers.length} medical professionals`)
    console.log('✅ Created admin account')
    console.log(`✅ Created ${paymentPlans.length} payment plans`)
    console.log(`✅ Created ${matches.length} sample matches`)
    console.log('✅ Created sample chat rooms and messages')
    console.log('✅ Created sample notifications')
    console.log('\n📋 Login Credentials:')
    console.log('====================')
    console.log('🔑 All medical professionals use password: MedicalPass123!')
    console.log('👑 Admin password: AdminPassword123!')
    console.log('\n📧 Sample Accounts:')
    console.log('==================')
    console.log('• dr.ahmed.alharbi@beyondrounds.com (Cardiology)')
    console.log('• dr.sara.almansouri@beyondrounds.com (Pediatrics)')
    console.log('• dr.mohammed.alshehri@beyondrounds.com (Orthopedics)')
    console.log('• dr.fatima.alqahtani@beyondrounds.com (Dermatology)')
    console.log('• dr.khalid.alrashid@beyondrounds.com (Neurology)')
    console.log('• admin@beyondrounds.com (Admin)')
    console.log('\n🔗 Login at: http://localhost:3000/auth/login')
    console.log('\n📊 Test Features Available:')
    console.log('==========================')
    console.log('• User profiles with complete data')
    console.log('• Payment plans and subscriptions')
    console.log('• Matching algorithm with compatibility scores')
    console.log('• Chat rooms and messaging')
    console.log('• Notifications system')
    console.log('• Admin dashboard with full functionality')
    
  } catch (error) {
    console.error('❌ Test data generation failed:', error.message)
  }
}

// Run the script
generateComprehensiveTestData().catch(console.error)






