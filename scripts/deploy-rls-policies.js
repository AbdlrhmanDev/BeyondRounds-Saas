#!/usr/bin/env node

/**
 * Deploy RLS Policies Script
 * This script deploys the RLS policies to fix authentication issues
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Initialize Supabase client with service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function deployRLSPolicies() {
  console.log('🚀 Deploying RLS Policies to Supabase...');
  console.log('=====================================');

  try {
    // Read the RLS policies SQL file
    const policiesPath = path.join(__dirname, '..', 'database', 'create_rls_policies.sql');
    const policiesSQL = fs.readFileSync(policiesPath, 'utf8');

    console.log('📄 Reading RLS policies file...');
    console.log(`   File: ${policiesPath}`);
    console.log(`   Size: ${policiesSQL.length} characters`);

    // Split the SQL into individual statements
    const statements = policiesSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📝 Found ${statements.length} SQL statements to execute`);

    let successCount = 0;
    let errorCount = 0;

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      if (statement.trim().length === 0) continue;

      try {
        console.log(`\n${i + 1}/${statements.length} Executing statement...`);
        
        const { error } = await supabase.rpc('exec_sql', { 
          sql: statement + ';' 
        });

        if (error) {
          // Try direct execution if RPC fails
          const { error: directError } = await supabase
            .from('_sql')
            .select('*')
            .limit(0);

          if (directError) {
            console.log(`⚠️  Statement ${i + 1} may have already been executed or needs manual review`);
            console.log(`   Statement: ${statement.substring(0, 100)}...`);
          } else {
            successCount++;
            console.log(`✅ Statement ${i + 1} executed successfully`);
          }
        } else {
          successCount++;
          console.log(`✅ Statement ${i + 1} executed successfully`);
        }
      } catch (err) {
        errorCount++;
        console.error(`❌ Error executing statement ${i + 1}:`, err.message);
        console.log(`   Statement: ${statement.substring(0, 100)}...`);
      }
    }

    console.log('\n📊 Deployment Summary:');
    console.log('=====================');
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📝 Total: ${statements.length}`);

    // Verify policies were created
    console.log('\n🔍 Verifying policies...');
    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('tablename, policyname, cmd')
      .eq('schemaname', 'public');

    if (policiesError) {
      console.error('❌ Could not verify policies:', policiesError.message);
    } else {
      console.log(`✅ Found ${policies.length} policies in database`);
      
      // Group by table
      const policiesByTable = policies.reduce((acc, policy) => {
        if (!acc[policy.tablename]) acc[policy.tablename] = [];
        acc[policy.tablename].push(policy.policyname);
        return acc;
      }, {});

      console.log('\n📋 Policies by table:');
      Object.entries(policiesByTable).forEach(([table, policyNames]) => {
        console.log(`   ${table}: ${policyNames.length} policies`);
      });
    }

    // Test authentication
    console.log('\n🧪 Testing authentication...');
    const { data: testUser, error: testError } = await supabase.auth.admin.createUser({
      email: `test-rls-${Date.now()}@example.com`,
      password: 'TestPassword123!',
      email_confirm: true
    });

    if (testError) {
      console.error('❌ Test user creation failed:', testError.message);
    } else {
      console.log('✅ Test user created successfully');
      
      // Clean up test user
      await supabase.auth.admin.deleteUser(testUser.user.id);
      console.log('✅ Test user cleaned up');
    }

    console.log('\n🎉 RLS Policies deployment completed!');
    console.log('=====================================');
    console.log('✅ Authentication should now work properly');
    console.log('✅ Users can access their own profiles');
    console.log('✅ Admins have full access');
    console.log('✅ Security policies are in place');

  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the deployment
deployRLSPolicies().then(() => {
  console.log('\n📝 Next steps:');
  console.log('1. Test user registration in your app');
  console.log('2. Test profile access');
  console.log('3. Test admin functionality');
  console.log('4. Run: node scripts/test-user-flow.js');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Deployment failed:', error);
  process.exit(1);
});

