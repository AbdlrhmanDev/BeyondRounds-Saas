-- Set admin role for abdlrhmannabil2020@gmail.com
-- Run this script after the user has signed up and their profile exists

UPDATE profiles 
SET role = 'admin' 
WHERE email = 'abdlrhmannabil2020@gmail.com';

-- Verify the update
SELECT id, email, role, first_name, last_name 
FROM profiles 
WHERE email = 'abdlrhmannabil2020@gmail.com';
