#!/usr/bin/env node

/**
 * Test Script for Document Verification and Weekly Matching Systems
 *
 * This script tests both systems to ensure they're working correctly
 */

// Add fetch polyfill for Node.js
import fetch from 'node-fetch'
if (!globalThis.fetch) {
  globalThis.fetch = fetch
}

import { createSupabaseServiceClient } from '../src/lib/supabase/service'

const supabase = createSupabaseServiceClient()

async function testDocumentVerificationSystem() {
  console.log('\n🧪 Testing Document Verification System...')
  
  try {
    // Test 1: Check if verification_documents table exists
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'verification_documents')

    if (tablesError) {
      console.log('❌ Error checking tables:', tablesError.message)
      return false
    }

    if (!tables || tables.length === 0) {
      console.log('❌ verification_documents table does not exist')
      return false
    }

    console.log('✅ verification_documents table exists')

    // Test 2: Check table structure
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'verification_documents')
      .eq('table_schema', 'public')

    if (columnsError) {
      console.log('❌ Error checking columns:', columnsError.message)
      return false
    }

    const requiredColumns = ['id', 'profile_id', 'status', 'submitted_at']
    const existingColumns = columns?.map(col => col.column_name) || []
    
    for (const requiredCol of requiredColumns) {
      if (!existingColumns.includes(requiredCol)) {
        console.log(`❌ Missing required column: ${requiredCol}`)
        return false
      }
    }

    console.log('✅ All required columns exist')

    // Test 3: Test API endpoints
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    
    // Test verification API
    const verificationResponse = await fetch(`${baseUrl}/api/verification`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })

    if (!verificationResponse.ok) {
      console.log('❌ Verification API not responding correctly')
      return false
    }

    console.log('✅ Verification API is working')

    // Test admin verification API
    const adminVerificationResponse = await fetch(`${baseUrl}/api/admin/verification`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })

    if (!adminVerificationResponse.ok) {
      console.log('❌ Admin verification API not responding correctly')
      return false
    }

    console.log('✅ Admin verification API is working')

    // Test email notification API
    const emailResponse = await fetch(`${baseUrl}/api/notifications/email`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })

    if (!emailResponse.ok) {
      console.log('❌ Email notification API not responding correctly')
      return false
    }

    console.log('✅ Email notification API is working')

    return true

  } catch (error) {
    console.log('❌ Error testing document verification system:', error)
    return false
  }
}

async function testWeeklyMatchingSystem() {
  console.log('\n🧪 Testing Weekly Matching System...')
  
  try {
    // Test 1: Check if required tables exist
    const requiredTables = ['matches', 'match_members', 'chat_rooms', 'chat_messages', 'notifications']
    
    for (const tableName of requiredTables) {
      const { data: tables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_name', tableName)

      if (tablesError) {
        console.log(`❌ Error checking ${tableName} table:`, tablesError.message)
        return false
      }

      if (!tables || tables.length === 0) {
        console.log(`❌ ${tableName} table does not exist`)
        return false
      }

      console.log(`✅ ${tableName} table exists`)
    }

    // Test 2: Test weekly matching API
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    
    const matchingResponse = await fetch(`${baseUrl}/api/matching/weekly`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })

    if (!matchingResponse.ok) {
      console.log('❌ Weekly matching API not responding correctly')
      return false
    }

    console.log('✅ Weekly matching API is working')

    // Test 3: Test CRON endpoint (without authentication)
    const cronResponse = await fetch(`${baseUrl}/api/cron/weekly-matching`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })

    if (!cronResponse.ok) {
      console.log('❌ CRON endpoint not responding correctly')
      return false
    }

    console.log('✅ CRON endpoint is working')

    // Test 4: Check if vercel.json has CRON configuration
    const fs = require('fs')
    const path = require('path')
    
    try {
      const vercelConfig = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'vercel.json'), 'utf8'))
      
      if (!vercelConfig.crons || vercelConfig.crons.length === 0) {
        console.log('❌ No CRON jobs configured in vercel.json')
        return false
      }

      const weeklyMatchingCron = vercelConfig.crons.find((cron) =>
        cron.path === '/api/cron/weekly-matching'
      )

      if (!weeklyMatchingCron) {
        console.log('❌ Weekly matching CRON job not configured in vercel.json')
        return false
      }

      console.log('✅ CRON job configured in vercel.json')
      console.log(`   Schedule: ${weeklyMatchingCron.schedule}`)

    } catch (error) {
      console.log('❌ Error reading vercel.json:', error)
      return false
    }

    return true

  } catch (error) {
    console.log('❌ Error testing weekly matching system:', error)
    return false
  }
}

async function testEnvironmentVariables() {
  console.log('\n🧪 Testing Environment Variables...')
  
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ]

  const optionalVars = [
    'SMTP_HOST',
    'SMTP_PORT', 
    'SMTP_USER',
    'SMTP_PASS',
    'FROM_EMAIL',
    'CRON_SECRET'
  ]

  let allRequired = true

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      console.log(`❌ Missing required environment variable: ${varName}`)
      allRequired = false
    } else {
      console.log(`✅ ${varName} is set`)
    }
  }

  for (const varName of optionalVars) {
    if (process.env[varName]) {
      console.log(`✅ ${varName} is set`)
    } else {
      console.log(`⚠️ Optional environment variable not set: ${varName}`)
    }
  }

  return allRequired
}

async function runAllTests() {
  console.log('🚀 Starting comprehensive system tests...\n')
  
  const envTest = await testEnvironmentVariables()
  const docTest = await testDocumentVerificationSystem()
  const matchingTest = await testWeeklyMatchingSystem()

  console.log('\n📊 Test Results Summary:')
  console.log('========================')
  console.log(`Environment Variables: ${envTest ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`Document Verification: ${docTest ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`Weekly Matching: ${matchingTest ? '✅ PASS' : '❌ FAIL'}`)

  const allPassed = envTest && docTest && matchingTest
  
  if (allPassed) {
    console.log('\n🎉 All tests passed! Both systems are ready for production.')
    console.log('\n📋 Next Steps:')
    console.log('1. Set up SMTP configuration for email notifications')
    console.log('2. Deploy to Vercel with CRON job enabled')
    console.log('3. Test the systems with real data')
    console.log('4. Monitor logs for any issues')
  } else {
    console.log('\n⚠️ Some tests failed. Please fix the issues before deploying.')
  }

  return allPassed
}

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests()
    .then(success => {
      process.exit(success ? 0 : 1)
    })
    .catch(error => {
      console.error('❌ Test execution failed:', error)
      process.exit(1)
    })
}

export { testDocumentVerificationSystem, testWeeklyMatchingSystem, testEnvironmentVariables }



