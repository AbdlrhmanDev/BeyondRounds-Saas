const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function addPhoneNumberColumn() {
  console.log('📱 Adding phone_number column to profiles table...')
  
  try {
    // SQL to add phone_number column
    const sql = `
      -- Add phone_number column to profiles table
      ALTER TABLE profiles 
      ADD COLUMN phone_number VARCHAR(20);
      
      -- Add a comment to describe the column
      COMMENT ON COLUMN profiles.phone_number IS 'User phone number for contact purposes';
      
      -- Create an index for phone number lookups (optional)
      CREATE INDEX IF NOT EXISTS idx_profiles_phone_number ON profiles(phone_number);
    `

    console.log('🔧 Executing SQL...')
    console.log('SQL:', sql)

    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql })

    if (error) {
      console.error('❌ Error executing SQL:', error.message)
      console.log('\n📝 Manual Instructions:')
      console.log('1. Go to your Supabase Dashboard')
      console.log('2. Navigate to SQL Editor')
      console.log('3. Copy and paste this SQL:')
      console.log('=' .repeat(50))
      console.log(sql)
      console.log('=' .repeat(50))
      console.log('4. Click "Run"')
      return
    }

    console.log('✅ Successfully added phone_number column!')
    console.log('📊 Result:', data)

    // Test the column was added
    console.log('\n🧪 Testing the new column...')
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, phone_number')
      .limit(1)

    if (testError) {
      console.error('❌ Error testing column:', testError.message)
    } else {
      console.log('✅ Column test successful!')
      console.log('📊 Test data:', testData)
    }

  } catch (error) {
    console.error('💥 Unexpected error:', error.message)
    console.log('\n📝 Manual Instructions:')
    console.log('1. Go to your Supabase Dashboard')
    console.log('2. Navigate to SQL Editor')
    console.log('3. Copy and paste this SQL:')
    console.log('=' .repeat(50))
    console.log('ALTER TABLE profiles ADD COLUMN phone_number VARCHAR(20);')
    console.log('=' .repeat(50))
    console.log('4. Click "Run"')
  }
}

addPhoneNumberColumn()


