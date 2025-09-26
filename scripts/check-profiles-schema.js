const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkProfilesSchema() {
  console.log('🔍 Checking profiles table schema...\n');

  try {
    // Try to get the table structure by selecting one row
    console.log('1. Checking table structure...');
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Error accessing profiles table:', error.message);
      console.error('   Code:', error.code);
      console.error('   Details:', error.details);
    } else {
      console.log('✅ Profiles table accessible');
      if (data && data.length > 0) {
        console.log('   Sample row columns:', Object.keys(data[0]));
      } else {
        console.log('   Table is empty, trying to get column info...');
        
        // Try to insert a test row to see what columns are expected
        const testData = {
          user_id: '00000000-0000-0000-0000-000000000000',
          email: 'test@example.com',
          first_name: 'Test',
          last_name: 'User',
          city: 'Test City',
          gender: 'prefer-not-to-say',
          role: 'user',
          is_verified: false,
          is_banned: false,
          onboarding_completed: false,
          profile_completion_percentage: 0
        };
        
        const { error: insertError } = await supabase
          .from('profiles')
          .insert(testData);
        
        if (insertError) {
          console.error('❌ Insert test failed:', insertError.message);
          console.error('   Code:', insertError.code);
          console.error('   Details:', insertError.details);
          console.error('   Hint:', insertError.hint);
        } else {
          console.log('✅ Test insert successful - columns are correct');
          
          // Clean up test data
          await supabase
            .from('profiles')
            .delete()
            .eq('user_id', '00000000-0000-0000-0000-000000000000');
        }
      }
    }

  } catch (error) {
    console.error('💥 Exception:', error.message);
  }
}

checkProfilesSchema();
