# BeyondRounds Database Guide

## 🗄️ Database Overview

BeyondRounds uses **Supabase** as the backend-as-a-service, providing PostgreSQL database, authentication, real-time subscriptions, and storage. The database is optimized for medical professional matching with comprehensive security and performance features.

## 📊 Database Schema

### Core Tables

#### `profiles`
User profile information and matching preferences.

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  bio TEXT,
  specialty TEXT,
  experience_years INTEGER,
  location TEXT,
  preferences JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `matches`
User matching results and compatibility scores.

```sql
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  matched_user_id UUID REFERENCES profiles(id),
  compatibility_score DECIMAL(3,2),
  match_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `groups`
Chat groups for matched users.

```sql
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `group_members`
Many-to-many relationship between users and groups.

```sql
CREATE TABLE group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id),
  user_id UUID REFERENCES profiles(id),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);
```

#### `messages`
Chat messages within groups.

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id),
  user_id UUID REFERENCES profiles(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `matching_logs`
Logs of matching algorithm runs and results.

```sql
CREATE TABLE matching_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  status TEXT NOT NULL,
  matches_created INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔐 Row Level Security (RLS)

### Profiles Table
```sql
-- Users can only see their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
```

### Matches Table
```sql
-- Users can only see their own matches
CREATE POLICY "Users can view own matches" ON matches
  FOR SELECT USING (auth.uid() = user_id);
```

### Groups Table
```sql
-- Users can view groups they're members of
CREATE POLICY "Users can view groups they're in" ON groups
  FOR SELECT USING (
    id IN (
      SELECT group_id FROM group_members 
      WHERE user_id = auth.uid()
    )
  );
```

### Messages Table
```sql
-- Users can view messages from groups they're in
CREATE POLICY "Users can view group messages" ON messages
  FOR SELECT USING (
    group_id IN (
      SELECT group_id FROM group_members 
      WHERE user_id = auth.uid()
    )
  );

-- Users can send messages to groups they're in
CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    group_id IN (
      SELECT group_id FROM group_members 
      WHERE user_id = auth.uid()
    )
  );
```

## 🔄 Database Functions

### Matching Algorithm Function
```sql
CREATE OR REPLACE FUNCTION run_matching_algorithm(user_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  -- Matching logic implementation
  -- Returns matching results as JSON
  
  INSERT INTO matching_logs (user_id, status, matches_created)
  VALUES (user_id, 'completed', 0);
  
  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Profile Update Trigger
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## 📈 Indexes

### Performance Indexes
```sql
-- Profile lookups
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_specialty ON profiles(specialty);

-- Match queries
CREATE INDEX idx_matches_user_id ON matches(user_id);
CREATE INDEX idx_matches_created_at ON matches(created_at DESC);

-- Group member queries
CREATE INDEX idx_group_members_user_id ON group_members(user_id);
CREATE INDEX idx_group_members_group_id ON group_members(group_id);

-- Message queries
CREATE INDEX idx_messages_group_id ON messages(group_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

-- Matching logs
CREATE INDEX idx_matching_logs_user_id ON matching_logs(user_id);
CREATE INDEX idx_matching_logs_created_at ON matching_logs(created_at DESC);
```

## 🔧 Database Setup

### Initial Setup
```bash
# 1. Create Supabase project
# 2. Run complete optimized schema
# Use database/complete_schema_optimized.sql in Supabase SQL editor

# 3. For incremental updates, use:
# database/essential_optimizations.sql

# 4. Check database status
# Use database/check_current_status.sql
```

### Migration Management
```bash
# Run all migrations
npm run db:migrate

# Run specific migration
psql -h your-db-host -U postgres -d postgres -f database/migrations/XXX_migration_name.sql

# Reset database (development only)
npm run db:reset
```

## 🌱 Seed Data

### Development Seeds
```sql
-- Insert test users
INSERT INTO profiles (id, email, first_name, last_name, specialty, experience_years)
VALUES 
  ('user-1', 'doctor1@example.com', 'John', 'Doe', 'Cardiology', 5),
  ('user-2', 'doctor2@example.com', 'Jane', 'Smith', 'Neurology', 8),
  ('user-3', 'doctor3@example.com', 'Bob', 'Johnson', 'Cardiology', 3);

-- Insert test groups
INSERT INTO groups (id, name, description)
VALUES 
  ('group-1', 'Cardiology Discussion', 'Discussion group for cardiology professionals'),
  ('group-2', 'General Medicine', 'General medical discussions');

-- Insert test matches
INSERT INTO matches (user_id, matched_user_id, compatibility_score)
VALUES 
  ('user-1', 'user-3', 0.85),
  ('user-2', 'user-1', 0.72);
```

## 📊 Database Monitoring

### Query Performance
```sql
-- Check slow queries
SELECT query, mean_time, calls, total_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Connection Monitoring
```sql
-- Check active connections
SELECT count(*) as active_connections
FROM pg_stat_activity
WHERE state = 'active';

-- Check connection limits
SHOW max_connections;
```

## 🔒 Security Best Practices

### Data Protection
1. **Always use RLS policies** for user data access
2. **Validate input** at the database level
3. **Use parameterized queries** to prevent SQL injection
4. **Encrypt sensitive data** in transit and at rest
5. **Regular security audits** of database permissions

### Access Control
```sql
-- Create read-only role for analytics
CREATE ROLE analytics_readonly;
GRANT USAGE ON SCHEMA public TO analytics_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO analytics_readonly;

-- Create application role
CREATE ROLE app_user;
GRANT USAGE ON SCHEMA public TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
```

## 🚀 Production Considerations

### Performance Optimization
1. **Monitor query performance** regularly
2. **Add indexes** based on query patterns
3. **Use connection pooling** for high-traffic applications
4. **Implement caching** for frequently accessed data
5. **Regular maintenance** (VACUUM, ANALYZE)

### Backup Strategy
```bash
# Daily backups
pg_dump -h your-db-host -U postgres -d your-db > backup_$(date +%Y%m%d).sql

# Automated backups with Supabase
# Configure in Supabase dashboard under Settings > Database
```

### Scaling Considerations
1. **Read replicas** for read-heavy workloads
2. **Partitioning** for large tables
3. **Connection pooling** with PgBouncer
4. **Monitoring** with tools like pgAdmin or DataDog

## 🐛 Troubleshooting

### Common Issues

#### Connection Issues
```bash
# Check connection string
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT version();"
```

#### RLS Policy Issues
```sql
-- Check RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('profiles', 'matches', 'groups', 'messages');

-- Test RLS policies
SET ROLE authenticated;
SELECT * FROM profiles WHERE id = auth.uid();
```

#### Performance Issues
```sql
-- Check for missing indexes
EXPLAIN ANALYZE SELECT * FROM matches WHERE user_id = 'user-1';

-- Check table bloat
SELECT schemaname, tablename, n_dead_tup, n_live_tup
FROM pg_stat_user_tables
WHERE n_dead_tup > 0;
```

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Database Performance Tuning](https://www.postgresql.org/docs/current/performance-tips.html)
