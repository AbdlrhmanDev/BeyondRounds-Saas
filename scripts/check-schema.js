const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSchema() {
  console.log('🔍 Checking profiles table schema...');
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error:', error);
      return;
    }
    
    if (data && data.length > 0) {
      console.log('📋 Available columns in profiles table:');
      Object.keys(data[0]).forEach((key, index) => {
        console.log(`   ${index + 1}. ${key}`);
      });
      
      if (data[0].phone_number !== undefined) {
        console.log('✅ phone_number column exists!');
      } else {
        console.log('❌ phone_number column does not exist');
      }
    } else {
      console.log('No data found');
    }
  } catch (error) {
    console.error('Error checking schema:', error);
  }
}

checkSchema();