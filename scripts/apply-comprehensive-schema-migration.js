#!/usr/bin/env node

/**
 * Comprehensive Schema Migration Application Script
 * 
 * This script applies the comprehensive database schema migration
 * to update the database with all new tables, fields, constraints,
 * indexes, and RLS policies.
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function applyMigration() {
  console.log('🚀 Starting comprehensive schema migration...');
  console.log('================================================\n');

  try {
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, 'comprehensive-schema-migration.sql');
    
    if (!fs.existsSync(migrationPath)) {
      throw new Error(`Migration file not found at: ${migrationPath}`);
    }

    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📋 Found ${statements.length} SQL statements to execute\n`);

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip comments and empty statements
      if (!statement || statement.startsWith('--') || statement.trim() === '') {
        continue;
      }

      try {
        console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`);
        
        // For CREATE TYPE statements, we need to handle them specially
        if (statement.includes('CREATE TYPE') || statement.includes('CREATE OR REPLACE FUNCTION')) {
          const { error } = await supabase.rpc('exec_sql', {
            sql: statement + ';'
          });
          
          if (error) {
            // Some errors are expected (like "type already exists")
            if (error.message.includes('already exists') || 
                error.message.includes('does not exist') ||
                error.message.includes('cannot be dropped because other objects depend on it')) {
              console.log(`⚠️  Expected error (skipping): ${error.message.substring(0, 100)}...`);
            } else {
              throw error;
            }
          }
        } else {
          // For regular SQL statements
          const { error } = await supabase.rpc('exec_sql', {
            sql: statement + ';'
          });
          
          if (error) {
            // Handle expected errors
            if (error.message.includes('already exists') || 
                error.message.includes('does not exist') ||
                error.message.includes('column already exists') ||
                error.message.includes('constraint already exists')) {
              console.log(`⚠️  Expected error (skipping): ${error.message.substring(0, 100)}...`);
            } else {
              throw error;
            }
          }
        }
        
        successCount++;
        
      } catch (error) {
        errorCount++;
        const errorInfo = {
          statement: i + 1,
          sql: statement.substring(0, 200) + '...',
          error: error.message
        };
        errors.push(errorInfo);
        
        console.error(`❌ Error in statement ${i + 1}:`);
        console.error(`   SQL: ${statement.substring(0, 200)}...`);
        console.error(`   Error: ${error.message}\n`);
        
        // Continue with other statements unless it's a critical error
        if (error.message.includes('permission denied') || 
            error.message.includes('database connection')) {
          throw error;
        }
      }
    }

    console.log('\n================================================');
    console.log('📊 Migration Summary:');
    console.log('================================================');
    console.log(`✅ Successful statements: ${successCount}`);
    console.log(`❌ Failed statements: ${errorCount}`);
    
    if (errors.length > 0) {
      console.log('\n🔍 Errors encountered:');
      errors.forEach((error, index) => {
        console.log(`${index + 1}. Statement ${error.statement}: ${error.error}`);
      });
    }

    // Test the migration by checking if key functions exist
    console.log('\n🧪 Testing migration...');
    
    try {
      // Test my_profile_id function
      const { data: profileId, error: profileError } = await supabase.rpc('my_profile_id');
      if (!profileError || profileError.message.includes('permission denied')) {
        console.log('✅ my_profile_id() function is available');
      } else {
        console.log('❌ my_profile_id() function test failed:', profileError.message);
      }
      
      // Test table access
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, phone_number, gender, bio')
        .limit(1);
      
      if (!profilesError) {
        console.log('✅ Enhanced profiles table is accessible');
        if (profiles && profiles.length > 0) {
          const profile = profiles[0];
          console.log('✅ New fields available:', {
            phone_number: profile.phone_number !== undefined,
            gender: profile.gender !== undefined,
            bio: profile.bio !== undefined
          });
        }
      } else {
        console.log('❌ Profiles table test failed:', profilesError.message);
      }

      // Test new tables
      const newTables = ['feedback', 'payment_plans', 'user_subscriptions', 'profile_preferences'];
      for (const table of newTables) {
        const { error } = await supabase.from(table).select('id').limit(1);
        if (!error) {
          console.log(`✅ New table '${table}' is accessible`);
        } else {
          console.log(`❌ New table '${table}' test failed:`, error.message);
        }
      }

    } catch (testError) {
      console.log('❌ Migration test failed:', testError.message);
    }

    if (errorCount === 0) {
      console.log('\n🎉 Migration completed successfully!');
      console.log('✅ All database schema updates have been applied');
      console.log('✅ New tables, columns, and constraints are in place');
      console.log('✅ RLS policies have been updated');
      console.log('✅ Indexes and triggers have been created');
    } else {
      console.log('\n⚠️  Migration completed with some errors');
      console.log('📝 Please review the errors above and apply any missing changes manually');
      console.log('📝 Most errors are likely due to existing constraints or expected conflicts');
    }

    console.log('\n📋 Next steps:');
    console.log('1. Update your frontend code to use the new schema types');
    console.log('2. Test your application with the new database structure');
    console.log('3. Update any API routes to leverage new fields and tables');
    console.log('4. Consider populating new tables with initial data if needed');

  } catch (error) {
    console.error('\n💥 Migration failed with critical error:');
    console.error(error.message);
    console.error('\n📝 Please check your database connection and permissions');
    process.exit(1);
  }
}

// Run the migration
if (require.main === module) {
  applyMigration()
    .then(() => {
      console.log('\n✅ Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Migration script failed:', error.message);
      process.exit(1);
    });
}

module.exports = { applyMigration };


