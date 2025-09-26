# 🚀 Comprehensive Schema Migration Guide

This guide walks you through updating your entire codebase with the new comprehensive database schema that includes enhanced tables, new fields, better constraints, and improved functionality.

## 📋 What's New in the Schema

### Enhanced Tables
- **profiles**: Added `phone_number`, `gender`, `nationality`, `timezone`, `role`, `bio`, `looking_for`, `search_vector`, `last_active_at`, and ban-related fields
- **matches**: Added `batch_id`, `group_name`, `group_size`, `average_compatibility`, `algorithm_version`, `matching_criteria`, `success_metrics`, `last_activity_at`, `completion_date`, `status`
- **match_members**: Added `compatibility_score`, `compatibility_factors`, `joined_at`, `left_at`, `leave_reason`
- **chat_rooms**: Added `description`, `is_active`, `is_archived`, `message_count`, `last_message_at`, `settings`
- **chat_messages**: Added `reply_to_id`, `is_edited`, `edit_count`, `edited_at`, `is_flagged`, `flag_reason`, `moderated_at`, `moderated_by`, `search_vector`

### New Tables
- **audit_log**: Track all database changes
- **feedback**: User feedback and ratings system
- **feedback_improvement_areas**: Areas for improvement
- **feedback_positive_aspects**: Positive feedback aspects
- **match_batches**: Batch processing for matches
- **match_history**: Historical matching data
- **message_reactions**: Emoji reactions to messages
- **message_read_status**: Message read tracking
- **payment_plans**: Subscription plans
- **payments**: Payment processing
- **profile_availability_slots**: User availability
- **profile_interests**: User interests
- **profile_meeting_activities**: Preferred activities
- **profile_preferences**: Matching preferences
- **profile_specialties**: Medical specialties
- **user_preferences**: User settings
- **user_subscriptions**: Subscription management
- **verification_documents**: Identity verification

### New Enum Types
- **gender_type**, **role_type**, **activity_level**, **social_energy_level**
- **conversation_style**, **life_stage**, **ideal_weekend**, **meeting_frequency**
- **currency_type**, **billing_interval_type**, **pay_type**, **sub_status_type**
- **verify_status_type**, **gender_pref_type**, **specialty_pref_type**

## 🔧 Step 1: Apply the Database Migration

### Option A: Automated Script (Recommended)
```bash
# Run the automated migration script
node scripts/apply-comprehensive-schema-migration.js
```

### Option B: Manual Application
1. **Go to Supabase Dashboard**
2. **Navigate to SQL Editor**
3. **Copy and paste the contents of `scripts/comprehensive-schema-migration.sql`**
4. **Click "Run"**
5. **Wait for completion**

## 📝 Step 2: Update Your Code

### TypeScript Types
✅ **Already Updated**: `src/lib/types/schema.ts`
- Contains all new interfaces and types
- Includes helper types for Insert/Update operations
- Enum types for easy use

### API Routes
✅ **Already Updated**: `src/app/api/dashboard/route.ts`
- Uses new schema fields
- Enhanced data selection
- Better type safety

### Components to Update
The following components should be updated to use new schema fields:

#### Profile Components
```typescript
// Use new profile fields
interface ProfileWithEnhancements {
  phone_number?: string
  gender?: GenderType
  nationality?: string
  bio?: string
  looking_for?: string
  role: RoleType
  is_verified: boolean
  is_banned: boolean
  last_active_at: string
}
```

#### Chat Components
```typescript
// Use enhanced chat message fields
interface EnhancedChatMessage {
  reply_to_id?: string
  is_edited: boolean
  edit_count: number
  is_flagged: boolean
  // Add reactions and read status
  reactions?: MessageReaction[]
  read_status?: MessageReadStatus[]
}
```

#### Match Components
```typescript
// Use enhanced match data
interface EnhancedMatch {
  group_name?: string
  group_size: number
  average_compatibility?: number
  algorithm_version: string
  status: MatchStatus
  last_activity_at: string
}
```

## 🎯 Step 3: Key Implementation Updates

### 1. Profile Management
```typescript
// Fetch enhanced profile data
const { data: profile } = await supabase
  .from('profiles')
  .select(`
    id, user_id, first_name, last_name, email, age, gender,
    nationality, city, timezone, medical_specialty, bio,
    looking_for, profile_completion, is_verified, is_banned,
    role, onboarding_completed, last_active_at, phone_number
  `)
  .eq('user_id', userId)
  .single()
```

### 2. Enhanced Matching
```typescript
// Get matches with compatibility scores
const { data: matches } = await supabase
  .from('match_members')
  .select(`
    match_id, compatibility_score, joined_at,
    matches (
      group_name, group_size, average_compatibility,
      algorithm_version, status, last_activity_at
    )
  `)
  .eq('profile_id', profileId)
  .eq('is_active', true)
```

### 3. Advanced Chat Features
```typescript
// Get messages with reactions and read status
const { data: messages } = await supabase
  .from('chat_messages')
  .select(`
    id, content, sender_id, reply_to_id, is_edited,
    is_flagged, created_at,
    message_reactions (emoji, profile_id),
    message_read_status (profile_id, read_at)
  `)
  .eq('chat_room_id', chatRoomId)
  .is('deleted_at', null)
  .eq('is_flagged', false)
```

### 4. User Preferences
```typescript
// Fetch user preferences
const { data: preferences } = await supabase
  .from('profile_preferences')
  .select(`
    gender_preference, specialty_preference, meeting_frequency,
    activity_level, social_energy_level, conversation_style,
    life_stage, ideal_weekend
  `)
  .eq('profile_id', profileId)
  .single()
```

### 5. Feedback System
```typescript
// Submit feedback
const { data: feedback } = await supabase
  .from('feedback')
  .insert({
    match_id: matchId,
    reviewer_id: reviewerId,
    reviewee_id: revieweeId,
    did_meet: true,
    overall_rating: 5,
    communication_rating: 5,
    feedback_text: 'Great experience!'
  })
```

## 🧪 Step 4: Testing the Migration

### Run the Test Script
```bash
# Test migration features
node scripts/test-migration-features.js
```

### Manual Testing Checklist
- [ ] **Profile Loading**: Enhanced profile fields display correctly
- [ ] **Match Display**: Group names, sizes, and compatibility scores show
- [ ] **Chat Messages**: New fields like edit status and flags work
- [ ] **Notifications**: Enhanced notification data displays
- [ ] **User Preferences**: Preference settings save and load
- [ ] **RLS Policies**: Data access is properly restricted
- [ ] **New Tables**: All new tables are accessible

## 🔍 Step 5: Verification

### Database Structure
```sql
-- Verify new columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('phone_number', 'gender', 'bio', 'role');

-- Verify new tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('feedback', 'payment_plans', 'profile_preferences');
```

### RLS Policies
```sql
-- Check RLS policies
SELECT schemaname, tablename, policyname, roles
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Migration Errors
- **Permission denied**: Ensure you're using the service role key
- **Column already exists**: These are expected - the migration handles them
- **Type already exists**: Also expected - migration is idempotent

#### 2. RLS Issues
- **Infinite recursion**: Apply the emergency RLS fix if needed
- **Access denied**: Check that policies are correctly applied

#### 3. Type Errors
- **Missing types**: Ensure you're importing from `@/lib/types/schema`
- **Interface mismatches**: Update component interfaces to match new schema

### Emergency Fixes

If you encounter issues:

1. **Revert to Previous Schema**:
   ```sql
   -- Create backup before migration
   pg_dump your_database > backup.sql
   ```

2. **Apply Emergency RLS Fix**:
   ```bash
   # Use the existing RLS fix
   node scripts/apply-emergency-match-members-rls-fix.js
   ```

3. **Reset Specific Table**:
   ```sql
   -- Reset a problematic table
   DROP TABLE IF EXISTS problematic_table CASCADE;
   -- Then re-run relevant migration section
   ```

## 🎉 Expected Benefits

After successful migration:

- ✅ **Enhanced User Profiles**: Rich profile data with preferences
- ✅ **Better Matching**: Compatibility scores and algorithm versioning
- ✅ **Advanced Chat**: Message reactions, editing, and moderation
- ✅ **Comprehensive Feedback**: Rating and feedback system
- ✅ **Payment Integration**: Subscription and payment management
- ✅ **Audit Trail**: Complete change tracking
- ✅ **Better Performance**: Optimized indexes and constraints
- ✅ **Type Safety**: Complete TypeScript coverage

## 📞 Support

If you encounter issues:

1. Check the console logs for specific error messages
2. Verify your Supabase connection and permissions
3. Ensure all environment variables are correctly set
4. Review the migration SQL for any custom modifications needed

---

**🚀 Your application is now ready for the next level with comprehensive schema support!**


