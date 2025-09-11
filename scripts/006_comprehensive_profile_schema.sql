-- Comprehensive Profile Schema Update for BeyondRounds
-- This script expands the existing profiles table to support the detailed matching system

-- Add new columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS age INTEGER,
ADD COLUMN IF NOT EXISTS nationality TEXT,
ADD COLUMN IF NOT EXISTS medical_specialty TEXT[], -- Multi-select medical specialties
ADD COLUMN IF NOT EXISTS specialty_preference TEXT DEFAULT 'no-preference' CHECK (specialty_preference IN ('same', 'different', 'no-preference')),
ADD COLUMN IF NOT EXISTS career_stage TEXT,
ADD COLUMN IF NOT EXISTS sports_activities JSONB DEFAULT '{}', -- Sports with interest ratings
ADD COLUMN IF NOT EXISTS activity_level TEXT,
ADD COLUMN IF NOT EXISTS music_preferences TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS movie_tv_preferences TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS other_interests TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS preferred_activities TEXT[] DEFAULT '{}', -- Meeting activities with rankings
ADD COLUMN IF NOT EXISTS social_energy_level TEXT,
ADD COLUMN IF NOT EXISTS conversation_style TEXT,
ADD COLUMN IF NOT EXISTS meeting_frequency TEXT,
ADD COLUMN IF NOT EXISTS dietary_restrictions TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS life_stage TEXT,
ADD COLUMN IF NOT EXISTS looking_for TEXT[] DEFAULT '{}', -- What they're seeking (friendships, mentorship, etc.)
ADD COLUMN IF NOT EXISTS ideal_weekend TEXT,
ADD COLUMN IF NOT EXISTS profile_completion_percentage INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- Update gender preference options to match new structure
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_gender_preference_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_gender_preference_check 
CHECK (gender_preference IN ('no-preference', 'mixed', 'same-gender-only', 'same-gender-preferred'));

-- Add indexes for the new fields that will be used in matching
CREATE INDEX IF NOT EXISTS idx_profiles_age ON profiles(age) WHERE age IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_medical_specialty ON profiles USING GIN(medical_specialty);
CREATE INDEX IF NOT EXISTS idx_profiles_career_stage ON profiles(career_stage);
CREATE INDEX IF NOT EXISTS idx_profiles_activity_level ON profiles(activity_level);
CREATE INDEX IF NOT EXISTS idx_profiles_social_energy ON profiles(social_energy_level);
CREATE INDEX IF NOT EXISTS idx_profiles_life_stage ON profiles(life_stage);
CREATE INDEX IF NOT EXISTS idx_profiles_looking_for ON profiles USING GIN(looking_for);
CREATE INDEX IF NOT EXISTS idx_profiles_completion ON profiles(profile_completion_percentage);
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding ON profiles(onboarding_completed);

-- Function to calculate profile completion percentage
CREATE OR REPLACE FUNCTION calculate_profile_completion(profile_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    completion_score INTEGER := 0;
    total_fields INTEGER := 20; -- Total number of key profile fields
BEGIN
    SELECT 
        CASE WHEN first_name IS NOT NULL AND first_name != '' THEN 1 ELSE 0 END +
        CASE WHEN last_name IS NOT NULL AND last_name != '' THEN 1 ELSE 0 END +
        CASE WHEN specialty IS NOT NULL AND specialty != '' THEN 1 ELSE 0 END +
        CASE WHEN city IS NOT NULL AND city != '' THEN 1 ELSE 0 END +
        CASE WHEN gender IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN age IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN medical_specialty IS NOT NULL AND array_length(medical_specialty, 1) > 0 THEN 1 ELSE 0 END +
        CASE WHEN career_stage IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN sports_activities IS NOT NULL AND jsonb_typeof(sports_activities) = 'object' AND sports_activities != '{}' THEN 1 ELSE 0 END +
        CASE WHEN activity_level IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN music_preferences IS NOT NULL AND array_length(music_preferences, 1) > 0 THEN 1 ELSE 0 END +
        CASE WHEN movie_tv_preferences IS NOT NULL AND array_length(movie_tv_preferences, 1) > 0 THEN 1 ELSE 0 END +
        CASE WHEN other_interests IS NOT NULL AND array_length(other_interests, 1) > 0 THEN 1 ELSE 0 END +
        CASE WHEN preferred_activities IS NOT NULL AND array_length(preferred_activities, 1) > 0 THEN 1 ELSE 0 END +
        CASE WHEN social_energy_level IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN conversation_style IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN meeting_frequency IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN life_stage IS NOT NULL THEN 1 ELSE 0 END +
        CASE WHEN looking_for IS NOT NULL AND array_length(looking_for, 1) > 0 THEN 1 ELSE 0 END +
        CASE WHEN ideal_weekend IS NOT NULL THEN 1 ELSE 0 END
    INTO completion_score
    FROM profiles 
    WHERE id = profile_id;
    
    RETURN (completion_score * 100) / total_fields;
END;
$$;

-- Trigger to auto-update profile completion percentage
CREATE OR REPLACE FUNCTION update_profile_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.profile_completion_percentage = calculate_profile_completion(NEW.id);
    RETURN NEW;
END;
$$;

-- Create trigger for profile completion updates
DROP TRIGGER IF EXISTS trigger_update_profile_completion ON profiles;
CREATE TRIGGER trigger_update_profile_completion
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_profile_completion();

-- Update existing profiles to calculate their completion percentage
UPDATE profiles SET updated_at = NOW(); -- This will trigger the completion calculation

-- Create enum-like constraints for new fields
ALTER TABLE profiles ADD CONSTRAINT check_career_stage 
CHECK (career_stage IN (
    'medical-student', 
    'resident-1-2', 
    'resident-3plus', 
    'fellow', 
    'attending-0-5', 
    'attending-5plus', 
    'private-practice', 
    'academic-medicine', 
    'other'
));

ALTER TABLE profiles ADD CONSTRAINT check_activity_level 
CHECK (activity_level IN (
    'very-active', 
    'active', 
    'moderately-active', 
    'occasionally-active', 
    'prefer-non-physical'
));

ALTER TABLE profiles ADD CONSTRAINT check_social_energy_level 
CHECK (social_energy_level IN (
    'high-energy-big-groups', 
    'moderate-energy-small-groups', 
    'low-key-intimate', 
    'varies-by-mood'
));

ALTER TABLE profiles ADD CONSTRAINT check_conversation_style 
CHECK (conversation_style IN (
    'deep-meaningful', 
    'light-fun-casual', 
    'hobby-focused', 
    'professional-career', 
    'mix-everything'
));

ALTER TABLE profiles ADD CONSTRAINT check_meeting_frequency 
CHECK (meeting_frequency IN (
    'weekly', 
    'bi-weekly', 
    'monthly', 
    'as-schedules-allow'
));

ALTER TABLE profiles ADD CONSTRAINT check_life_stage 
CHECK (life_stage IN (
    'single-no-kids', 
    'relationship-no-kids', 
    'married-no-kids', 
    'young-children', 
    'older-children', 
    'empty-nester', 
    'prefer-not-say'
));

ALTER TABLE profiles ADD CONSTRAINT check_ideal_weekend 
CHECK (ideal_weekend IN (
    'adventure-exploration', 
    'relaxation-self-care', 
    'social-activities', 
    'cultural-activities', 
    'sports-fitness', 
    'home-projects-hobbies', 
    'mix-active-relaxing'
));

-- Add comments for documentation
COMMENT ON COLUMN profiles.medical_specialty IS 'Array of medical specialties/positions (multi-select)';
COMMENT ON COLUMN profiles.sports_activities IS 'JSON object with sports and their interest ratings (1-5)';
COMMENT ON COLUMN profiles.preferred_activities IS 'Array of preferred meeting activities with rankings';
COMMENT ON COLUMN profiles.looking_for IS 'Array of what user is looking for (friendships, mentorship, etc.)';
COMMENT ON COLUMN profiles.profile_completion_percentage IS 'Automatically calculated completion percentage';
