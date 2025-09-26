-- ==============================================
-- BeyondRounds Comprehensive Test Data
-- 25 Authenticated & Subscribed Users with Matching & Messaging
-- ==============================================

-- Clear existing test data (optional)
-- DELETE FROM chat_messages WHERE match_id IN (SELECT id FROM matches WHERE group_name LIKE 'Test_%');
-- DELETE FROM match_members WHERE match_id IN (SELECT id FROM matches WHERE group_name LIKE 'Test_%');
-- DELETE FROM matches WHERE group_name LIKE 'Test_%';
-- DELETE FROM users WHERE email LIKE '%test.beyondrounds.com';

-- ==============================================
-- 1. CREATE 25 TEST USERS WITH COMPLETE PROFILES
-- ==============================================

INSERT INTO users (
  id, email, first_name, last_name, age, gender, city, nationality,
  medical_specialty, career_stage, activity_level,
  social_energy_level, conversation_style, meeting_frequency, life_stage,
  dietary_preferences, ideal_weekend,
  is_verified, onboarding_completed, profile_completion_percentage,
  created_at
) VALUES
-- Group 1: Riyadh Doctors (8 users)
('11111111-1111-1111-1111-111111111111', 'ahmed.hassan@test.beyondrounds.com', 'Ahmed', 'Hassan', 32, 'male', 'Riyadh', 'Saudi Arabia',
 'Cardiology', 'attending_0_5', 'very_active',
 'high', 'professional_focused', 'weekly', 'single',
 'Halal', 'Attending medical conferences and fitness activities',
 true, true, 95, NOW() - INTERVAL '2 months'),

('22222222-2222-2222-2222-222222222222', 'sara.alqahtani@test.beyondrounds.com', 'Sara', 'Al-Qahtani', 29, 'female', 'Riyadh', 'Saudi Arabia',
 'Dermatology', 'resident_3_plus', 'active',
 'moderate', 'mixed', 'bi_weekly', 'dating',
 'Vegetarian', 'Visiting art galleries and trying new restaurants',
 true, true, 92, NOW() - INTERVAL '1 month'),

('33333333-3333-3333-3333-333333333333', 'omar.mohammed@test.beyondrounds.com', 'Omar', 'Mohammed', 35, 'male', 'Riyadh', 'Saudi Arabia',
 'Orthopedics', 'attending_5_plus', 'very_active',
 'high', 'light_casual', 'weekly', 'married',
 'Halal', 'Playing football and video games with friends',
 true, true, 88, NOW() - INTERVAL '3 weeks'),

('44444444-4444-4444-4444-444444444444', 'fatima.alzahra@test.beyondrounds.com', 'Fatima', 'Al-Zahra', 31, 'female', 'Riyadh', 'Saudi Arabia',
 'Pediatrics', 'fellow', 'moderately_active',
 'moderate', 'deep_philosophical', 'monthly', 'parent',
 'Halal', 'Reading educational books and family time',
 true, true, 90, NOW() - INTERVAL '5 weeks'),

('55555555-5555-5555-5555-555555555555', 'khalid.alfarisi@test.beyondrounds.com', 'Khalid', 'Al-Farisi', 28, 'male', 'Riyadh', 'Saudi Arabia',
 'Emergency Medicine', 'resident_1_2', 'active',
 'very_high', 'mixed', 'flexible', 'single',
 'Halal', 'Extreme sports and music production',
 true, true, 85, NOW() - INTERVAL '1 week'),

('66666666-6666-6666-6666-666666666666', 'layla.ibrahim@test.beyondrounds.com', 'Layla', 'Ibrahim', 33, 'female', 'Riyadh', 'Saudi Arabia',
 'Psychiatry', 'attending_0_5', 'occasionally_active',
 'low', 'deep_philosophical', 'monthly', 'dating',
 'Vegan', 'Reading psychology books in quiet spaces',
 true, true, 93, NOW() - INTERVAL '6 weeks'),

('77777777-7777-7777-7777-777777777777', 'yusuf.alnasser@test.beyondrounds.com', 'Yusuf', 'Al-Nasser', 30, 'male', 'Riyadh', 'Saudi Arabia',
 'Radiology', 'fellow', 'active',
 'moderate', 'professional_focused', 'bi_weekly', 'married',
 'Halal', 'Photography and exploring medical AI applications',
 true, true, 87, NOW() - INTERVAL '4 weeks'),

('88888888-8888-8888-8888-888888888888', 'maryam.alkhalil@test.beyondrounds.com', 'Maryam', 'Al-Khalil', 27, 'female', 'Riyadh', 'Saudi Arabia',
 'Obstetrics and Gynecology', 'resident_3_plus', 'very_active',
 'high', 'light_casual', 'weekly', 'single',
 'Halal', 'Group fitness classes and trying new recipes',
 true, true, 91, NOW() - INTERVAL '2 weeks'),

-- Group 2: Jeddah Doctors (8 users)
('99999999-9999-9999-9999-999999999999', 'hassan.alghamdi@test.beyondrounds.com', 'Hassan', 'Al-Ghamdi', 34, 'male', 'Jeddah', 'Saudi Arabia',
 'Neurology', 'attending_0_5', 'moderately_active',
 'moderate', 'deep_philosophical', 'bi_weekly', 'married',
 'Halal', 'Playing chess and discussing neuroscience breakthroughs',
 true, true, 94, NOW() - INTERVAL '7 weeks'),

('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'nora.alsaeed@test.beyondrounds.com', 'Nora', 'Al-Saeed', 26, 'female', 'Jeddah', 'Saudi Arabia',
 'Family Medicine', 'resident_1_2', 'active',
 'high', 'mixed', 'weekly', 'single',
 'Halal', 'Volunteering at community health clinics and weekend hikes',
 true, true, 89, NOW() - INTERVAL '3 weeks'),

('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'mohammed.alharbi@test.beyondrounds.com', 'Mohammed', 'Al-Harbi', 31, 'male', 'Jeddah', 'Saudi Arabia',
 'Gastroenterology', 'fellow', 'occasionally_active',
 'low', 'professional_focused', 'monthly', 'dating',
 'Halal', 'Exploring international cuisines and learning new languages',
 true, true, 86, NOW() - INTERVAL '5 weeks'),

('cccccccc-cccc-cccc-cccc-cccccccccccc', 'aisha.almutairi@test.beyondrounds.com', 'Aisha', 'Al-Mutairi', 29, 'female', 'Jeddah', 'Saudi Arabia',
 'Anesthesiology', 'resident_3_plus', 'active',
 'moderate', 'light_casual', 'bi_weekly', 'single',
 'Halal', 'Morning yoga sessions and mindfulness practices',
 true, true, 88, NOW() - INTERVAL '1 month'),

('dddddddd-dddd-dddd-dddd-dddddddddddd', 'abdulrahman.alotaibi@test.beyondrounds.com', 'Abdul Rahman', 'Al-Otaibi', 36, 'male', 'Jeddah', 'Saudi Arabia',
 'Urology', 'attending_5_plus', 'very_active',
 'high', 'mixed', 'weekly', 'parent',
 'Halal', 'Family cycling trips and swimming competitions',
 true, true, 92, NOW() - INTERVAL '2 months'),

('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'hala.alshehri@test.beyondrounds.com', 'Hala', 'Al-Shehri', 28, 'female', 'Jeddah', 'Saudi Arabia',
 'Ophthalmology', 'fellow', 'moderately_active',
 'moderate', 'professional_focused', 'flexible', 'dating',
 'Halal', 'Creating detailed artwork and vision research projects',
 true, true, 90, NOW() - INTERVAL '6 weeks'),

('ffffffff-ffff-ffff-ffff-ffffffffffff', 'tariq.alzahrani@test.beyondrounds.com', 'Tariq', 'Al-Zahrani', 32, 'male', 'Jeddah', 'Saudi Arabia',
 'Pulmonology', 'attending_0_5', 'active',
 'high', 'deep_philosophical', 'bi_weekly', 'married',
 'Halal', 'Scuba diving and researching marine impact on respiratory health',
 true, true, 93, NOW() - INTERVAL '4 weeks'),

('gggggggg-gggg-gggg-gggg-gggggggggggg', 'reem.albassam@test.beyondrounds.com', 'Reem', 'Al-Bassam', 30, 'female', 'Jeddah', 'Saudi Arabia',
 'Endocrinology', 'fellow', 'occasionally_active',
 'low', 'mixed', 'monthly', 'single',
 'Vegan', 'Organic gardening and promoting sustainable health practices',
 true, true, 87, NOW() - INTERVAL '1 week'),

-- Group 3: Dammam Doctors (9 users)
('hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'ali.alqasimi@test.beyondrounds.com', 'Ali', 'Al-Qasimi', 33, 'male', 'Dammam', 'Saudi Arabia',
 'Oncology', 'attending_0_5', 'moderately_active',
 'moderate', 'deep_philosophical', 'monthly', 'married',
 'Halal', 'Cancer research and philosophical discussions about life',
 true, true, 95, NOW() - INTERVAL '8 weeks'),

('iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', 'zahra.aljabri@test.beyondrounds.com', 'Zahra', 'Al-Jabri', 27, 'female', 'Dammam', 'Saudi Arabia',
 'Infectious Diseases', 'resident_3_plus', 'active',
 'high', 'professional_focused', 'weekly', 'single',
 'Halal', 'Studying global disease patterns and cultural health practices',
 true, true, 91, NOW() - INTERVAL '2 weeks'),

('jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj', 'fahad.aldosari@test.beyondrounds.com', 'Fahad', 'Al-Dosari', 35, 'male', 'Dammam', 'Saudi Arabia',
 'Plastic Surgery', 'attending_5_plus', 'very_active',
 'high', 'light_casual', 'bi_weekly', 'dating',
 'Halal', 'Attending fashion events and creating artistic reconstructive solutions',
 true, true, 89, NOW() - INTERVAL '3 weeks'),

('kkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk', 'lina.alkhobar@test.beyondrounds.com', 'Lina', 'Al-Khobar', 29, 'female', 'Dammam', 'Saudi Arabia',
 'Rheumatology', 'fellow', 'moderately_active',
 'moderate', 'mixed', 'flexible', 'single',
 'Halal', 'Swimming for joint health and discussing medical literature',
 true, true, 88, NOW() - INTERVAL '5 weeks'),

('llllllll-llll-llll-llll-llllllllllll', 'saud.alrajhi@test.beyondrounds.com', 'Saud', 'Al-Rajhi', 31, 'male', 'Dammam', 'Saudi Arabia',
 'Pathology', 'fellow', 'occasionally_active',
 'low', 'professional_focused', 'monthly', 'married',
 'Halal', 'Macro photography and precision instrument collection',
 true, true, 86, NOW() - INTERVAL '1 month'),

('mmmmmmmm-mmmm-mmmm-mmmm-mmmmmmmmmmmm', 'amina.alsharif@test.beyondrounds.com', 'Amina', 'Al-Sharif', 26, 'female', 'Dammam', 'Saudi Arabia',
 'General Surgery', 'resident_1_2', 'very_active',
 'very_high', 'mixed', 'weekly', 'single',
 'Halal', 'Martial arts training and emergency response team activities',
 true, true, 92, NOW() - INTERVAL '1 week'),

('nnnnnnnn-nnnn-nnnn-nnnn-nnnnnnnnnnnn', 'waleed.alhamad@test.beyondrounds.com', 'Waleed', 'Al-Hamad', 34, 'male', 'Dammam', 'Saudi Arabia',
 'Nephrology', 'attending_0_5', 'active',
 'moderate', 'deep_philosophical', 'bi_weekly', 'parent',
 'Halal', 'Water conservation projects and environmental education with family',
 true, true, 90, NOW() - INTERVAL '6 weeks'),

('oooooooo-oooo-oooo-oooo-oooooooooooo', 'dina.almalik@test.beyondrounds.com', 'Dina', 'Al-Malik', 28, 'female', 'Dammam', 'Saudi Arabia',
 'Dermatology', 'resident_3_plus', 'active',
 'high', 'light_casual', 'weekly', 'dating',
 'Halal', 'Skincare education workshops and beauty industry networking',
 true, true, 87, NOW() - INTERVAL '4 weeks'),

('pppppppp-pppp-pppp-pppp-pppppppppppp', 'ibrahim.alsaif@test.beyondrounds.com', 'Ibrahim', 'Al-Saif', 30, 'male', 'Dammam', 'Saudi Arabia',
 'Sports Medicine', 'fellow', 'very_active',
 'very_high', 'mixed', 'flexible', 'single',
 'Halal', 'Training with professional athletes and optimizing sports performance',
 true, true, 94, NOW() - INTERVAL '2 weeks');

-- ==============================================
-- 2. CREATE USER SPECIALTIES (Normalized)
-- ==============================================

INSERT INTO user_specialties (
  id, user_id, specialty, is_primary, years_experience, created_at
) VALUES
-- Primary specialties for all users
('spec-001', '11111111-1111-1111-1111-111111111111', 'Cardiology', true, 5, NOW() - INTERVAL '2 months'),
('spec-002', '22222222-2222-2222-2222-222222222222', 'Dermatology', true, 3, NOW() - INTERVAL '1 month'),
('spec-003', '33333333-3333-3333-3333-333333333333', 'Orthopedics', true, 8, NOW() - INTERVAL '3 weeks'),
('spec-004', '44444444-4444-4444-4444-444444444444', 'Pediatrics', true, 2, NOW() - INTERVAL '5 weeks'),
('spec-005', '55555555-5555-5555-5555-555555555555', 'Emergency Medicine', true, 1, NOW() - INTERVAL '1 week'),
('spec-006', '66666666-6666-6666-6666-666666666666', 'Psychiatry', true, 4, NOW() - INTERVAL '6 weeks'),
('spec-007', '77777777-7777-7777-7777-777777777777', 'Radiology', true, 2, NOW() - INTERVAL '4 weeks'),
('spec-008', '88888888-8888-8888-8888-888888888888', 'Obstetrics and Gynecology', true, 3, NOW() - INTERVAL '2 weeks'),
('spec-009', '99999999-9999-9999-9999-999999999999', 'Neurology', true, 5, NOW() - INTERVAL '7 weeks'),
('spec-010', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Family Medicine', true, 1, NOW() - INTERVAL '3 weeks'),
('spec-011', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Gastroenterology', true, 2, NOW() - INTERVAL '5 weeks'),
('spec-012', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Anesthesiology', true, 3, NOW() - INTERVAL '1 month'),
('spec-013', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Urology', true, 8, NOW() - INTERVAL '2 months'),
('spec-014', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Ophthalmology', true, 2, NOW() - INTERVAL '6 weeks'),
('spec-015', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'Pulmonology', true, 5, NOW() - INTERVAL '4 weeks'),
('spec-016', 'gggggggg-gggg-gggg-gggg-gggggggggggg', 'Endocrinology', true, 2, NOW() - INTERVAL '1 week'),
('spec-017', 'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'Oncology', true, 5, NOW() - INTERVAL '8 weeks'),
('spec-018', 'iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', 'Infectious Diseases', true, 3, NOW() - INTERVAL '2 weeks'),
('spec-019', 'jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj', 'Plastic Surgery', true, 8, NOW() - INTERVAL '3 weeks'),
('spec-020', 'kkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk', 'Rheumatology', true, 2, NOW() - INTERVAL '5 weeks'),
('spec-021', 'llllllll-llll-llll-llll-llllllllllll', 'Pathology', true, 2, NOW() - INTERVAL '1 month'),
('spec-022', 'mmmmmmmm-mmmm-mmmm-mmmm-mmmmmmmmmmmm', 'General Surgery', true, 1, NOW() - INTERVAL '1 week'),
('spec-023', 'nnnnnnnn-nnnn-nnnn-nnnn-nnnnnnnnnnnn', 'Nephrology', true, 5, NOW() - INTERVAL '6 weeks'),
('spec-024', 'oooooooo-oooo-oooo-oooo-oooooooooooo', 'Dermatology', true, 3, NOW() - INTERVAL '4 weeks'),
('spec-025', 'pppppppp-pppp-pppp-pppp-pppppppppppp', 'Sports Medicine', true, 2, NOW() - INTERVAL '2 weeks');

-- ==============================================
-- 3. CREATE USER INTERESTS (Normalized)
-- ==============================================

INSERT INTO user_interests (
  id, user_id, interest_type, interest_value, priority, created_at
) VALUES
-- Ahmed Hassan - Cardiology
('int-001', '11111111-1111-1111-1111-111111111111', 'music_genre', 'Classical', 4, NOW() - INTERVAL '2 months'),
('int-002', '11111111-1111-1111-1111-111111111111', 'music_genre', 'Jazz', 3, NOW() - INTERVAL '2 months'),
('int-003', '11111111-1111-1111-1111-111111111111', 'movie_genre', 'Drama', 4, NOW() - INTERVAL '2 months'),
('int-004', '11111111-1111-1111-1111-111111111111', 'movie_genre', 'Documentary', 5, NOW() - INTERVAL '2 months'),
('int-005', '11111111-1111-1111-1111-111111111111', 'hobby', 'Research', 5, NOW() - INTERVAL '2 months'),
('int-006', '11111111-1111-1111-1111-111111111111', 'hobby', 'Technology', 4, NOW() - INTERVAL '2 months'),
('int-007', '11111111-1111-1111-1111-111111111111', 'sport', 'Fitness', 4, NOW() - INTERVAL '2 months'),

-- Sara Al-Qahtani - Dermatology
('int-008', '22222222-2222-2222-2222-222222222222', 'music_genre', 'Pop', 4, NOW() - INTERVAL '1 month'),
('int-009', '22222222-2222-2222-2222-222222222222', 'music_genre', 'Classical', 3, NOW() - INTERVAL '1 month'),
('int-010', '22222222-2222-2222-2222-222222222222', 'movie_genre', 'Comedy', 4, NOW() - INTERVAL '1 month'),
('int-011', '22222222-2222-2222-2222-222222222222', 'movie_genre', 'Romance', 3, NOW() - INTERVAL '1 month'),
('int-012', '22222222-2222-2222-2222-222222222222', 'hobby', 'Art', 5, NOW() - INTERVAL '1 month'),
('int-013', '22222222-2222-2222-2222-222222222222', 'hobby', 'Travel', 4, NOW() - INTERVAL '1 month'),
('int-014', '22222222-2222-2222-2222-222222222222', 'hobby', 'Photography', 4, NOW() - INTERVAL '1 month'),

-- Omar Mohammed - Orthopedics
('int-015', '33333333-3333-3333-3333-333333333333', 'music_genre', 'Rock', 4, NOW() - INTERVAL '3 weeks'),
('int-016', '33333333-3333-3333-3333-333333333333', 'music_genre', 'Electronic', 3, NOW() - INTERVAL '3 weeks'),
('int-017', '33333333-3333-3333-3333-333333333333', 'movie_genre', 'Action', 4, NOW() - INTERVAL '3 weeks'),
('int-018', '33333333-3333-3333-3333-333333333333', 'movie_genre', 'Thriller', 3, NOW() - INTERVAL '3 weeks'),
('int-019', '33333333-3333-3333-3333-333333333333', 'sport', 'Football', 5, NOW() - INTERVAL '3 weeks'),
('int-020', '33333333-3333-3333-3333-333333333333', 'hobby', 'Gaming', 4, NOW() - INTERVAL '3 weeks'),
('int-021', '33333333-3333-3333-3333-333333333333', 'hobby', 'Technology', 3, NOW() - INTERVAL '3 weeks'),

-- Add more interests for other users (abbreviated for space)
('int-022', '44444444-4444-4444-4444-444444444444', 'music_genre', 'Classical', 4, NOW() - INTERVAL '5 weeks'),
('int-023', '44444444-4444-4444-4444-444444444444', 'hobby', 'Reading', 5, NOW() - INTERVAL '5 weeks'),
('int-024', '44444444-4444-4444-4444-444444444444', 'hobby', 'Education', 5, NOW() - INTERVAL '5 weeks'),
('int-025', '55555555-5555-5555-5555-555555555555', 'music_genre', 'Hip Hop', 4, NOW() - INTERVAL '1 week'),
('int-026', '55555555-5555-5555-5555-555555555555', 'sport', 'Adventure Sports', 5, NOW() - INTERVAL '1 week'),
('int-027', '55555555-5555-5555-5555-555555555555', 'hobby', 'Music Production', 4, NOW() - INTERVAL '1 week');

-- ==============================================
-- 4. CREATE USER PREFERENCES
-- ==============================================
INSERT INTO user_preferences (
  id, user_id, gender_preference, email_notifications, push_notifications, 
  weekly_match_reminders, marketing_emails, privacy_level
) VALUES
('pref-1111', '11111111-1111-1111-1111-111111111111', 'no_preference', true, true, true, false, 'standard'),
('pref-2222', '22222222-2222-2222-2222-222222222222', 'mixed_preferred', true, true, true, true, 'detailed'),
('pref-3333', '33333333-3333-3333-3333-333333333333', 'no_preference', true, false, true, false, 'minimal'),
('pref-4444', '44444444-4444-4444-4444-444444444444', 'same_gender_preferred', true, true, false, false, 'standard'),
('pref-5555', '55555555-5555-5555-5555-555555555555', 'no_preference', false, true, true, true, 'detailed'),
('pref-6666', '66666666-6666-6666-6666-666666666666', 'same_gender_only', true, true, true, false, 'standard'),
('pref-7777', '77777777-7777-7777-7777-777777777777', 'no_preference', true, true, true, false, 'detailed'),
('pref-8888', '88888888-8888-8888-8888-888888888888', 'mixed_preferred', true, true, true, true, 'standard'),
('pref-9999', '99999999-9999-9999-9999-999999999999', 'no_preference', true, false, true, false, 'standard'),
('pref-aaaa', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'mixed_preferred', true, true, true, false, 'detailed'),
('pref-bbbb', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'no_preference', true, true, false, false, 'minimal'),
('pref-cccc', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'same_gender_preferred', true, true, true, false, 'standard'),
('pref-dddd', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'no_preference', true, true, true, true, 'standard'),
('pref-eeee', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'mixed_preferred', true, true, true, false, 'detailed'),
('pref-ffff', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'no_preference', true, false, true, false, 'standard'),
('pref-gggg', 'gggggggg-gggg-gggg-gggg-gggggggggggg', 'same_gender_only', true, true, true, false, 'minimal'),
('pref-hhhh', 'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'no_preference', true, true, false, false, 'standard'),
('pref-iiii', 'iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', 'mixed_preferred', true, true, true, true, 'detailed'),
('pref-jjjj', 'jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj', 'no_preference', true, true, true, false, 'standard'),
('pref-kkkk', 'kkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk', 'same_gender_preferred', true, true, true, false, 'standard'),
('pref-llll', 'llllllll-llll-llll-llll-llllllllllll', 'no_preference', true, false, true, false, 'minimal'),
('pref-mmmm', 'mmmmmmmm-mmmm-mmmm-mmmm-mmmmmmmmmmmm', 'mixed_preferred', false, true, true, true, 'detailed'),
('pref-nnnn', 'nnnnnnnn-nnnn-nnnn-nnnn-nnnnnnnnnnnn', 'no_preference', true, true, true, false, 'standard'),
('pref-oooo', 'oooooooo-oooo-oooo-oooo-oooooooooooo', 'same_gender_preferred', true, true, true, true, 'standard'),
('pref-pppp', 'pppppppp-pppp-pppp-pppp-pppppppppppp', 'no_preference', true, true, true, false, 'detailed');

-- ==============================================
-- 5. CREATE SAMPLE MATCHES (8 GROUPS)
-- ==============================================

INSERT INTO matches (
  id, group_name, status, match_week, group_size, 
  average_compatibility_score, created_at
) VALUES
-- Week 1 Matches (4 groups)
('match-001', 'Test_Riyadh_Cardio_Group', 'active', CURRENT_DATE - INTERVAL '1 week', 3, 0.78, NOW() - INTERVAL '1 week'),
('match-002', 'Test_Jeddah_Research_Group', 'active', CURRENT_DATE - INTERVAL '1 week', 4, 0.82, NOW() - INTERVAL '1 week'),
('match-003', 'Test_Dammam_Active_Group', 'active', CURRENT_DATE - INTERVAL '1 week', 3, 0.75, NOW() - INTERVAL '1 week'),
('match-004', 'Test_Mixed_Wellness_Group', 'completed', CURRENT_DATE - INTERVAL '1 week', 4, 0.71, NOW() - INTERVAL '1 week'),

-- Week 2 Matches (4 groups)
('match-005', 'Test_Riyadh_Social_Group', 'active', CURRENT_DATE, 3, 0.85, NOW()),
('match-006', 'Test_Jeddah_Creative_Group', 'active', CURRENT_DATE, 4, 0.79, NOW()),
('match-007', 'Test_Dammam_Professional_Group', 'active', CURRENT_DATE, 3, 0.73, NOW()),
('match-008', 'Test_Cross_City_Specialty_Group', 'active', CURRENT_DATE, 4, 0.77, NOW());

-- ==============================================
-- 4. CREATE MATCH MEMBERS
-- ==============================================

INSERT INTO match_members (
  id, match_id, user_id, joined_at, is_active
) VALUES
-- Match 1: Riyadh Cardio Group (Ahmed, Sara, Omar)
('member-001', 'match-001', '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '1 week', true),
('member-002', 'match-001', '22222222-2222-2222-2222-222222222222', NOW() - INTERVAL '1 week', true),
('member-003', 'match-001', '33333333-3333-3333-3333-333333333333', NOW() - INTERVAL '1 week', true),

-- Match 2: Jeddah Research Group (Hassan, Nora, Mohammed, Aisha)
('member-004', 'match-002', '99999999-9999-9999-9999-999999999999', NOW() - INTERVAL '1 week', true),
('member-005', 'match-002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', NOW() - INTERVAL '1 week', true),
('member-006', 'match-002', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', NOW() - INTERVAL '1 week', true),
('member-007', 'match-002', 'cccccccc-cccc-cccc-cccc-cccccccccccc', NOW() - INTERVAL '1 week', true),

-- Match 3: Dammam Active Group (Ali, Zahra, Fahad)
('member-008', 'match-003', 'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', NOW() - INTERVAL '1 week', true),
('member-009', 'match-003', 'iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', NOW() - INTERVAL '1 week', true),
('member-010', 'match-003', 'jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj', NOW() - INTERVAL '1 week', true),

-- Match 4: Mixed Wellness Group (Fatima, Khalid, Layla, Yusuf)
('member-011', 'match-004', '44444444-4444-4444-4444-444444444444', NOW() - INTERVAL '1 week', false),
('member-012', 'match-004', '55555555-5555-5555-5555-555555555555', NOW() - INTERVAL '1 week', false),
('member-013', 'match-004', '66666666-6666-6666-6666-666666666666', NOW() - INTERVAL '1 week', false),
('member-014', 'match-004', '77777777-7777-7777-7777-777777777777', NOW() - INTERVAL '1 week', false),

-- Match 5: Current Week - Riyadh Social Group (Maryam, Khalid, Sara)
('member-015', 'match-005', '88888888-8888-8888-8888-888888888888', NOW(), true),
('member-016', 'match-005', '55555555-5555-5555-5555-555555555555', NOW(), true),
('member-017', 'match-005', '22222222-2222-2222-2222-222222222222', NOW(), true),

-- Match 6: Current Week - Jeddah Creative Group (Abdul Rahman, Hala, Tariq, Reem)
('member-018', 'match-006', 'dddddddd-dddd-dddd-dddd-dddddddddddd', NOW(), true),
('member-019', 'match-006', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', NOW(), true),
('member-020', 'match-006', 'ffffffff-ffff-ffff-ffff-ffffffffffff', NOW(), true),
('member-021', 'match-006', 'gggggggg-gggg-gggg-gggg-gggggggggggg', NOW(), true),

-- Match 7: Current Week - Dammam Professional Group (Lina, Saud, Waleed)
('member-022', 'match-007', 'kkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk', NOW(), true),
('member-023', 'match-007', 'llllllll-llll-llll-llll-llllllllllll', NOW(), true),
('member-024', 'match-007', 'nnnnnnnn-nnnn-nnnn-nnnn-nnnnnnnnnnnn', NOW(), true),

-- Match 8: Current Week - Cross City Specialty Group (Amina, Dina, Ibrahim, Ahmed)
('member-025', 'match-008', 'mmmmmmmm-mmmm-mmmm-mmmm-mmmmmmmmmmmm', NOW(), true),
('member-026', 'match-008', 'oooooooo-oooo-oooo-oooo-oooooooooooo', NOW(), true),
('member-027', 'match-008', 'pppppppp-pppp-pppp-pppp-pppppppppppp', NOW(), true),
('member-028', 'match-008', '11111111-1111-1111-1111-111111111111', NOW(), true);

-- ==============================================
-- 5. CREATE CHAT MESSAGES (REALISTIC CONVERSATIONS)
-- ==============================================

INSERT INTO chat_messages (
  id, match_id, user_id, content, message_type, created_at
) VALUES
-- Match 1 Conversation: Riyadh Cardio Group
('msg-001', 'match-001', NULL, '👋 Welcome to your Rounds group! Feel free to introduce yourselves — your shared interests made this match possible.', 'system', NOW() - INTERVAL '1 week'),
('msg-002', 'match-001', '11111111-1111-1111-1111-111111111111', 'Hi everyone! Ahmed here, cardiology attending. Excited to meet fellow doctors in Riyadh!', 'user', NOW() - INTERVAL '1 week' + INTERVAL '5 minutes'),
('msg-003', 'match-001', '22222222-2222-2222-2222-222222222222', 'Hello! Sara, dermatology resident. Love that we all share an interest in medical technology!', 'user', NOW() - INTERVAL '1 week' + INTERVAL '12 minutes'),
('msg-004', 'match-001', '33333333-3333-3333-3333-333333333333', 'Omar here, orthopedics. Anyone up for a football match this weekend? 😄', 'user', NOW() - INTERVAL '1 week' + INTERVAL '20 minutes'),
('msg-005', 'match-001', '11111111-1111-1111-1111-111111111111', 'That sounds great Omar! I could use some exercise after long hospital shifts', 'user', NOW() - INTERVAL '1 week' + INTERVAL '25 minutes'),
('msg-006', 'match-001', '22222222-2222-2222-2222-222222222222', 'Count me in! Though I should warn you, my sports skills are better suited for precision work 😅', 'user', NOW() - INTERVAL '1 week' + INTERVAL '30 minutes'),

-- Match 2 Conversation: Jeddah Research Group
('msg-007', 'match-002', NULL, '👋 Welcome to your Rounds group! Feel free to introduce yourselves — your shared interests made this match possible.', 'system', NOW() - INTERVAL '1 week'),
('msg-008', 'match-002', '99999999-9999-9999-9999-999999999999', 'Greetings colleagues! Hassan, neurology. Fascinated by our shared interest in research and philosophy.', 'user', NOW() - INTERVAL '1 week' + INTERVAL '3 minutes'),
('msg-009', 'match-002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Hi Hassan! Nora from family medicine. I love the interdisciplinary potential here!', 'user', NOW() - INTERVAL '1 week' + INTERVAL '8 minutes'),
('msg-010', 'match-002', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Mohammed, gastroenterology fellow. Anyone interested in discussing the intersection of medicine and cultural practices?', 'user', NOW() - INTERVAL '1 week' + INTERVAL '15 minutes'),
('msg-011', 'match-002', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Aisha here, anesthesiology. That sounds fascinating Mohammed! I practice mindfulness which bridges both worlds.', 'user', NOW() - INTERVAL '1 week' + INTERVAL '22 minutes'),

-- Match 5 Conversation: Current Week - Riyadh Social Group
('msg-012', 'match-005', NULL, '👋 Welcome to your Rounds group! Feel free to introduce yourselves — your shared interests made this match possible.', 'system', NOW() - INTERVAL '2 hours'),
('msg-013', 'match-005', '88888888-8888-8888-8888-888888888888', 'Hey everyone! Maryam, OB/GYN resident. So excited for this group!', 'user', NOW() - INTERVAL '1 hour 45 minutes'),
('msg-014', 'match-005', '55555555-5555-5555-5555-555555555555', 'Khalid here, emergency medicine. Love the high-energy vibe already! 🚀', 'user', NOW() - INTERVAL '1 hour 30 minutes'),
('msg-015', 'match-005', '22222222-2222-2222-2222-222222222222', 'Sara again! Happy to be in another group. Should we plan a fitness class together?', 'user', NOW() - INTERVAL '1 hour 15 minutes'),
('msg-016', 'match-005', '88888888-8888-8888-8888-888888888888', 'Yes! I know a great studio that offers group classes. When works for everyone?', 'user', NOW() - INTERVAL '1 hour'),
('msg-017', 'match-005', '55555555-5555-5555-5555-555555555555', 'I am flexible with timing! Adventure sports or high-intensity workouts preferred 💪', 'user', NOW() - INTERVAL '45 minutes'),

-- Match 6 Conversation: Current Week - Jeddah Creative Group
('msg-018', 'match-006', NULL, '👋 Welcome to your Rounds group! Feel free to introduce yourselves — your shared interests made this match possible.', 'system', NOW() - INTERVAL '3 hours'),
('msg-019', 'match-006', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Abdul Rahman, urology. Excited to meet fellow creatives in medicine!', 'user', NOW() - INTERVAL '2 hours 45 minutes'),
('msg-020', 'match-006', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Hala, ophthalmology. I love that we all appreciate precision and artistry!', 'user', NOW() - INTERVAL '2 hours 30 minutes'),
('msg-021', 'match-006', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'Tariq here, pulmonology. Anyone interested in underwater photography? I combine diving with research!', 'user', NOW() - INTERVAL '2 hours 15 minutes'),
('msg-022', 'match-006', 'gggggggg-gggg-gggg-gggg-gggggggggggg', 'Reem, endocrinology. That sounds amazing Tariq! I do macro photography of plants 🌱', 'user', NOW() - INTERVAL '2 hours'),
('msg-023', 'match-006', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'We should organize a photography walk! I can bring my cycling gear for mobile shots', 'user', NOW() - INTERVAL '1 hour 45 minutes'),

-- Match 7 Conversation: Current Week - Dammam Professional Group
('msg-024', 'match-007', NULL, '👋 Welcome to your Rounds group! Feel free to introduce yourselves — your shared interests made this match possible.', 'system', NOW() - INTERVAL '4 hours'),
('msg-025', 'match-007', 'kkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk', 'Hi all! Lina, rheumatology fellow. Looking forward to our professional discussions!', 'user', NOW() - INTERVAL '3 hours 45 minutes'),
('msg-026', 'match-007', 'llllllll-llll-llll-llll-llllllllllll', 'Saud, pathology. Appreciate the focus on precision and detailed analysis in our fields!', 'user', NOW() - INTERVAL '3 hours 30 minutes'),
('msg-027', 'match-007', 'nnnnnnnn-nnnn-nnnn-nnnn-nnnnnnnnnnnn', 'Waleed, nephrology. Excited to discuss the intersection of our specialties and environmental health!', 'user', NOW() - INTERVAL '3 hours 15 minutes'),
('msg-028', 'match-007', 'kkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk', 'That is fascinating Waleed! My research on autoimmune conditions often touches on environmental factors', 'user', NOW() - INTERVAL '3 hours'),

-- Match 8 Conversation: Current Week - Cross City Specialty Group
('msg-029', 'match-008', NULL, '👋 Welcome to your Rounds group! Feel free to introduce yourselves — your shared interests made this match possible.', 'system', NOW() - INTERVAL '1 hour'),
('msg-030', 'match-008', 'mmmmmmmm-mmmm-mmmm-mmmm-mmmmmmmmmmmm', 'Amina here, general surgery resident from Dammam. Ready for high-energy collaboration! 🔥', 'user', NOW() - INTERVAL '50 minutes'),
('msg-031', 'match-008', 'oooooooo-oooo-oooo-oooo-oooooooooooo', 'Dina, dermatology from Dammam. Love the diverse group we have here!', 'user', NOW() - INTERVAL '45 minutes'),
('msg-032', 'match-008', 'pppppppp-pppp-pppp-pppp-pppppppppppp', 'Ibrahim, sports medicine, also Dammam. Excited to share performance optimization techniques!', 'user', NOW() - INTERVAL '40 minutes'),
('msg-033', 'match-008', '11111111-1111-1111-1111-111111111111', 'Ahmed from Riyadh, cardiology. Great to connect across cities! Anyone interested in fitness research?', 'user', NOW() - INTERVAL '35 minutes'),
('msg-034', 'match-008', 'pppppppp-pppp-pppp-pppp-pppppppppppp', 'Absolutely Ahmed! I work with athletes daily. We should discuss cardiac performance optimization!', 'user', NOW() - INTERVAL '30 minutes');

-- ==============================================
-- 6. CREATE NOTIFICATIONS
-- ==============================================

INSERT INTO notifications (
  id, user_id, type, title, message, is_read, created_at
) VALUES
-- Match notifications for current week groups
('notif-001', '88888888-8888-8888-8888-888888888888', 'match_created', '🎉 You have been matched!', 'Your new Rounds group "Test_Riyadh_Social_Group" is ready! Meet your fellow doctors and start connecting.', false, NOW() - INTERVAL '2 hours'),
('notif-002', '55555555-5555-5555-5555-555555555555', 'match_created', '🎉 You have been matched!', 'Your new Rounds group "Test_Riyadh_Social_Group" is ready! Meet your fellow doctors and start connecting.', true, NOW() - INTERVAL '2 hours'),
('notif-003', '22222222-2222-2222-2222-222222222222', 'match_created', '🎉 You have been matched!', 'Your new Rounds group "Test_Riyadh_Social_Group" is ready! Meet your fellow doctors and start connecting.', true, NOW() - INTERVAL '2 hours'),

-- Message notifications
('notif-004', '11111111-1111-1111-1111-111111111111', 'message_received', '💬 New message in your group', 'Omar sent a message in Test_Riyadh_Cardio_Group', true, NOW() - INTERVAL '1 week' + INTERVAL '21 minutes'),
('notif-005', '22222222-2222-2222-2222-222222222222', 'message_received', '💬 New message in your group', 'Omar sent a message in Test_Riyadh_Cardio_Group', true, NOW() - INTERVAL '1 week' + INTERVAL '21 minutes'),
('notif-006', '99999999-9999-9999-9999-999999999999', 'message_received', '💬 New message in your group', 'Aisha sent a message in Test_Jeddah_Research_Group', false, NOW() - INTERVAL '1 week' + INTERVAL '23 minutes'),

-- Verification approved notifications
('notif-007', '55555555-5555-5555-5555-555555555555', 'verification_approved', '✅ Verification Complete', 'Your medical license has been verified! You can now participate in weekly matching.', true, NOW() - INTERVAL '2 weeks'),
('notif-008', 'mmmmmmmm-mmmm-mmmm-mmmm-mmmmmmmmmmmm', 'verification_approved', '✅ Verification Complete', 'Your medical license has been verified! You can now participate in weekly matching.', true, NOW() - INTERVAL '1 week'),

-- Payment reminders
('notif-009', '66666666-6666-6666-6666-666666666666', 'payment_reminder', '💳 Subscription Renewal', 'Your BeyondRounds subscription will renew in 3 days. Manage your subscription in settings.', false, NOW() - INTERVAL '1 day'),
('notif-010', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'payment_reminder', '💳 Subscription Renewal', 'Your BeyondRounds subscription will renew in 3 days. Manage your subscription in settings.', false, NOW() - INTERVAL '1 day');

-- ==============================================
-- 7. CREATE MATCHING LOGS
-- ==============================================

INSERT INTO matching_logs (
  id, week, groups_created, eligible_users, valid_pairs, 
  rollover_users, reason, execution_time_ms, created_at
) VALUES
('log-001', CURRENT_DATE - INTERVAL '1 week', 4, 25, 42, 5, 'Weekly matching completed successfully', 1250, NOW() - INTERVAL '1 week'),
('log-002', CURRENT_DATE, 4, 25, 38, 1, 'Weekly matching completed successfully', 1180, NOW() - INTERVAL '2 hours');

-- ==============================================
-- 8. CREATE VERIFICATION REQUESTS (COMPLETED)
-- ==============================================

INSERT INTO verification_requests (
  id, user_id, license_number, license_state, license_image_url, 
  photo_id_url, status, reviewed_at, created_at
) VALUES
('verify-001', '55555555-5555-5555-5555-555555555555', 'EM2024-001', 'Riyadh', 'https://storage.example.com/licenses/khalid_license.jpg', 'https://storage.example.com/ids/khalid_id.jpg', 'approved', NOW() - INTERVAL '2 weeks', NOW() - INTERVAL '3 weeks'),
('verify-002', 'mmmmmmmm-mmmm-mmmm-mmmm-mmmmmmmmmmmm', 'GS2024-002', 'Dammam', 'https://storage.example.com/licenses/amina_license.jpg', 'https://storage.example.com/ids/amina_id.jpg', 'approved', NOW() - INTERVAL '1 week', NOW() - INTERVAL '2 weeks'),
('verify-003', '88888888-8888-8888-8888-888888888888', 'OB2024-003', 'Riyadh', 'https://storage.example.com/licenses/maryam_license.jpg', 'https://storage.example.com/ids/maryam_id.jpg', 'approved', NOW() - INTERVAL '3 weeks', NOW() - INTERVAL '4 weeks');

-- ==============================================
-- 9. CREATE PAYMENT HISTORY
-- ==============================================

INSERT INTO payment_history (
  id, user_id, stripe_payment_intent_id, amount, currency, status,
  subscription_period_start, subscription_period_end, created_at
) VALUES
-- Monthly subscriptions for all 25 users (150 SAR = 15000 cents)
('pay-001', '11111111-1111-1111-1111-111111111111', 'pi_test_001', 15000, 'sar', 'succeeded', CURRENT_DATE - INTERVAL '1 month', CURRENT_DATE + INTERVAL '1 month', NOW() - INTERVAL '1 month'),
('pay-002', '22222222-2222-2222-2222-222222222222', 'pi_test_002', 15000, 'sar', 'succeeded', CURRENT_DATE - INTERVAL '1 month', CURRENT_DATE + INTERVAL '1 month', NOW() - INTERVAL '1 month'),
('pay-003', '33333333-3333-3333-3333-333333333333', 'pi_test_003', 15000, 'sar', 'succeeded', CURRENT_DATE - INTERVAL '1 month', CURRENT_DATE + INTERVAL '1 month', NOW() - INTERVAL '1 month'),
('pay-004', '44444444-4444-4444-4444-444444444444', 'pi_test_004', 15000, 'sar', 'succeeded', CURRENT_DATE - INTERVAL '1 month', CURRENT_DATE + INTERVAL '1 month', NOW() - INTERVAL '1 month'),
('pay-005', '55555555-5555-5555-5555-555555555555', 'pi_test_005', 15000, 'sar', 'succeeded', CURRENT_DATE - INTERVAL '1 month', CURRENT_DATE + INTERVAL '1 month', NOW() - INTERVAL '1 month'),
('pay-006', '66666666-6666-6666-6666-666666666666', 'pi_test_006', 15000, 'sar', 'succeeded', CURRENT_DATE - INTERVAL '1 month', CURRENT_DATE + INTERVAL '1 month', NOW() - INTERVAL '1 month'),
('pay-007', '77777777-7777-7777-7777-777777777777', 'pi_test_007', 15000, 'sar', 'succeeded', CURRENT_DATE - INTERVAL '1 month', CURRENT_DATE + INTERVAL '1 month', NOW() - INTERVAL '1 month'),
('pay-008', '88888888-8888-8888-8888-888888888888', 'pi_test_008', 15000, 'sar', 'succeeded', CURRENT_DATE - INTERVAL '1 month', CURRENT_DATE + INTERVAL '1 month', NOW() - INTERVAL '1 month'),
('pay-009', '99999999-9999-9999-9999-999999999999', 'pi_test_009', 15000, 'sar', 'succeeded', CURRENT_DATE - INTERVAL '1 month', CURRENT_DATE + INTERVAL '1 month', NOW() - INTERVAL '1 month'),
('pay-010', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'pi_test_010', 15000, 'sar', 'succeeded', CURRENT_DATE - INTERVAL '1 month', CURRENT_DATE + INTERVAL '1 month', NOW() - INTERVAL '1 month'),
('pay-011', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'pi_test_011', 15000, 'sar', 'succeeded', CURRENT_DATE - INTERVAL '1 month', CURRENT_DATE + INTERVAL '1 month', NOW() - INTERVAL '1 month'),
('pay-012', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'pi_test_012', 15000, 'sar', 'succeeded', CURRENT_DATE - INTERVAL '1 month', CURRENT_DATE + INTERVAL '1 month', NOW() - INTERVAL '1 month'),
('pay-013', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'pi_test_013', 15000, 'sar', 'succeeded', CURRENT_DATE - INTERVAL '1 month', CURRENT_DATE + INTERVAL '1 month', NOW() - INTERVAL '1 month'),
('pay-014', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'pi_test_014', 15000, 'sar', 'succeeded', CURRENT_DATE - INTERVAL '1 month', CURRENT_DATE + INTERVAL '1 month', NOW() - INTERVAL '1 month'),
('pay-015', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'pi_test_015', 15000, 'sar', 'succeeded', CURRENT_DATE - INTERVAL '1 month', CURRENT_DATE + INTERVAL '1 month', NOW() - INTERVAL '1 month'),
('pay-016', 'gggggggg-gggg-gggg-gggg-gggggggggggg', 'pi_test_016', 15000, 'sar', 'succeeded', CURRENT_DATE - INTERVAL '1 month', CURRENT_DATE + INTERVAL '1 month', NOW() - INTERVAL '1 month'),
('pay-017', 'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'pi_test_017', 15000, 'sar', 'succeeded', CURRENT_DATE - INTERVAL '1 month', CURRENT_DATE + INTERVAL '1 month', NOW() - INTERVAL '1 month'),
('pay-018', 'iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', 'pi_test_018', 15000, 'sar', 'succeeded', CURRENT_DATE - INTERVAL '1 month', CURRENT_DATE + INTERVAL '1 month', NOW() - INTERVAL '1 month'),
('pay-019', 'jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj', 'pi_test_019', 15000, 'sar', 'succeeded', CURRENT_DATE - INTERVAL '1 month', CURRENT_DATE + INTERVAL '1 month', NOW() - INTERVAL '1 month'),
('pay-020', 'kkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk', 'pi_test_020', 15000, 'sar', 'succeeded', CURRENT_DATE - INTERVAL '1 month', CURRENT_DATE + INTERVAL '1 month', NOW() - INTERVAL '1 month'),
('pay-021', 'llllllll-llll-llll-llll-llllllllllll', 'pi_test_021', 15000, 'sar', 'succeeded', CURRENT_DATE - INTERVAL '1 month', CURRENT_DATE + INTERVAL '1 month', NOW() - INTERVAL '1 month'),
('pay-022', 'mmmmmmmm-mmmm-mmmm-mmmm-mmmmmmmmmmmm', 'pi_test_022', 15000, 'sar', 'succeeded', CURRENT_DATE - INTERVAL '1 month', CURRENT_DATE + INTERVAL '1 month', NOW() - INTERVAL '1 month'),
('pay-023', 'nnnnnnnn-nnnn-nnnn-nnnn-nnnnnnnnnnnn', 'pi_test_023', 15000, 'sar', 'succeeded', CURRENT_DATE - INTERVAL '1 month', CURRENT_DATE + INTERVAL '1 month', NOW() - INTERVAL '1 month'),
('pay-024', 'oooooooo-oooo-oooo-oooo-oooooooooooo', 'pi_test_024', 15000, 'sar', 'succeeded', CURRENT_DATE - INTERVAL '1 month', CURRENT_DATE + INTERVAL '1 month', NOW() - INTERVAL '1 month'),
('pay-025', 'pppppppp-pppp-pppp-pppp-pppppppppppp', 'pi_test_025', 15000, 'sar', 'succeeded', CURRENT_DATE - INTERVAL '1 month', CURRENT_DATE + INTERVAL '1 month', NOW() - INTERVAL '1 month');

-- ==============================================
-- SUMMARY & VERIFICATION QUERIES
-- ==============================================

-- Verify the data was inserted correctly
DO $$
DECLARE
    user_count INTEGER;
    match_count INTEGER;
    message_count INTEGER;
    active_matches INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count FROM users WHERE email LIKE '%test.beyondrounds.com';
    SELECT COUNT(*) INTO match_count FROM matches WHERE group_name LIKE 'Test_%';
    SELECT COUNT(*) INTO message_count FROM chat_messages WHERE match_id IN (SELECT id FROM matches WHERE group_name LIKE 'Test_%');
    SELECT COUNT(*) INTO active_matches FROM matches WHERE group_name LIKE 'Test_%' AND status = 'active';
    
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'BeyondRounds Test Data Summary:';
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Total Test Users: %', user_count;
    RAISE NOTICE 'Total Test Matches: %', match_count;
    RAISE NOTICE 'Active Test Matches: %', active_matches;
    RAISE NOTICE 'Total Test Messages: %', message_count;
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Test Environment Ready for Matching & Messaging!';
    RAISE NOTICE '==============================================';
END $$;

-- Optional: View sample data
-- SELECT 
--   u.first_name, u.last_name, u.city, u.medical_specialty, 
--   u.is_verified, u.onboarding_completed
-- FROM users u 
-- WHERE u.email LIKE '%test.beyondrounds.com' 
-- ORDER BY u.city, u.first_name;

-- Optional: View active matches with members
-- SELECT 
--   m.group_name, m.status, m.group_size, m.average_compatibility_score,
--   STRING_AGG(u.first_name || ' ' || u.last_name, ', ') as members
-- FROM matches m
-- JOIN match_members mm ON m.id = mm.match_id
-- JOIN users u ON mm.user_id = u.id
-- WHERE m.group_name LIKE 'Test_%' AND m.status = 'active'
-- GROUP BY m.id, m.group_name, m.status, m.group_size, m.average_compatibility_score
-- ORDER BY m.created_at DESC;
