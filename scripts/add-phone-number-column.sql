-- ============================================
-- ADD PHONE_NUMBER COLUMN TO PROFILES TABLE
-- ============================================

-- Step 1: Add phone_number column to profiles table
ALTER TABLE profiles 
ADD COLUMN phone_number VARCHAR(20);

-- Step 2: Add a comment to describe the column
COMMENT ON COLUMN profiles.phone_number IS 'User phone number for contact purposes';

-- Step 3: Create an index for phone number lookups (optional)
CREATE INDEX IF NOT EXISTS idx_profiles_phone_number ON profiles(phone_number);

-- Step 4: Test the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name = 'phone_number';

-- Step 5: Show the updated table structure
\d profiles;
