-- Enable Realtime for BeyondRounds tables
-- Run this in your Supabase SQL Editor

-- Enable Realtime for chat_messages table
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;

-- Enable Realtime for profiles table (optional)
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;

-- Enable Realtime for matches table (optional)
ALTER PUBLICATION supabase_realtime ADD TABLE matches;

-- Enable Realtime for match_members table (optional)
ALTER PUBLICATION supabase_realtime ADD TABLE match_members;

-- Enable Realtime for chat_rooms table (optional)
ALTER PUBLICATION supabase_realtime ADD TABLE chat_rooms;

-- Check current Realtime publications
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
