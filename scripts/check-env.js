require('dotenv').config()

console.log('🔍 Environment Variables Check:')
console.log('================================')

// Check if .env.local exists
const fs = require('fs')
const path = require('path')

const envPath = path.join(__dirname, '..', '.env.local')
console.log('📁 .env.local path:', envPath)
console.log('📁 .env.local exists:', fs.existsSync(envPath))

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8')
  console.log('📄 .env.local content preview:')
  console.log(envContent.substring(0, 200) + '...')
}

console.log('')
console.log('🔑 Environment Variables:')
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing')
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing')

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.log('')
  console.log('❌ Missing required environment variables!')
  console.log('')
  console.log('📝 To fix this:')
  console.log('1. Open your .env.local file')
  console.log('2. Replace the placeholder values with your actual Supabase credentials')
  console.log('3. Get these from your Supabase project:')
  console.log('   - Go to https://supabase.com')
  console.log('   - Select your project')
  console.log('   - Go to Settings > API')
  console.log('   - Copy the Project URL and Service Role Key')
  console.log('')
  console.log('Example:')
  console.log('NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co')
  console.log('SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...')
} else {
  console.log('')
  console.log('✅ Environment variables are set!')
  console.log('You can now run: node scripts/create-real-test-data.js')
}







