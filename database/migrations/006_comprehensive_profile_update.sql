-- ==============================================
-- Comprehensive Profile System Update
-- ==============================================
-- This migration adds all the comprehensive profile fields
-- specified in the user requirements

-- Add new columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS dietary_preferences TEXT CHECK (dietary_preferences IN ('no-restrictions', 'vegetarian', 'vegan', 'halal', 'kosher', 'gluten-free', 'other-allergies')),
ADD COLUMN IF NOT EXISTS life_stage TEXT CHECK (life_stage IN ('single-no-kids', 'relationship-no-kids', 'married-no-kids', 'young-children', 'older-children', 'empty-nester', 'prefer-not-to-say')),
ADD COLUMN IF NOT EXISTS ideal_weekend TEXT CHECK (ideal_weekend IN ('adventure-exploration', 'relaxation-self-care', 'social-activities', 'cultural-activities', 'sports-fitness', 'home-projects', 'mix-active-relaxing'));

-- Update existing columns with new constraints and options
ALTER TABLE profiles 
ALTER COLUMN gender_preference TYPE TEXT,
ALTER COLUMN gender_preference SET DEFAULT 'no-preference',
ADD CONSTRAINT check_gender_preference_new CHECK (gender_preference IN ('no-preference', 'mixed-preferred', 'same-gender-only', 'same-gender-preferred'));

-- Update specialty_preference with new options
ALTER TABLE profiles 
ALTER COLUMN specialty_preference TYPE TEXT,
ADD CONSTRAINT check_specialty_preference_new CHECK (specialty_preference IN ('same-specialty-preferred', 'different-specialties-preferred', 'no-preference'));

-- Update career_stage with comprehensive options
ALTER TABLE profiles 
ALTER COLUMN career_stage TYPE TEXT,
ADD CONSTRAINT check_career_stage_new CHECK (career_stage IN ('medical-student', 'resident-1-2', 'resident-3-plus', 'fellow', 'attending-0-5', 'attending-5-plus', 'private-practice', 'academic-medicine', 'other'));

-- Update activity_level with new options
ALTER TABLE profiles 
ALTER COLUMN activity_level TYPE TEXT,
ADD CONSTRAINT check_activity_level_new CHECK (activity_level IN ('very-active', 'active', 'moderately-active', 'occasionally-active', 'non-physical'));

-- Update social_energy_level with new options
ALTER TABLE profiles 
ALTER COLUMN social_energy_level TYPE TEXT,
ADD CONSTRAINT check_social_energy_level_new CHECK (social_energy_level IN ('high-energy-big-groups', 'moderate-energy-small-groups', 'low-key-intimate', 'varies-by-mood'));

-- Update conversation_style with new options
ALTER TABLE profiles 
ALTER COLUMN conversation_style TYPE TEXT,
ADD CONSTRAINT check_conversation_style_new CHECK (conversation_style IN ('deep-meaningful', 'light-fun-casual', 'hobby-focused', 'professional-career', 'mix-everything'));

-- Update meeting_frequency with new options
ALTER TABLE profiles 
ALTER COLUMN meeting_frequency TYPE TEXT,
ADD CONSTRAINT check_meeting_frequency_new CHECK (meeting_frequency IN ('weekly', 'bi-weekly', 'monthly', 'as-schedules-allow'));

-- Update life_stage with new options
ALTER TABLE profiles 
ALTER COLUMN life_stage TYPE TEXT,
ADD CONSTRAINT check_life_stage_new CHECK (life_stage IN ('single-no-kids', 'relationship-no-kids', 'married-no-kids', 'young-children', 'older-children', 'empty-nester', 'prefer-not-to-say'));

-- Add new indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_specialties ON profiles USING GIN(specialties);
CREATE INDEX IF NOT EXISTS idx_profiles_music_genres ON profiles USING GIN(music_genres);
CREATE INDEX IF NOT EXISTS idx_profiles_movie_genres ON profiles USING GIN(movie_genres);
CREATE INDEX IF NOT EXISTS idx_profiles_other_interests ON profiles USING GIN(other_interests);
CREATE INDEX IF NOT EXISTS idx_profiles_meeting_activities ON profiles USING GIN(meeting_activities);
CREATE INDEX IF NOT EXISTS idx_profiles_preferred_times ON profiles USING GIN(preferred_times);
CREATE INDEX IF NOT EXISTS idx_profiles_looking_for ON profiles USING GIN(looking_for);
CREATE INDEX IF NOT EXISTS idx_profiles_sports_activities ON profiles USING GIN(sports_activities);

-- Update profile completion calculation function
CREATE OR REPLACE FUNCTION calculate_profile_completion_percentage(profile_id UUID)
RETURNS INTEGER AS $$
DECLARE
    completion_score INTEGER := 0;
    total_fields INTEGER := 25; -- Total number of fields to check
    profile_record RECORD;
BEGIN
    -- Get the profile record
    SELECT * INTO profile_record FROM profiles WHERE id = profile_id;
    
    IF NOT FOUND THEN
        RETURN 0;
    END IF;
    
    -- Basic Info (5 fields)
    IF profile_record.first_name IS NOT NULL AND profile_record.first_name != '' THEN completion_score := completion_score + 1; END IF;
    IF profile_record.last_name IS NOT NULL AND profile_record.last_name != '' THEN completion_score := completion_score + 1; END IF;
    IF profile_record.age IS NOT NULL THEN completion_score := completion_score + 1; END IF;
    IF profile_record.gender IS NOT NULL THEN completion_score := completion_score + 1; END IF;
    IF profile_record.city IS NOT NULL AND profile_record.city != '' THEN completion_score := completion_score + 1; END IF;
    
    -- Medical Background (3 fields)
    IF profile_record.medical_specialty IS NOT NULL AND profile_record.medical_specialty != '' THEN completion_score := completion_score + 1; END IF;
    IF profile_record.specialty_preference IS NOT NULL THEN completion_score := completion_score + 1; END IF;
    IF profile_record.career_stage IS NOT NULL THEN completion_score := completion_score + 1; END IF;
    
    -- Sports & Activities (2 fields)
    IF jsonb_object_keys(profile_record.sports_activities) IS NOT NULL THEN completion_score := completion_score + 1; END IF;
    IF profile_record.activity_level IS NOT NULL THEN completion_score := completion_score + 1; END IF;
    
    -- Entertainment (3 fields)
    IF array_length(profile_record.music_genres, 1) > 0 THEN completion_score := completion_score + 1; END IF;
    IF array_length(profile_record.movie_genres, 1) > 0 THEN completion_score := completion_score + 1; END IF;
    IF array_length(profile_record.other_interests, 1) > 0 THEN completion_score := completion_score + 1; END IF;
    
    -- Social Preferences (3 fields)
    IF array_length(profile_record.meeting_activities, 1) > 0 THEN completion_score := completion_score + 1; END IF;
    IF profile_record.social_energy_level IS NOT NULL THEN completion_score := completion_score + 1; END IF;
    IF profile_record.conversation_style IS NOT NULL THEN completion_score := completion_score + 1; END IF;
    
    -- Availability (2 fields)
    IF array_length(profile_record.preferred_times, 1) > 0 THEN completion_score := completion_score + 1; END IF;
    IF profile_record.meeting_frequency IS NOT NULL THEN completion_score := completion_score + 1; END IF;
    
    -- Lifestyle (4 fields)
    IF profile_record.dietary_preferences IS NOT NULL THEN completion_score := completion_score + 1; END IF;
    IF profile_record.life_stage IS NOT NULL THEN completion_score := completion_score + 1; END IF;
    IF array_length(profile_record.looking_for, 1) > 0 THEN completion_score := completion_score + 1; END IF;
    IF profile_record.ideal_weekend IS NOT NULL THEN completion_score := completion_score + 1; END IF;
    
    -- Additional fields (3 fields)
    IF profile_record.gender_preference IS NOT NULL THEN completion_score := completion_score + 1; END IF;
    IF profile_record.nationality IS NOT NULL AND profile_record.nationality != '' THEN completion_score := completion_score + 1; END IF;
    IF profile_record.city IS NOT NULL AND profile_record.city != '' THEN completion_score := completion_score + 1; END IF;
    
    -- Calculate percentage
    RETURN ROUND((completion_score::DECIMAL / total_fields::DECIMAL) * 100);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update profile completion
CREATE OR REPLACE FUNCTION update_profile_completion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.profile_completion_percentage := calculate_profile_completion_percentage(NEW.id);
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_update_profile_completion ON profiles;

-- Create new trigger
CREATE TRIGGER trigger_update_profile_completion
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_profile_completion();

-- Update existing profiles to recalculate completion percentage
UPDATE profiles SET updated_at = NOW() WHERE id IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN profiles.last_name IS 'User last name for complete identification';
COMMENT ON COLUMN profiles.dietary_preferences IS 'Dietary restrictions and preferences for group activities';
COMMENT ON COLUMN profiles.life_stage IS 'Current life stage affecting availability and preferences';
COMMENT ON COLUMN profiles.ideal_weekend IS 'Preferred weekend activity type for compatibility matching';

COMMENT ON FUNCTION calculate_profile_completion_percentage(UUID) IS 'Calculates profile completion percentage based on comprehensive field requirements';
COMMENT ON FUNCTION update_profile_completion() IS 'Trigger function to automatically update profile completion percentage';
