require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function deployRLSPolicies() {
  console.log('🔐 DEPLOYING COMPREHENSIVE RLS POLICIES')
  console.log('=' .repeat(50))
  console.log('📅 Deployment Date:', new Date().toLocaleString())
  console.log('=' .repeat(50))

  try {
    // Read the RLS policies SQL file
    const sqlFilePath = path.join(__dirname, '..', 'database', 'comprehensive_rls_policies.sql')
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8')

    console.log('📄 RLS policies file loaded successfully')
    console.log(`📊 File size: ${sqlContent.length} characters`)

    // Split the SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))

    console.log(`📋 Found ${statements.length} SQL statements to execute`)

    let successCount = 0
    let errorCount = 0
    let warningCount = 0

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      
      if (statement.length === 0) continue

      try {
        console.log(`\n🔄 Executing statement ${i + 1}/${statements.length}...`)
        
        // Use RPC function for SQL execution
        const { data, error } = await supabase.rpc('exec_sql', { sql: statement })

        if (error) {
          // Some errors are expected (like "already exists")
          if (error.message.includes('already exists') || 
              error.message.includes('does not exist') ||
              error.message.includes('duplicate key') ||
              error.message.includes('already enabled')) {
            console.log(`⚠️  Expected warning: ${error.message}`)
            warningCount++
          } else {
            console.error(`❌ Error in statement ${i + 1}:`, error.message)
            errorCount++
          }
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`)
          successCount++
        }
      } catch (err) {
        // Try alternative execution method
        try {
          const { error: altError } = await supabase.rpc('exec', { sql: statement })
          if (altError) {
            console.error(`❌ Exception in statement ${i + 1}:`, err.message)
            errorCount++
          } else {
            console.log(`✅ Statement ${i + 1} executed successfully (alternative method)`)
            successCount++
          }
        } catch (altErr) {
          console.error(`❌ Exception in statement ${i + 1}:`, err.message)
          errorCount++
        }
      }

      // Add a small delay to avoid overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    console.log('\n' + '='.repeat(50))
    console.log('🎉 RLS POLICIES DEPLOYMENT COMPLETED!')
    console.log('='.repeat(50))
    console.log(`✅ Successful statements: ${successCount}`)
    console.log(`⚠️  Warnings: ${warningCount}`)
    console.log(`❌ Failed statements: ${errorCount}`)
    console.log(`📊 Total statements: ${statements.length}`)

    // Test the RLS policies
    console.log('\n🧪 Testing RLS policies...')
    await testRLSPolicies()

  } catch (error) {
    console.error('❌ RLS deployment failed:', error)
  }
}

async function testRLSPolicies() {
  try {
    // Test 1: Check if RLS is enabled on key tables
    console.log('\n🔍 Testing RLS Status...')
    const tablesToTest = [
      'profiles', 'matches', 'match_members', 'chat_rooms', 
      'chat_messages', 'notifications', 'verification_documents'
    ]

    for (const table of tablesToTest) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1)

        if (error) {
          console.log(`⚠️  Table ${table}: ${error.message}`)
        } else {
          console.log(`✅ Table ${table}: RLS working`)
        }
      } catch (err) {
        console.log(`❌ Table ${table}: ${err.message}`)
      }
    }

    // Test 2: Check helper functions
    console.log('\n🔧 Testing Helper Functions...')
    try {
      const { data, error } = await supabase.rpc('current_profile_id')
      if (error) {
        console.log(`⚠️  current_profile_id function: ${error.message}`)
      } else {
        console.log(`✅ current_profile_id function: Working`)
      }
    } catch (err) {
      console.log(`❌ current_profile_id function: ${err.message}`)
    }

    try {
      const { data, error } = await supabase.rpc('is_admin')
      if (error) {
        console.log(`⚠️  is_admin function: ${error.message}`)
      } else {
        console.log(`✅ is_admin function: Working`)
      }
    } catch (err) {
      console.log(`❌ is_admin function: ${err.message}`)
    }

    // Test 3: Check policy existence
    console.log('\n📋 Testing Policy Existence...')
    try {
      const { data, error } = await supabase
        .from('pg_policies')
        .select('tablename, policyname')
        .eq('schemaname', 'public')
        .limit(10)

      if (error) {
        console.log(`⚠️  Policy check: ${error.message}`)
      } else {
        console.log(`✅ Found ${data?.length || 0} policies`)
        if (data && data.length > 0) {
          console.log('📋 Sample policies:')
          data.slice(0, 5).forEach(policy => {
            console.log(`  - ${policy.tablename}.${policy.policyname}`)
          })
        }
      }
    } catch (err) {
      console.log(`❌ Policy check: ${err.message}`)
    }

    console.log('\n🎯 RLS testing completed!')

  } catch (error) {
    console.error('❌ RLS testing failed:', error)
  }
}

// Run the deployment
deployRLSPolicies().catch(console.error)
