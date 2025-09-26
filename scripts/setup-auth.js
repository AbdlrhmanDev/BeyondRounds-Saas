#!/usr/bin/env node

/**
 * BeyondRounds Authentication Setup Script
 * 
 * This script helps you:
 * 1. Set up environment variables
 * 2. Create test users in Supabase Auth
 * 3. Verify authentication is working
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 BeyondRounds Authentication Setup');
console.log('=====================================\n');

// Step 1: Create .env.local file
console.log('📝 Step 1: Creating .env.local file...');

const envContent = `# BeyondRounds Environment Variables
# Replace these with your actual Supabase project values

# ==============================================
# SUPABASE CONFIGURATION (Required)
# ==============================================
NEXT_PUBLIC_SUPABASE_URL=https://bpynucvjhrdgajzoxmyw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# ==============================================
# APPLICATION CONFIGURATION
# ==============================================
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ==============================================
# SECURITY CONFIGURATION
# ==============================================
CRON_SECRET=your_random_secret_key_here

# ==============================================
# STRIPE PAYMENT CONFIGURATION (Optional)
# ==============================================
# STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
# STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret
`;

const envPath = path.join(process.cwd(), '.env.local');

if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env.local file');
} else {
  console.log('⚠️  .env.local already exists');
}

console.log('\n📋 Next Steps:');
console.log('1. Get your Supabase credentials from: https://supabase.com/dashboard/project/bpynucvjhrdgajzoxmyw/settings/api');
console.log('2. Replace "your_supabase_anon_key_here" with your actual anon key');
console.log('3. Replace "your_service_role_key_here" with your actual service role key');
console.log('4. Run the database setup script to create test users');
console.log('\n🔑 Test User Credentials (after setup):');
console.log('Email: ahmed.hassan@test.beyondrounds.com');
console.log('Password: TestPassword123!');
console.log('\n📚 For more help, check the README.md file');
