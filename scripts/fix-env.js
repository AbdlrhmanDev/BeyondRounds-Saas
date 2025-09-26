#!/usr/bin/env node

/**
 * Environment Variables Fix Script
 * Helps fix the .env.local file by uncommenting the Supabase credentials
 */

const fs = require('fs')
const path = require('path')

const envPath = path.join(process.cwd(), '.env.local')

console.log('🔧 BeyondRounds Environment Variables Fix')
console.log('==========================================\n')

if (!fs.existsSync(envPath)) {
  console.error('❌ .env.local file not found!')
  console.log('Please create a .env.local file with your Supabase credentials.')
  process.exit(1)
}

try {
  let content = fs.readFileSync(envPath, 'utf8')
  
  console.log('📋 Current .env.local content:')
  console.log('==============================')
  
  // Check if Supabase URL is commented out
  const urlMatch = content.match(/#\s*NEXT_PUBLIC_SUPABASE_URL=(.+)/)
  const keyMatch = content.match(/#\s*NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/)
  
  if (urlMatch) {
    console.log('✅ Found Supabase URL (commented out):', urlMatch[1])
  } else {
    console.log('❌ Supabase URL not found or not commented out')
  }
  
  if (keyMatch) {
    console.log('✅ Found Supabase Anon Key (commented out):', keyMatch[1].substring(0, 50) + '...')
  } else {
    console.log('❌ Supabase Anon Key not found or not commented out')
  }
  
  // Uncomment the Supabase variables
  let fixedContent = content
    .replace(/^#\s*NEXT_PUBLIC_SUPABASE_URL=/, 'NEXT_PUBLIC_SUPABASE_URL=')
    .replace(/^#\s*NEXT_PUBLIC_SUPABASE_ANON_KEY=/, 'NEXT_PUBLIC_SUPABASE_ANON_KEY=')
    .replace(/^#\s*NODE_ENV=/, 'NODE_ENV=')
    .replace(/^#\s*NEXT_PUBLIC_APP_URL=/, 'NEXT_PUBLIC_APP_URL=')
  
  // Write the fixed content
  fs.writeFileSync(envPath, fixedContent)
  
  console.log('\n✅ Fixed .env.local file!')
  console.log('📝 Uncommented the following variables:')
  console.log('   - NEXT_PUBLIC_SUPABASE_URL')
  console.log('   - NEXT_PUBLIC_SUPABASE_ANON_KEY')
  console.log('   - NODE_ENV')
  console.log('   - NEXT_PUBLIC_APP_URL')
  
  console.log('\n🚀 Next steps:')
  console.log('1. Restart your development server')
  console.log('2. Run: node scripts/as)
  console.log('3. Test login at: http://localhost:3000/auth/login')
  
} catch (error) {
  console.error('❌ Error fixing .env.local:', error.message)
  process.exit(1)
}
