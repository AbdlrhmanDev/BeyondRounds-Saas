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

async function checkEmptyTables() {
  console.log('🔍 Checking empty tables...');
  
  try {
    // Check matches table schema
    console.log('\n1️⃣ Checking matches table schema...');
    const { data: matchesData, error: matchesError } = await supabase
      .from('matches')
      .select('*')
      .limit(1);
    
    if (matchesError) {
      console.error('❌ Matches table error:', matchesError);
    } else {
      console.log('✅ Matches table accessible');
      console.log('📊 Matches count:', matchesData.length);
      if (matchesData.length > 0) {
        console.log('📊 Matches columns:', Object.keys(matchesData[0]));
        console.log('📊 Sample match:', matchesData[0]);
      } else {
        console.log('📊 Matches table is empty - checking schema via SQL...');
        // Try to get schema info
        const { data: schemaInfo, error: schemaError } = await supabase
          .rpc('get_table_schema', { table_name: 'matches' });
        
        if (schemaError) {
          console.log('📊 Cannot get schema info:', schemaError.message);
        } else {
          console.log('📊 Schema info:', schemaInfo);
        }
      }
    }
    
    // Check match_members table schema
    console.log('\n2️⃣ Checking match_members table schema...');
    const { data: matchMembersData, error: matchMembersError } = await supabase
      .from('match_members')
      .select('*')
      .limit(1);
    
    if (matchMembersError) {
      console.error('❌ Match members table error:', matchMembersError);
    } else {
      console.log('✅ Match members table accessible');
      console.log('📊 Match members count:', matchMembersData.length);
      if (matchMembersData.length > 0) {
        console.log('📊 Match members columns:', Object.keys(matchMembersData[0]));
        console.log('📊 Sample match member:', matchMembersData[0]);
      } else {
        console.log('📊 Match members table is empty');
      }
    }
    
    // Test inserting a sample match to see what columns are expected
    console.log('\n3️⃣ Testing match insertion...');
    const { data: insertData, error: insertError } = await supabase
      .from('matches')
      .insert({
        name: 'Test Match',
        description: 'Test Description',
        max_participants: 4,
        status: 'active'
      })
      .select();
    
    if (insertError) {
      console.error('❌ Match insertion error:', insertError);
    } else {
      console.log('✅ Match inserted successfully');
      console.log('📊 Inserted match:', insertData[0]);
      
      // Clean up
      await supabase
        .from('matches')
        .delete()
        .eq('id', insertData[0].id);
      console.log('✅ Test match deleted');
    }
    
    console.log('\n🎉 Empty tables check completed!');
    
  } catch (error) {
    console.error('❌ Empty tables check failed:', error);
  }
}

checkEmptyTables();
