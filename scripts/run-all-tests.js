#!/usr/bin/env node

/**
 * Test Runner Script for BeyondRounds
 *
 * Runs all tests in the correct order and provides comprehensive reporting
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
}

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

const logHeader = (title) => {
  console.log(`\n${colors.bold}${colors.blue}${'='.repeat(60)}${colors.reset}`)
  console.log(`${colors.bold}${colors.blue}  ${title}${colors.reset}`)
  console.log(`${colors.bold}${colors.blue}${'='.repeat(60)}${colors.reset}\n`)
}

const runCommand = (command, description, options = {}) => {
  const { showOutput = true, continueOnError = false } = options

  log(`🚀 ${description}...`, 'cyan')

  try {
    const result = execSync(command, {
      stdio: showOutput ? 'inherit' : 'pipe',
      encoding: 'utf8',
      cwd: process.cwd()
    })

    log(`✅ ${description} completed successfully`, 'green')
    return { success: true, output: result }
  } catch (error) {
    log(`❌ ${description} failed`, 'red')

    if (error.stdout) {
      log('STDOUT:', 'yellow')
      console.log(error.stdout)
    }

    if (error.stderr) {
      log('STDERR:', 'yellow')
      console.log(error.stderr)
    }

    if (!continueOnError) {
      process.exit(1)
    }

    return { success: false, error }
  }
}

const checkFileExists = (filePath) => {
  return fs.existsSync(path.join(process.cwd(), filePath))
}

const getTestFiles = () => {
  const testDir = path.join(process.cwd(), 'tests')
  if (!fs.existsSync(testDir)) {
    return []
  }

  const files = fs.readdirSync(testDir, { recursive: true })
  return files.filter(file => file.endsWith('.test.tsx') || file.endsWith('.test.ts'))
}

const main = async () => {
  logHeader('BEYONDROUNDS COMPREHENSIVE TEST SUITE')

  // Check environment
  log('🔍 Checking test environment...', 'blue')

  const requiredFiles = [
    'package.json',
    'jest.config.js',
    'jest.setup.js',
    'tests/test-environment.js'
  ]

  const missingFiles = requiredFiles.filter(file => !checkFileExists(file))

  if (missingFiles.length > 0) {
    log('❌ Missing required files:', 'red')
    missingFiles.forEach(file => log(`  - ${file}`, 'red'))
    process.exit(1)
  }

  log('✅ All required files present', 'green')

  // Display test files
  const testFiles = getTestFiles()
  log(`\n📋 Found ${testFiles.length} test files:`, 'blue')
  testFiles.forEach(file => log(`  - ${file}`, 'cyan'))

  // Environment variables check
  logHeader('ENVIRONMENT VALIDATION')

  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ]

  const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName])

  if (missingEnvVars.length > 0) {
    log('⚠️ Missing environment variables (will use test defaults):', 'yellow')
    missingEnvVars.forEach(varName => log(`  - ${varName}`, 'yellow'))

    // Set test defaults
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'

    log('✅ Test environment variables set', 'green')
  } else {
    log('✅ All environment variables present', 'green')
  }

  // Run different test suites
  const testSuites = [
    {
      name: 'Type Check',
      command: 'npm run type-check',
      description: 'TypeScript type checking',
      required: true
    },
    {
      name: 'Lint Check',
      command: 'npm run lint',
      description: 'ESLint code quality check',
      required: false
    },
    {
      name: 'Simple System Tests',
      command: 'npx jest tests/simple-system-test.test.tsx --verbose',
      description: 'Core system functionality tests',
      required: true
    },
    {
      name: 'Unit Tests',
      command: 'npx jest --testPathPattern="tests/(components|hooks|lib)" --passWithNoTests',
      description: 'Unit tests for components, hooks, and utilities',
      required: false
    },
    {
      name: 'Integration Tests',
      command: 'npx jest --testPathPattern="tests/integration" --passWithNoTests',
      description: 'Integration tests',
      required: false
    },
    {
      name: 'API Tests',
      command: 'npx jest --testPathPattern="tests/api" --passWithNoTests',
      description: 'API endpoint tests',
      required: false
    }
  ]

  const results = []

  for (const suite of testSuites) {
    logHeader(suite.name.toUpperCase())

    const result = runCommand(
      suite.command,
      suite.description,
      { continueOnError: !suite.required }
    )

    results.push({
      ...suite,
      ...result
    })

    if (!result.success && suite.required) {
      log(`❌ Required test suite "${suite.name}" failed. Stopping execution.`, 'red')
      break
    }
  }

  // Final summary
  logHeader('TEST SUMMARY')

  const successful = results.filter(r => r.success).length
  const total = results.length
  const failed = results.filter(r => !r.success)

  log(`📊 Test Results: ${successful}/${total} suites passed`, successful === total ? 'green' : 'yellow')

  if (failed.length > 0) {
    log('\n❌ Failed test suites:', 'red')
    failed.forEach(suite => {
      log(`  - ${suite.name}: ${suite.description}`, 'red')
    })
  }

  if (successful === total) {
    log('\n🎉 ALL TESTS PASSED! 🎉', 'green')
    log('✅ Your BeyondRounds application is ready for deployment!', 'green')
  } else {
    log('\n⚠️ Some tests failed or were skipped.', 'yellow')
    log('Please review the failures above and fix any issues.', 'yellow')
  }

  // Coverage information
  if (checkFileExists('coverage/lcov.info')) {
    logHeader('COVERAGE INFORMATION')
    log('📈 Coverage report generated in ./coverage/', 'blue')
    log('👉 Open ./coverage/index.html to view detailed coverage report', 'blue')
  }

  // Performance information
  const endTime = Date.now()
  const duration = endTime - startTime
  log(`\n⏱️ Total execution time: ${(duration / 1000).toFixed(2)}s`, 'magenta')

  // Exit with appropriate code
  process.exit(successful === total ? 0 : 1)
}

const startTime = Date.now()

// Handle process termination gracefully
process.on('SIGINT', () => {
  log('\n\n⚠️ Test execution interrupted by user', 'yellow')
  process.exit(130)
})

process.on('uncaughtException', (error) => {
  log('\n❌ Uncaught exception:', 'red')
  console.error(error)
  process.exit(1)
})

// Run the main function
main().catch(error => {
  log('\n❌ Test runner failed:', 'red')
  console.error(error)
  process.exit(1)
})