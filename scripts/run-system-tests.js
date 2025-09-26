#!/usr/bin/env node

/**
 * System Test Runner for BeyondRounds
 * 
 * This script runs comprehensive system tests to validate:
 * - Authentication system
 * - Profile management
 * - Matching algorithm
 * - Chat system
 * - API endpoints
 * - Database operations
 * - UI components
 * - Error handling
 * - Performance
 * - Security
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logSection(title) {
  console.log('\n' + '='.repeat(60))
  log(title, 'cyan')
  console.log('='.repeat(60))
}

function logSubSection(title) {
  console.log('\n' + '-'.repeat(40))
  log(title, 'yellow')
  console.log('-'.repeat(40))
}

function runCommand(command, description) {
  try {
    log(`\n${description}...`, 'blue')
    const output = execSync(command, { 
      encoding: 'utf8', 
      stdio: 'pipe',
      cwd: process.cwd()
    })
    log(`✅ ${description} completed successfully`, 'green')
    return { success: true, output }
  } catch (error) {
    log(`❌ ${description} failed:`, 'red')
    log(error.message, 'red')
    return { success: false, error: error.message }
  }
}

function checkFileExists(filePath) {
  return fs.existsSync(path.join(process.cwd(), filePath))
}

function validateEnvironment() {
  logSection('Environment Validation')
  
  const requiredFiles = [
    'package.json',
    'jest.config.js',
    'tsconfig.json',
    'tests/system-comprehensive.test.tsx',
  ]
  
  const missingFiles = requiredFiles.filter(file => !checkFileExists(file))
  
  if (missingFiles.length > 0) {
    log('❌ Missing required files:', 'red')
    missingFiles.forEach(file => log(`  - ${file}`, 'red'))
    return false
  }
  
  log('✅ All required files present', 'green')
  
  // Check environment variables
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ]
  
  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar])
  
  if (missingEnvVars.length > 0) {
    log('⚠️  Missing environment variables (tests will use mocks):', 'yellow')
    missingEnvVars.forEach(envVar => log(`  - ${envVar}`, 'yellow'))
  } else {
    log('✅ Environment variables configured', 'green')
  }
  
  return true
}

function runSystemTests() {
  logSection('BeyondRounds System Test Suite')
  log('Running comprehensive system validation...', 'bright')
  
  const testResults = []
  
  // 1. Type checking
  logSubSection('TypeScript Type Checking')
  const typeCheckResult = runCommand(
    'npx tsc --noEmit --skipLibCheck',
    'TypeScript type checking'
  )
  testResults.push({ name: 'TypeScript', ...typeCheckResult })
  
  // 2. Linting
  logSubSection('Code Linting')
  const lintResult = runCommand(
    'npm run lint',
    'ESLint code analysis'
  )
  testResults.push({ name: 'Linting', ...lintResult })
  
  // 3. Unit tests
  logSubSection('Unit Tests')
  const unitTestResult = runCommand(
    'npm run test:unit -- --passWithNoTests',
    'Unit tests'
  )
  testResults.push({ name: 'Unit Tests', ...unitTestResult })
  
  // 4. Integration tests
  logSubSection('Integration Tests')
  const integrationTestResult = runCommand(
    'npm run test:integration -- --passWithNoTests',
    'Integration tests'
  )
  testResults.push({ name: 'Integration Tests', ...integrationTestResult })
  
  // 5. API tests
  logSubSection('API Tests')
  const apiTestResult = runCommand(
    'npm run test:api -- --passWithNoTests',
    'API endpoint tests'
  )
  testResults.push({ name: 'API Tests', ...apiTestResult })
  
  // 6. Database tests
  logSubSection('Database Tests')
  const dbTestResult = runCommand(
    'npm run test:database -- --passWithNoTests',
    'Database operation tests'
  )
  testResults.push({ name: 'Database Tests', ...dbTestResult })
  
  // 7. Comprehensive system tests
  logSubSection('Comprehensive System Tests')
  const systemTestResult = runCommand(
    'npx jest tests/system-comprehensive.test.tsx --verbose --coverage',
    'Comprehensive system tests'
  )
  testResults.push({ name: 'System Tests', ...systemTestResult })
  
  // 8. Performance tests
  logSubSection('Performance Tests')
  const performanceTestResult = runCommand(
    'npm run test:performance -- --passWithNoTests',
    'Performance tests'
  )
  testResults.push({ name: 'Performance Tests', ...performanceTestResult })
  
  return testResults
}

function generateTestReport(results) {
  logSection('Test Results Summary')
  
  const passed = results.filter(r => r.success).length
  const failed = results.filter(r => !r.success).length
  const total = results.length
  
  log(`\nTotal Tests: ${total}`, 'bright')
  log(`Passed: ${passed}`, 'green')
  log(`Failed: ${failed}`, failed > 0 ? 'red' : 'green')
  
  console.log('\nDetailed Results:')
  console.log('================')
  
  results.forEach(result => {
    const status = result.success ? '✅ PASS' : '❌ FAIL'
    const color = result.success ? 'green' : 'red'
    log(`${status} ${result.name}`, color)
    
    if (!result.success && result.error) {
      log(`   Error: ${result.error}`, 'red')
    }
  })
  
  // Generate coverage report if available
  if (fs.existsSync('coverage/lcov-report/index.html')) {
    log('\n📊 Coverage report generated: coverage/lcov-report/index.html', 'cyan')
  }
  
  return { passed, failed, total }
}

function runQuickHealthCheck() {
  logSection('Quick Health Check')
  
  const healthChecks = [
    {
      name: 'Node.js Version',
      check: () => {
        const version = process.version
        const majorVersion = parseInt(version.slice(1).split('.')[0])
        return majorVersion >= 18
      }
    },
    {
      name: 'Package Dependencies',
      check: () => {
        try {
          require('package.json')
          return true
        } catch {
          return false
        }
      }
    },
    {
      name: 'Test Configuration',
      check: () => {
        return checkFileExists('jest.config.js') && checkFileExists('tests/system-comprehensive.test.tsx')
      }
    },
    {
      name: 'TypeScript Configuration',
      check: () => {
        return checkFileExists('tsconfig.json')
      }
    }
  ]
  
  let allHealthy = true
  
  healthChecks.forEach(check => {
    const isHealthy = check.check()
    const status = isHealthy ? '✅' : '❌'
    const color = isHealthy ? 'green' : 'red'
    
    log(`${status} ${check.name}`, color)
    
    if (!isHealthy) {
      allHealthy = false
    }
  })
  
  return allHealthy
}

function main() {
  const args = process.argv.slice(2)
  const isQuickCheck = args.includes('--quick') || args.includes('-q')
  // const isVerbose = args.includes('--verbose') || args.includes('-v') // TODO: Implement verbose mode
  
  log('🚀 BeyondRounds System Test Runner', 'bright')
  log(`Started at: ${new Date().toISOString()}`, 'blue')
  
  try {
    // Quick health check
    if (isQuickCheck) {
      const isHealthy = runQuickHealthCheck()
      process.exit(isHealthy ? 0 : 1)
    }
    
    // Full system test
    const isEnvValid = validateEnvironment()
    if (!isEnvValid) {
      log('\n❌ Environment validation failed. Please fix the issues above.', 'red')
      process.exit(1)
    }
    
    const results = runSystemTests()
    const summary = generateTestReport(results)
    
    logSection('Final Summary')
    
    if (summary.failed === 0) {
      log('🎉 All tests passed! System is healthy.', 'green')
      log('✅ BeyondRounds is ready for deployment.', 'green')
    } else {
      log(`⚠️  ${summary.failed} test(s) failed. Please review the issues above.`, 'yellow')
      log('🔧 Fix the failing tests before deployment.', 'yellow')
    }
    
    log(`\nCompleted at: ${new Date().toISOString()}`, 'blue')
    
    // Exit with appropriate code
    process.exit(summary.failed > 0 ? 1 : 0)
    
  } catch (error) {
    log(`\n💥 Unexpected error: ${error.message}`, 'red')
    log('Stack trace:', 'red')
    console.error(error.stack)
    process.exit(1)
  }
}

// Handle command line arguments
if (require.main === module) {
  main()
}

module.exports = {
  runSystemTests,
  generateTestReport,
  runQuickHealthCheck,
  validateEnvironment
}
