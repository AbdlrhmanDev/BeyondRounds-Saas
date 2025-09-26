const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkActualSchema() {
  console.log('🔍 Checking actual profiles table schema...\n');

  try {
    // Try different column names to see what exists
    const possibleColumns = [
      'profile_completion',
      'profile_completion_percentage', 
      'completion_percentage',
      'completion',
      'profile_percentage'
    ];

    console.log('1. Testing different column names...');
    
    for (const column of possibleColumns) {
      try {
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
          [column]: 0
        };
        
        const { error } = await supabase
          .from('profiles')
          .insert(testData);
        
        if (!error) {
          console.log(`✅ Found correct column: ${column}`);
          
          // Clean up test data
          await supabase
            .from('profiles')
            .delete()
            .eq('user_id', '00000000-0000-0000-0000-000000000000');
          
          return column;
        } else {
          console.log(`❌ Column ${column} not found: ${error.message}`);
        }
      } catch (err) {
        console.log(`❌ Column ${column} error: ${err.message}`);
      }
    }

    // Try with minimal required columns only
    console.log('\n2. Trying with minimal columns...');
    const minimalData = {
      user_id: '00000000-0000-0000-0000-000000000000',
      email: 'test@example.com',
      first_name: 'Test',
      last_name: 'User'
    };
    
    const { data, error } = await supabase
      .from('profiles')
      .insert(minimalData)
      .select();
    
    if (error) {
      console.error('❌ Minimal insert failed:', error.message);
      console.error('   Code:', error.code);
      console.error('   Details:', error.details);
    } else {
      console.log('✅ Minimal insert successful');
      console.log('   Inserted data:', data[0]);
      
      // Clean up
      await supabase
        .from('profiles')
        .delete()
        .eq('user_id', '00000000-0000-0000-0000-000000000000');
    }

  } catch (error) {
    console.error('💥 Exception:', error.message);
  }
}

checkActualSchema();
