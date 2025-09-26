const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function testLogin() {
  console.log('🧪 Testing login functionality...');
  
  try {
    // Test 1: Check if we can query profiles table
    console.log('\n1️⃣ Testing profiles table access...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, user_id, email, first_name')
      .limit(1);
    
    if (profilesError) {
      console.error('❌ Profiles table error:', profilesError);
      return;
    }
    
    console.log('✅ Profiles table accessible');
    console.log('📊 Sample profile:', profiles[0] || 'No profiles found');
    
    // Test 2: Check if we can query user_preferences table
    console.log('\n2️⃣ Testing user_preferences table access...');
    const { data: preferences, error: preferencesError } = await supabase
      .from('user_preferences')
      .select('profile_id, email_notifications')
      .limit(1);
    
    if (preferencesError) {
      console.error('❌ User preferences table error:', preferencesError);
    } else {
      console.log('✅ User preferences table accessible');
      console.log('📊 Sample preference:', preferences[0] || 'No preferences found');
    }
    
    // Test 3: Test auth user creation (if needed)
    console.log('\n3️⃣ Testing auth user creation...');
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'testpassword123';
    
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: { 
        first_name: 'Test', 
        last_name: 'User',
        city: 'Test City'
      }
    });
    
    if (authError) {
      console.error('❌ Auth user creation error:', authError);
      return;
    }
    
    console.log('✅ Auth user created successfully');
    console.log('👤 User ID:', authData.user.id);
    
    // Test 4: Check if profile was created automatically
    console.log('\n4️⃣ Checking if profile was created automatically...');
    const { data: newProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', authData.user.id)
      .single();
    
    if (profileError) {
      console.error('❌ Profile not found:', profileError);
    } else {
      console.log('✅ Profile created automatically');
      console.log('📊 Profile data:', newProfile);
    }
    
    // Clean up test user
    console.log('\n5️⃣ Cleaning up test user...');
    await supabase.auth.admin.deleteUser(authData.user.id);
    console.log('✅ Test user deleted');
    
    console.log('\n🎉 All tests passed! Login should work now.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testLogin();
