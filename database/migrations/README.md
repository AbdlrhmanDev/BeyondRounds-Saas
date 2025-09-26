# BeyondRounds Database Schema & Setup Guide

## 🗄️ Overview

This directory contains the complete database schema and migration scripts for the BeyondRounds medical professional networking platform. The database is built on **Supabase (PostgreSQL)** and includes comprehensive features for user profiles, matching algorithms, chat functionality, and admin management.

## 📁 File Structure

```
database/
├── schema.sql                    # Complete database schema (all-in-one)
├── migrations/
│   ├── README.md                 # This file
│   ├── 001_initial_schema.sql    # Core tables, indexes, and basic functions
│   ├── 002_rls_policies.sql      # Row Level Security policies
│   ├── 003_database_functions.sql # Helper functions and triggers
│   ├── 004_sample_data.sql       # Sample data for development
│   └── 005_admin_setup.sql       # Admin user setup and queries
└── docs/
    └── database.md               # Detailed database documentation
```

## 🚀 Quick Setup

### Option 1: Complete Schema (Recommended for New Projects)

1. **Run the complete schema file:**
   ```sql
   -- Copy and paste the entire contents of database/schema.sql
   -- into your Supabase SQL editor and execute
   ```

### Option 2: Step-by-Step Migration (Recommended for Existing Projects)

1. **Run migrations in order:**
   ```sql
   -- 1. Initial schema
   -- Copy and execute: database/migrations/001_initial_schema.sql
   
   -- 2. Security policies
   -- Copy and execute: database/migrations/002_rls_policies.sql
   
   -- 3. Database functions
   -- Copy and execute: database/migrations/003_database_functions.sql
   
   -- 4. Sample data (optional, for development)
   -- Copy and execute: database/migrations/004_sample_data.sql
   
   -- 5. Admin setup
   -- Copy and execute: database/migrations/005_admin_setup.sql
   ```

## 📊 Database Schema

### Core Tables

| Table | Purpose | Key Features |
|-------|---------|--------------|
| `profiles` | User profiles | Extends auth.users, comprehensive medical data |
| `matches` | Match groups | Groups of 3-4 matched users |
| `match_members` | Group membership | Junction table for users and matches |
| `chat_messages` | Chat messages | Messages within match groups |
| `notifications` | User notifications | System and user notifications |
| `verification_requests` | License verification | Medical license verification workflow |
| `payment_history` | Payment records | Stripe payment history |
| `user_preferences` | User settings | Privacy and notification preferences |
| `matching_logs` | Algorithm logs | Weekly matching algorithm logs |

### Key Features

- **Comprehensive Profile System**: 20+ fields including medical specialties, interests, availability
- **Advanced Matching Algorithm**: 7-step algorithm with weighted scoring
- **Row Level Security**: Complete data protection with RLS policies
- **Real-time Chat**: Secure group messaging with system messages
- **Admin Dashboard**: Complete admin management system
- **Payment Integration**: Stripe subscription management
- **Verification System**: Medical license verification workflow

## 🔐 Security Features

### Row Level Security (RLS)

All tables have comprehensive RLS policies:

- **User Policies**: Users can only access their own data
- **Admin Policies**: Admins can access all data
- **Service Role Policies**: Server operations can manage system data
- **Match Policies**: Users can only see their own matches and messages

### Data Protection

- **Encrypted Storage**: All sensitive data encrypted at rest
- **Secure Queries**: Parameterized queries prevent SQL injection
- **Access Control**: Role-based permissions (user/admin/service)
- **Audit Trail**: Complete logging of all operations

## 🎯 Matching Algorithm

### 7-Step Process

1. **Fetch Eligible Users**: Filter users meeting all criteria
2. **Score Valid Pairs**: Calculate compatibility scores
3. **Group Formation**: Create groups of 3-4 users
4. **Database Records**: Insert match and member records
5. **Chat Seeding**: Create welcome messages
6. **Notifications**: Prepare user notifications
7. **Rollover Handling**: Manage unmatched users

### Scoring Formula

```
match_score = 0.30 * specialty_similarity +
              0.40 * shared_interest_ratio +
              0.20 * same_city +
              0.10 * overlapping_availability_ratio
```

## 🛠️ Database Functions

### User Management
- `get_user_matches(user_uuid)` - Get user's current matches
- `get_match_messages(match_uuid, user_uuid)` - Get chat messages
- `is_user_eligible_for_matching(user_uuid)` - Check matching eligibility
- `calculate_profile_completion(user_profile)` - Calculate profile completion %

### Matching Algorithm
- `get_eligible_users_for_matching()` - Get users eligible for matching
- `calculate_compatibility_score(user1_id, user2_id)` - Calculate compatibility
- `create_notification(...)` - Create user notifications

### Admin Functions
- `get_system_statistics()` - Get system overview
- `approve_verification_request(...)` - Approve verification
- `reject_verification_request(...)` - Reject verification

### Cleanup Functions
- `archive_old_matches()` - Archive old matches
- `cleanup_old_verification_documents()` - Clean old verifications
- `cleanup_old_notifications()` - Clean old notifications

## 📈 Performance Optimization

### Indexes

The schema includes comprehensive indexes for optimal performance:

- **Profile Indexes**: Email, city, specialties, verification status
- **Match Indexes**: Week, status, creation date
- **Message Indexes**: Match ID, user ID, creation date
- **Composite Indexes**: Multi-column indexes for complex queries

### Query Optimization

- **GIN Indexes**: For array and JSONB fields
- **Partial Indexes**: For filtered queries
- **Covering Indexes**: For common query patterns

## 🔧 Admin Management

### Admin Dashboard Queries

The admin setup includes comprehensive queries for:

- **User Management**: View all users with status
- **Verification**: Manage verification requests
- **Matches**: Monitor match success rates
- **Payments**: Track subscription status
- **System Health**: Monitor system performance

### Admin Actions

- **Approve/Reject Verifications**: Complete verification workflow
- **System Cleanup**: Automated cleanup operations
- **Monitoring**: System health and performance metrics

## 🧪 Development & Testing

### Sample Data

The sample data includes:

- **6 Sample Doctors**: Various specialties and interests
- **Sample Matches**: Test match groups
- **Sample Messages**: Chat message examples
- **Sample Notifications**: User notification examples
- **Sample Payments**: Payment history examples

### Testing Queries

Use the admin setup file to test:

- **System Statistics**: Verify data integrity
- **User Management**: Test user operations
- **Match Operations**: Test matching functionality
- **Admin Functions**: Test admin capabilities

## 🚨 Important Notes

### Production Deployment

1. **Remove Sample Data**: Don't run sample data in production
2. **Update Admin Email**: Change admin email in admin setup
3. **Environment Variables**: Set up proper environment variables
4. **Backup Strategy**: Implement regular backups
5. **Monitoring**: Set up database monitoring

### Security Considerations

1. **RLS Policies**: All tables have RLS enabled
2. **Admin Access**: Limit admin user creation
3. **Service Role**: Secure service role key
4. **Data Retention**: Implement data retention policies
5. **Audit Logging**: Monitor all database operations

### Performance Monitoring

1. **Query Performance**: Monitor slow queries
2. **Index Usage**: Check index effectiveness
3. **Connection Pooling**: Use connection pooling
4. **Regular Maintenance**: Run VACUUM and ANALYZE
5. **Scaling**: Plan for horizontal scaling

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Database Performance Tuning](https://www.postgresql.org/docs/current/performance-tips.html)

## 🤝 Support

For database-related issues:

1. Check the detailed documentation in `docs/database.md`
2. Review the migration scripts for specific setup steps
3. Use the admin queries to diagnose issues
4. Check Supabase logs for error details

---

**🎉 Your BeyondRounds database is now ready for production!**

The schema supports all features of the medical professional networking platform, including sophisticated matching algorithms, secure chat functionality, and comprehensive admin management.
