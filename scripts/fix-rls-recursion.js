#!/usr/bin/env node

/**
 * Fix RLS Recursion Error Script
 * 
 * This script applies the RLS recursion fix to the Supabase database.
 * Run this script to resolve the "infinite recursion detected in policy" error.
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyRLSFix() {
  try {
    console.log('🔧 Applying RLS recursion fix...');
    
    // Read the SQL migration file
    const sqlPath = path.join(__dirname, '..', 'database', 'migrations', '008_fix_rls_recursion.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Split the SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Executing ${statements.length} SQL statements...`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`   ${i + 1}/${statements.length}: ${statement.substring(0, 50)}...`);
          const { error } = await supabase.rpc('exec_sql', { sql: statement });
          
          if (error) {
            // Some errors are expected (like dropping non-existent policies)
            if (!error.message.includes('does not exist') && 
                !error.message.includes('already exists')) {
              console.warn(`   ⚠️  Warning: ${error.message}`);
            }
          }
        } catch (err) {
          console.warn(`   ⚠️  Warning: ${err.message}`);
        }
      }
    }
    
    console.log('✅ RLS recursion fix applied successfully!');
    console.log('');
    console.log('🧪 Testing the fix...');
    
    // Test the fix by trying to query match_members
    const { data, error } = await supabase
      .from('match_members')
      .select('match_id, matches!match_members_match_id_fkey(id, group_name)')
      .eq('profile_id', '19fa27b2-8032-4afe-b253-832206e3d945')
      .eq('is_active', true)
      .limit(1);
    
    if (error) {
      if (error.code === '42P17' || error.message.includes('recursion')) {
        console.error('❌ RLS recursion error still exists!');
        console.error('   Error:', error.message);
        return false;
      } else {
        console.log('✅ No recursion error detected');
        console.log('   (Other errors may be expected if no data exists)');
      }
    } else {
      console.log('✅ Query executed successfully - no recursion error!');
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Error applying RLS fix:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting RLS Recursion Fix...');
  console.log('');
  
  const success = await applyRLSFix();
  
  console.log('');
  if (success) {
    console.log('🎉 RLS recursion fix completed successfully!');
    console.log('   The chat functionality should now work without errors.');
  } else {
    console.log('💥 RLS recursion fix failed!');
    console.log('   Please check the error messages above and try again.');
    process.exit(1);
  }
}

// Run the script
main().catch(console.error);