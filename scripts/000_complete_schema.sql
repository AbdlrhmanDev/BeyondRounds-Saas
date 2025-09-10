-- Complete Database Schema for BeyondRounds
-- Run this script in your Supabase SQL editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================
-- CORE TABLES
-- ==============================================

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  city TEXT NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female', 'non-binary', 'prefer-not-to-say')),
  gender_preference TEXT NOT NULL DEFAULT 'no-preference' CHECK (gender_preference IN ('same', 'mixed', 'no-preference')),
  interests TEXT[] DEFAULT '{}',
  availability_slots TEXT[] DEFAULT '{}',
  is_verified BOOLEAN DEFAULT false,
  is_paid BOOLEAN DEFAULT false,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  stripe_customer_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Matches table
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  match_week DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Match members junction table
CREATE TABLE IF NOT EXISTS match_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(match_id, user_id)
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  message_type TEXT NOT NULL CHECK (message_type IN ('user', 'system', 'bot')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Verification documents table
CREATE TABLE IF NOT EXISTS verification_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  document_url TEXT NOT NULL,
  document_type TEXT DEFAULT 'license' CHECK (document_type IN ('license', 'certificate', 'id')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- INDEXES FOR PERFORMANCE
-- ==============================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_verified_paid ON profiles(is_verified, is_paid) WHERE is_verified = true AND is_paid = true;
CREATE INDEX IF NOT EXISTS idx_profiles_city ON profiles(city);
CREATE INDEX IF NOT EXISTS idx_profiles_specialty ON profiles(specialty);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer ON profiles(stripe_customer_id);

-- Matches indexes
CREATE INDEX IF NOT EXISTS idx_matches_week ON matches(match_week);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_created ON matches(created_at);

-- Match members indexes
CREATE INDEX IF NOT EXISTS idx_match_members_user ON match_members(user_id);
CREATE INDEX IF NOT EXISTS idx_match_members_match ON match_members(match_id);

-- Chat messages indexes
CREATE INDEX IF NOT EXISTS idx_chat_messages_match ON chat_messages(match_id, created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_type ON chat_messages(message_type);

-- Verification documents indexes
CREATE INDEX IF NOT EXISTS idx_verification_user ON verification_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_status ON verification_documents(status);
CREATE INDEX IF NOT EXISTS idx_verification_submitted ON verification_documents(submitted_at);

-- ==============================================
-- ROW LEVEL SECURITY (RLS)
-- ==============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_documents ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles FOR ALL USING (is_admin(auth.uid()));

-- Matches policies
CREATE POLICY "Users can view their matches" ON matches FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM match_members 
    WHERE match_members.match_id = matches.id 
    AND match_members.user_id = auth.uid()
  )
);
CREATE POLICY "Admins can manage all matches" ON matches FOR ALL USING (is_admin(auth.uid()));

-- Match members policies
CREATE POLICY "Users can view their match memberships" ON match_members FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all match members" ON match_members FOR ALL USING (is_admin(auth.uid()));

-- Chat messages policies
CREATE POLICY "Users can view messages from their matches" ON chat_messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM match_members 
    WHERE match_members.match_id = chat_messages.match_id 
    AND match_members.user_id = auth.uid()
  )
);
CREATE POLICY "Users can send messages to their matches" ON chat_messages FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM match_members 
    WHERE match_members.match_id = chat_messages.match_id 
    AND match_members.user_id = auth.uid()
  )
);
CREATE POLICY "Admins can manage all messages" ON chat_messages FOR ALL USING (is_admin(auth.uid()));

-- Verification documents policies
CREATE POLICY "Users can manage own verification" ON verification_documents FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all verifications" ON verification_documents FOR ALL USING (is_admin(auth.uid()));

-- ==============================================
-- SECURITY FUNCTIONS
-- ==============================================

-- Function to check if a user is an admin
CREATE OR REPLACE FUNCTION is_admin(uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = uid AND role = 'admin'
  );
$$;

-- Function to get user role (for server-side checks)
CREATE OR REPLACE FUNCTION get_user_role(uid uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (SELECT role FROM profiles WHERE id = uid),
    'user'
  );
$$;

-- ==============================================
-- FUNCTIONS AND TRIGGERS
-- ==============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    first_name, 
    last_name,
    is_verified,
    is_paid,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
    false,
    false,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Trigger for auto-creating profiles
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ==============================================
-- SAMPLE DATA (Optional - for testing)
-- ==============================================

-- Insert sample specialties
-- You can add more specialties as needed
-- This is just for reference - actual data comes from user profiles

-- ==============================================
-- ADMIN SETUP
-- ==============================================

-- Set abdlrhmannabil2020@gmail.com as admin (run this after user signup)
-- UPDATE profiles SET role = 'admin' WHERE email = 'abdlrhmannabil2020@gmail.com';

-- ==============================================
-- CLEANUP FUNCTIONS
-- ==============================================

-- Function to clean up old verification documents (90 day retention)
CREATE OR REPLACE FUNCTION cleanup_old_verification_documents()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete verification documents older than 90 days
  DELETE FROM verification_documents 
  WHERE submitted_at < NOW() - INTERVAL '90 days';
  
  -- Note: Storage files should be cleaned up separately via admin panel or cron job
END;
$$;

-- Function to archive old matches (6 months)
CREATE OR REPLACE FUNCTION archive_old_matches()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Archive matches older than 6 months
  UPDATE matches 
  SET status = 'archived'
  WHERE created_at < NOW() - INTERVAL '6 months'
  AND status = 'active';
END;
$$;

-- ==============================================
-- GRANTS AND PERMISSIONS
-- ==============================================

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Grant permissions to service role (for server-side operations)
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;
