#!/usr/bin/env node

/**
 * Comprehensive Test Runner for BeyondRounds
 * 
 * This script provides an organized way to run different test suites
 * with proper reporting and error handling.
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

// ANSI color codes for console output
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

// Test suite configurations
const testSuites = {
  unit: {
    name: 'Unit Tests',
    description: 'Component, Hook, and Utility Tests',
    pattern: 'tests/(components|hooks|lib)',
    color: colors.green,
  },
  integration: {
    name: 'Integration Tests',
    description: 'End-to-end Component Integration Tests',
    pattern: 'tests/integration',
    color: colors.blue,
  },
  api: {
    name: 'API Tests',
    description: 'API Route and Handler Tests',
    pattern: 'tests/api',
    color: colors.magenta,
  },
}

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`)
}

function logHeader(message) {
  const border = '='.repeat(message.length + 4)
  log(border, colors.cyan)
  log(`  ${message}  `, colors.cyan)
  log(border, colors.cyan)
}

function logSubHeader(message) {
  log(`\n${colors.bright}${message}${colors.reset}`)
  log('-'.repeat(message.length))
}

function runCommand(command, description) {
  try {
    log(`\n🚀 ${description}...`, colors.yellow)
    const output = execSync(command, { 
      stdio: 'inherit',
      encoding: 'utf8',
      cwd: process.cwd()
    })
    log(`✅ ${description} completed successfully`, colors.green)
    return true
  } catch (error) {
    log(`❌ ${description} failed`, colors.red)
    if (error.stdout) {
      log(error.stdout, colors.red)
    }
    if (error.stderr) {
      log(error.stderr, colors.red)
    }
    return false
  }
}

function checkTestFiles() {
  const testDirs = ['tests/components', 'tests/hooks', 'tests/lib', 'tests/integration', 'tests/api']
  const results = {}
  
  testDirs.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir)
    if (fs.existsSync(fullPath)) {
      const files = fs.readdirSync(fullPath, { recursive: true })
        .filter(file => file.endsWith('.test.ts') || file.endsWith('.test.tsx'))
      results[dir] = files.length
    } else {
      results[dir] = 0
    }
  })
  
  return results
}

function displayTestSummary() {
  logSubHeader('Test Suite Summary')
  const testFiles = checkTestFiles()
  
  Object.entries(testFiles).forEach(([dir, count]) => {
    const status = count > 0 ? '✅' : '⚠️'
    log(`${status} ${dir}: ${count} test files`)
  })
  
  const totalTests = Object.values(testFiles).reduce((sum, count) => sum + count, 0)
  log(`\n📊 Total test files: ${totalTests}`, colors.bright)
}

function runTestSuite(suiteKey, options = {}) {
  const suite = testSuites[suiteKey]
  if (!suite) {
    log(`❌ Unknown test suite: ${suiteKey}`, colors.red)
    return false
  }
  
  logSubHeader(`${suite.name} - ${suite.description}`)
  
  const baseCommand = 'npx jest'
  const flags = [
    `--testPathPattern=${suite.pattern}`,
    options.coverage ? '--coverage' : '',
    options.watch ? '--watch' : '',
    options.ci ? '--ci --watchAll=false' : '',
    options.verbose ? '--verbose' : '',
  ].filter(Boolean).join(' ')
  
  const command = `${baseCommand} ${flags}`
  
  return runCommand(command, `Running ${suite.name}`)
}

function runAllTests(options = {}) {
  logHeader('Running All Test Suites')
  
  const results = []
  
  // Run each test suite
  for (const [key, suite] of Object.entries(testSuites)) {
    const success = runTestSuite(key, options)
    results.push({ suite: suite.name, success })
  }
  
  // Summary
  logSubHeader('Test Results Summary')
  results.forEach(({ suite, success }) => {
    const status = success ? '✅' : '❌'
    const color = success ? colors.green : colors.red
    log(`${status} ${suite}`, color)
  })
  
  const allPassed = results.every(r => r.success)
  const totalSuites = results.length
  const passedSuites = results.filter(r => r.success).length
  
  log(`\n📈 Results: ${passedSuites}/${totalSuites} test suites passed`, 
    allPassed ? colors.green : colors.red)
  
  if (!allPassed) {
    log('\n💡 Some tests failed. Run individual suites for more details:', colors.yellow)
    log('   npm run test:unit', colors.cyan)
    log('   npm run test:integration', colors.cyan)
    log('   npm run test:api', colors.cyan)
  }
  
  return allPassed
}

function displayHelp() {
  logHeader('BeyondRounds Test Runner')
  
  log('Usage: node scripts/test-runner.js [command] [options]')
  log('')
  log('Commands:')
  log('  all              Run all test suites')
  log('  unit             Run unit tests only')
  log('  integration      Run integration tests only')
  log('  api              Run API tests only')
  log('  summary          Show test file summary')
  log('  help             Show this help message')
  log('')
  log('Options:')
  log('  --coverage       Generate coverage report')
  log('  --watch          Run in watch mode')
  log('  --ci             Run in CI mode')
  log('  --verbose        Verbose output')
  log('')
  log('Examples:')
  log('  node scripts/test-runner.js all --coverage')
  log('  node scripts/test-runner.js unit --watch')
  log('  node scripts/test-runner.js integration --verbose')
}

function parseArgs() {
  const args = process.argv.slice(2)
  const command = args[0] || 'help'
  const options = {
    coverage: args.includes('--coverage'),
    watch: args.includes('--watch'),
    ci: args.includes('--ci'),
    verbose: args.includes('--verbose'),
  }
  return { command, options }
}

function main() {
  const { command, options } = parseArgs()
  
  logHeader('BeyondRounds Test Suite')
  
  // Show test summary first
  displayTestSummary()
  
  let success = true
  
  switch (command) {
    case 'all':
      success = runAllTests(options)
      break
    case 'unit':
      success = runTestSuite('unit', options)
      break
    case 'integration':
      success = runTestSuite('integration', options)
      break
    case 'api':
      success = runTestSuite('api', options)
      break
    case 'summary':
      // Already displayed above
      break
    case 'help':
    default:
      displayHelp()
      return
  }
  
  // Exit with appropriate code
  if (command !== 'summary' && command !== 'help') {
    log(`\n🏁 Test runner completed`, success ? colors.green : colors.red)
    process.exit(success ? 0 : 1)
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  log(`\n💥 Uncaught Exception: ${error.message}`, colors.red)
  console.error(error.stack)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  log(`\n💥 Unhandled Rejection at: ${promise}`, colors.red)
  log(`Reason: ${reason}`, colors.red)
  process.exit(1)
})

// Run the main function
if (require.main === module) {
  main()
}

module.exports = {
  runTestSuite,
  runAllTests,
  checkTestFiles,
  testSuites,
}


