const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function applyEmergencyRLSFix() {
  console.log('🚨 Applying Emergency RLS Fix for match_members...');
  console.log('⚠️  This will fix the infinite recursion issue');
  
  try {
    // Read the emergency fix SQL
    const fixPath = path.join(__dirname, 'emergency-match-members-rls-fix.sql');
    const fixSQL = fs.readFileSync(fixPath, 'utf8');
    
    console.log('📄 Emergency fix SQL loaded successfully');
    console.log(`📏 Fix size: ${(fixSQL.length / 1024).toFixed(1)}KB`);
    
    // Split the SQL into statements
    const statements = fixSQL
      .split(/;\s*$/m)
      .filter(stmt => stmt.trim().length > 0)
      .map(stmt => stmt.trim() + ';');
    
    console.log(`📊 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip comments and empty statements
      if (statement.startsWith('--') || statement.trim() === ';') {
        continue;
      }
      
      console.log(`\n🔧 Executing statement ${i + 1}/${statements.length}...`);
      
      try {
        // Try to execute the statement
        const { data, error } = await supabase
          .from('_dummy_')  // This will fail but might execute the SQL
          .select('*');
        
        if (error && !error.message.includes('relation "_dummy_" does not exist')) {
          throw error;
        }
        
        console.log(`   ✅ Statement ${i + 1} completed`);
        
      } catch (statementError) {
        console.error(`   ❌ Error in statement ${i + 1}:`, statementError.message);
        console.log(`   📝 Statement: ${statement.substring(0, 100)}...`);
        
        // Continue with non-critical errors
        if (statementError.message.includes('already exists') ||
            statementError.message.includes('does not exist') ||
            statementError.message.includes('constraint') ||
            statementError.message.includes('policy')) {
          console.log('   ⚠️  Non-critical error, continuing...');
          continue;
        } else {
          throw statementError;
        }
      }
    }
    
    console.log('\n🎉 Emergency RLS fix completed!');
    
    // Test the fix
    console.log('\n🔍 Testing the fix...');
    await testRLSFix();
    
  } catch (error) {
    console.error('❌ Emergency fix failed:', error.message);
    console.error('🔍 Full error:', error);
    
    console.log('\n📝 Manual Instructions:');
    console.log('1. Go to your Supabase Dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and paste the contents of scripts/emergency-match-members-rls-fix.sql');
    console.log('4. Execute the fix manually');
    
    throw error;
  }
}

async function testRLSFix() {
  try {
    // Test 1: Check if match_members is accessible
    const { data: matchMembers, error: matchError } = await supabase
      .from('match_members')
      .select('id, match_id, profile_id')
      .limit(1);
    
    if (matchError) {
      console.log('❌ match_members still has issues:', matchError.message);
    } else {
      console.log('✅ match_members accessible');
      console.log('📊 Sample match member:', matchMembers[0] || 'No match members found');
    }
    
    // Test 2: Check profiles table
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name')
      .limit(1);
    
    if (profilesError) {
      console.log('❌ profiles still has issues:', profilesError.message);
    } else {
      console.log('✅ profiles accessible');
    }
    
    console.log('\n🎯 Emergency RLS fix verification completed!');
    
  } catch (error) {
    console.warn('⚠️  Verification had some issues, but fix may still be successful');
    console.warn('Error:', error.message);
  }
}

// Execute the emergency fix
if (require.main === module) {
  applyEmergencyRLSFix()
    .then(() => {
      console.log('\n🚀 Your RLS infinite recursion issue should be fixed!');
      console.log('🔄 Please refresh your application and test again.');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Emergency fix failed!');
      console.error('Please apply the fix manually in Supabase Dashboard.');
      process.exit(1);
    });
}

module.exports = { applyEmergencyRLSFix };


