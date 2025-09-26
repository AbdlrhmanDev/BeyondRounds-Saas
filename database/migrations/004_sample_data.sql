-- ==============================================
-- Migration 004: Sample Data
-- ==============================================
-- Run this script for development/testing purposes
-- This adds sample data to test the application

-- ==============================================
-- SAMPLE PROFILES
-- ==============================================

-- Sample Admin User (replace with actual admin email)
-- Note: You'll need to create this user through Supabase Auth first, then update the profile
INSERT INTO profiles (
  id, 
  email, 
  first_name, 
  last_name, 
  gender, 
  city, 
  specialties, 
  specialty_preference,
  career_stage,
  activity_level,
  social_energy_level,
  conversation_style,
  meeting_frequency,
  life_stage,
  looking_for,
  ideal_weekend,
  is_verified, 
  is_paid, 
  onboarding_completed, 
  role
) VALUES (
  gen_random_uuid(), -- Replace with actual admin UUID from auth.users
  'admin@beyondrounds.com',
  'Admin',
  'User',
  'prefer-not-to-say',
  'San Francisco',
  ARRAY['General Practice/Family Medicine'],
  'no-preference',
  'attending-5-plus',
  'moderately-active',
  'moderate',
  'professional-focused',
  'monthly',
  'single',
  ARRAY['professional-networking', 'friendship'],
  'Relaxing with a good book and coffee, maybe a hike',
  true,
  true,
  true,
  'admin'
) ON CONFLICT (email) DO NOTHING;

-- Sample Medical Professionals
INSERT INTO profiles (
  id, 
  email, 
  first_name, 
  last_name, 
  gender, 
  city, 
  specialties, 
  specialty_preference,
  career_stage,
  sports_activities,
  activity_level,
  music_genres,
  movie_genres,
  other_interests,
  meeting_activities,
  social_energy_level,
  conversation_style,
  preferred_times,
  meeting_frequency,
  life_stage,
  looking_for,
  ideal_weekend,
  is_verified, 
  is_paid, 
  onboarding_completed
) VALUES 
-- Cardiologist in San Francisco
(
  gen_random_uuid(),
  'dr.sarah.chen@example.com',
  'Sarah',
  'Chen',
  'female',
  'San Francisco',
  ARRAY['Cardiology'],
  'same-specialty',
  'attending-0-5',
  '{"Running": 5, "Swimming": 4, "Yoga": 3}',
  'very-active',
  ARRAY['Classical', 'Jazz', 'Indie'],
  ARRAY['Drama', 'Documentary', 'Sci-Fi'],
  ARRAY['Photography', 'Cooking', 'Travel'],
  ARRAY['Coffee', 'Hiking', 'Museum visits'],
  'high',
  'deep-philosophical',
  ARRAY['Thursday 4PM', 'Saturday 10AM', 'Sunday 2PM'],
  'weekly',
  'single',
  ARRAY['friendship', 'professional-networking'],
  'Morning run, farmers market, cooking a new recipe',
  true,
  true,
  true
),
-- Neurologist in San Francisco
(
  gen_random_uuid(),
  'dr.michael.rodriguez@example.com',
  'Michael',
  'Rodriguez',
  'male',
  'San Francisco',
  ARRAY['Neurology'],
  'different-specialties',
  'attending-5-plus',
  '{"Cycling": 5, "Rock Climbing": 4, "Tennis": 3}',
  'active',
  ARRAY['Rock', 'Electronic', 'Blues'],
  ARRAY['Action', 'Thriller', 'Comedy'],
  ARRAY['Technology', 'Gaming', 'Wine tasting'],
  ARRAY['Sports events', 'Tech meetups', 'Wine tasting'],
  'moderate',
  'light-casual',
  ARRAY['Friday 6PM', 'Saturday 2PM', 'Sunday 11AM'],
  'bi-weekly',
  'married',
  ARRAY['professional-networking', 'hobbies'],
  'Cycling in the morning, tech meetup, dinner with friends',
  true,
  true,
  true
),
-- Pediatrician in San Francisco
(
  gen_random_uuid(),
  'dr.emily.johnson@example.com',
  'Emily',
  'Johnson',
  'female',
  'San Francisco',
  ARRAY['Pediatrics'],
  'no-preference',
  'resident-3-plus',
  '{"Dancing": 5, "Swimming": 4, "Pilates": 3}',
  'active',
  ARRAY['Pop', 'R&B', 'Folk'],
  ARRAY['Romance', 'Comedy', 'Animation'],
  ARRAY['Art', 'Volunteering', 'Reading'],
  ARRAY['Dancing', 'Art galleries', 'Volunteer work'],
  'very-high',
  'mixed',
  ARRAY['Thursday 7PM', 'Saturday 3PM', 'Sunday 1PM'],
  'weekly',
  'single',
  ARRAY['friendship', 'dating'],
  'Dance class, art gallery visit, volunteering at animal shelter',
  true,
  true,
  true
),
-- Emergency Medicine in San Francisco
(
  gen_random_uuid(),
  'dr.james.kim@example.com',
  'James',
  'Kim',
  'male',
  'San Francisco',
  ARRAY['Emergency Medicine'],
  'different-specialties',
  'fellow',
  '{"Martial Arts": 5, "Running": 4, "Weight Training": 3}',
  'very-active',
  ARRAY['Hip-Hop', 'Electronic', 'Rock'],
  ARRAY['Action', 'Horror', 'Sci-Fi'],
  ARRAY['Fitness', 'Gaming', 'Cooking'],
  ARRAY['Gym sessions', 'Gaming tournaments', 'Cooking classes'],
  'high',
  'light-casual',
  ARRAY['Friday 8PM', 'Saturday 12PM', 'Sunday 4PM'],
  'bi-weekly',
  'single',
  ARRAY['friendship', 'hobbies'],
  'Morning workout, gaming session, cooking a feast',
  true,
  true,
  true
),
-- Psychiatrist in San Francisco
(
  gen_random_uuid(),
  'dr.amanda.williams@example.com',
  'Amanda',
  'Williams',
  'female',
  'San Francisco',
  ARRAY['Psychiatry'],
  'same-specialty',
  'attending-0-5',
  '{"Yoga": 5, "Hiking": 4, "Meditation": 3}',
  'moderately-active',
  ARRAY['Classical', 'Ambient', 'Folk'],
  ARRAY['Drama', 'Documentary', 'Art House'],
  ARRAY['Meditation', 'Nature', 'Philosophy'],
  ARRAY['Meditation groups', 'Nature walks', 'Book clubs'],
  'moderate',
  'deep-philosophical',
  ARRAY['Thursday 6PM', 'Saturday 9AM', 'Sunday 3PM'],
  'monthly',
  'single',
  ARRAY['friendship', 'professional-networking'],
  'Morning meditation, nature hike, reading philosophy',
  true,
  true,
  true
),
-- General Surgeon in San Francisco
(
  gen_random_uuid(),
  'dr.robert.brown@example.com',
  'Robert',
  'Brown',
  'male',
  'San Francisco',
  ARRAY['Surgery (General)'],
  'different-specialties',
  'attending-5-plus',
  '{"Golf": 5, "Tennis": 4, "Swimming": 3}',
  'moderately-active',
  ARRAY['Classical', 'Jazz', 'Country'],
  ARRAY['Drama', 'Documentary', 'Comedy'],
  ARRAY['Golf', 'Fine dining', 'Travel'],
  ARRAY['Golf outings', 'Fine dining', 'Cultural events'],
  'moderate',
  'professional-focused',
  ARRAY['Friday 5PM', 'Saturday 8AM', 'Sunday 2PM'],
  'monthly',
  'married',
  ARRAY['professional-networking', 'hobbies'],
  'Early morning golf, fine dining, cultural event',
  true,
  true,
  true
);

-- ==============================================
-- SAMPLE MATCHES (for testing)
-- ==============================================

-- Create a sample match group
INSERT INTO matches (
  id,
  group_name,
  status,
  match_week,
  group_size,
  average_compatibility_score
) VALUES (
  gen_random_uuid(),
  'Rounds_Group_SF_001',
  'active',
  CURRENT_DATE - INTERVAL '1 week',
  3,
  0.75
) RETURNING id;

-- Add members to the sample match (you'll need to get actual user IDs)
-- This is just an example - replace with actual user IDs from the profiles above
/*
INSERT INTO match_members (match_id, user_id) VALUES 
((SELECT id FROM matches WHERE group_name = 'Rounds_Group_SF_001'), (SELECT id FROM profiles WHERE email = 'dr.sarah.chen@example.com')),
((SELECT id FROM matches WHERE group_name = 'Rounds_Group_SF_001'), (SELECT id FROM profiles WHERE email = 'dr.michael.rodriguez@example.com')),
((SELECT id FROM matches WHERE group_name = 'Rounds_Group_SF_001'), (SELECT id FROM profiles WHERE email = 'dr.emily.johnson@example.com'));
*/

-- ==============================================
-- SAMPLE CHAT MESSAGES
-- ==============================================

-- Add sample system message to the match
/*
INSERT INTO chat_messages (
  match_id,
  user_id,
  content,
  message_type
) VALUES (
  (SELECT id FROM matches WHERE group_name = 'Rounds_Group_SF_001'),
  NULL,
  '👋 Welcome to your Rounds group! Feel free to introduce yourselves — your shared interests made this match possible.',
  'system'
);
*/

-- ==============================================
-- SAMPLE NOTIFICATIONS
-- ==============================================

-- Add sample notifications for users
INSERT INTO notifications (
  user_id,
  type,
  title,
  message,
  action_url
) 
SELECT 
  id,
  'match_created',
  '🎉 You''ve been matched!',
  'Your Rounds group is live. Head to the chat to meet your fellow doctors!',
  '/matches'
FROM profiles 
WHERE email IN (
  'dr.sarah.chen@example.com',
  'dr.michael.rodriguez@example.com',
  'dr.emily.johnson@example.com'
);

-- ==============================================
-- SAMPLE VERIFICATION REQUESTS
-- ==============================================

-- Add sample verification requests
INSERT INTO verification_requests (
  user_id,
  license_number,
  license_state,
  license_image_url,
  photo_id_url,
  status
)
SELECT 
  id,
  'MD' || LPAD((RANDOM() * 999999)::INTEGER::TEXT, 6, '0'),
  'CA',
  'https://example.com/license/' || id::TEXT || '.jpg',
  'https://example.com/id/' || id::TEXT || '.jpg',
  'approved'
FROM profiles 
WHERE email IN (
  'dr.sarah.chen@example.com',
  'dr.michael.rodriguez@example.com',
  'dr.emily.johnson@example.com',
  'dr.james.kim@example.com',
  'dr.amanda.williams@example.com',
  'dr.robert.brown@example.com'
);

-- ==============================================
-- SAMPLE PAYMENT HISTORY
-- ==============================================

-- Add sample payment history
INSERT INTO payment_history (
  user_id,
  stripe_payment_intent_id,
  amount,
  currency,
  status,
  subscription_period_start,
  subscription_period_end
)
SELECT 
  id,
  'pi_' || SUBSTRING(MD5(RANDOM()::TEXT), 1, 24),
  2999, -- $29.99 in cents
  'usd',
  'succeeded',
  CURRENT_DATE - INTERVAL '1 month',
  CURRENT_DATE + INTERVAL '1 month'
FROM profiles 
WHERE email IN (
  'dr.sarah.chen@example.com',
  'dr.michael.rodriguez@example.com',
  'dr.emily.johnson@example.com',
  'dr.james.kim@example.com',
  'dr.amanda.williams@example.com',
  'dr.robert.brown@example.com'
);

-- ==============================================
-- SAMPLE MATCHING LOGS
-- ==============================================

-- Add sample matching logs
INSERT INTO matching_logs (
  week,
  groups_created,
  eligible_users,
  valid_pairs,
  rollover_users,
  reason,
  execution_time_ms
) VALUES 
(
  CURRENT_DATE - INTERVAL '1 week',
  2,
  6,
  15,
  0,
  'Weekly matching completed successfully',
  2500
),
(
  CURRENT_DATE - INTERVAL '2 weeks',
  1,
  4,
  6,
  1,
  'Weekly matching completed with rollover',
  1800
);

-- ==============================================
-- NOTES FOR DEVELOPMENT
-- ==============================================

-- 1. Replace the gen_random_uuid() calls with actual UUIDs from auth.users
-- 2. Update the sample data with real user information
-- 3. Adjust the sample data to match your testing needs
-- 4. Remove or modify this file for production deployment
-- 5. The sample data includes various medical specialties and interests for testing the matching algorithm
