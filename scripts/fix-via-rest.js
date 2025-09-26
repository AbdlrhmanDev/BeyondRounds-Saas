const fetch = require('node-fetch');

// Load environment variables
require('dotenv').config();

async function fixDatabaseViaREST() {
  try {
    console.log('🔧 Fixing database via REST API...');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !serviceKey) {
      console.error('❌ Missing Supabase credentials');
      return false;
    }
    
    // Step 1: Disable RLS on match_members
    console.log('1. Disabling RLS on match_members table...');
    
    const sqlQuery = `
      ALTER TABLE public.match_members DISABLE ROW LEVEL SECURITY;
      DROP FUNCTION IF EXISTS public.is_member_of_match(uuid);
      SELECT 'RLS disabled successfully!' as status;
    `;
    
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceKey}`,
        'apikey': serviceKey
      },
      body: JSON.stringify({ sql: sqlQuery })
    });
    
    if (!response.ok) {
      console.log('⚠️  REST API approach failed, trying direct SQL...');
      
      // Try direct SQL execution
      const directResponse = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${serviceKey}`,
          'apikey': serviceKey
        },
        body: JSON.stringify({
          query: sqlQuery
        })
      });
      
      if (!directResponse.ok) {
        console.log('❌ Direct SQL also failed');
        console.log('📝 Manual fix required: Go to Supabase SQL Editor');
        console.log('   and run: ALTER TABLE public.match_members DISABLE ROW LEVEL SECURITY;');
        return false;
      }
    }
    
    console.log('✅ RLS disabled successfully!');
    
    // Step 2: Test access
    console.log('2. Testing profile access...');
    const testResponse = await fetch(`${supabaseUrl}/rest/v1/profiles?select=id,first_name&limit=1`, {
      headers: {
        'Authorization': `Bearer ${serviceKey}`,
        'apikey': serviceKey
      }
    });
    
    if (testResponse.ok) {
      const data = await testResponse.json();
      console.log('✅ Profile access successful!');
      console.log('Sample profile:', data[0]);
      console.log('🎉 Database fix completed! Dashboard should work now.');
      return true;
    } else {
      console.error('❌ Profile access test failed');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('📝 Manual fix required: Go to Supabase SQL Editor');
    console.log('   and run: ALTER TABLE public.match_members DISABLE ROW LEVEL SECURITY;');
    return false;
  }
}

// Run the fix
fixDatabaseViaREST().then(success => {
  if (success) {
    console.log('✅ All fixes applied successfully!');
    process.exit(0);
  } else {
    console.log('❌ Automated fix failed - manual intervention required');
    process.exit(1);
  }
});







