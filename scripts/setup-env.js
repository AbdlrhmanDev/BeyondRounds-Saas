const fs = require('fs')
const path = require('path')

console.log('🔧 Setting up environment variables for BeyondRounds...')

// Check if .env.local already exists
const envPath = path.join(__dirname, '..', '.env.local')
if (fs.existsSync(envPath)) {
  console.log('✅ .env.local already exists!')
  process.exit(0)
}

// Create .env.local from env.example
const envExamplePath = path.join(__dirname, '..', 'env.example')
if (!fs.existsSync(envExamplePath)) {
  console.error('❌ env.example file not found!')
  process.exit(1)
}

const envExample = fs.readFileSync(envExamplePath, 'utf8')
fs.writeFileSync(envPath, envExample)

console.log('✅ Created .env.local file from env.example')
console.log('')
console.log('📝 NEXT STEPS:')
console.log('1. Open .env.local file')
console.log('2. Replace the placeholder values with your actual Supabase credentials:')
console.log('   - NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url')
console.log('   - NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key')
console.log('   - SUPABASE_SERVICE_ROLE_KEY=your_service_role_key')
console.log('')
console.log('3. Get these values from your Supabase project:')
console.log('   - Go to https://supabase.com')
console.log('   - Select your project')
console.log('   - Go to Settings > API')
console.log('   - Copy the Project URL and API keys')
console.log('')
console.log('4. After updating .env.local, run: node scripts/create-real-test-data.js')







