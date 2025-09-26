#!/usr/bin/env node

/**
 * Master Test Runner for BeyondRounds
 * Runs all test suites and provides comprehensive reporting
 */

const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')

// Test configuration
const testConfig = {
  // Test suites to run
  suites: [
    {
      name: 'Complete System Test',
      command: 'npm',
      args: ['test', 'tests/complete-system-test.test.tsx', '--verbose'],
      timeout: 30000,
      critical: true
    },
    {
      name: 'Unit Tests - Core Functionality',
      command: 'npm',
      args: ['test', 'tests/unit/core-functionality.test.tsx', '--verbose'],
      timeout: 20000,
      critical: true
    },
    {
      name: 'Integration Tests - Full System',
      command: 'npm',
      args: ['test', 'tests/integration/full-system-integration.test.tsx', '--verbose'],
      timeout: 30000,
      critical: true
    },
    {
      name: 'API Endpoint Tests',
      command: 'npm',
      args: ['test', 'tests/api/api-endpoints.test.tsx', '--verbose'],
      timeout: 20000,
      critical: true
    },
    {
      name: 'Existing System Tests',
      command: 'npm',
      args: ['test', 'tests/simple-system-test.test.tsx', '--verbose'],
      timeout: 25000,
      critical: false
    },
    {
      name: 'Master System Test',
      command: 'npm',
      args: ['test', 'tests/master-system-test.test.tsx', '--verbose'],
      timeout: 25000,
      critical: false
    }
  ],

  // Coverage thresholds
  coverage: {
    statements: 50,
    branches: 50,
    functions: 50,
    lines: 50
  },

  // Output configuration
  output: {
    logFile: 'test-results.log',
    reportFile: 'test-report.json',
    verbose: true
  }
}

/**
 * Color utilities for console output
 */
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
}

/**
 * Logging utilities
 */
const logger = {
  log: (message, color = colors.reset) => {
    const timestamp = new Date().toISOString()
    const logMessage = `[${timestamp}] ${message}`
    console.log(`${color}${logMessage}${colors.reset}`)

    // Write to log file
    if (testConfig.output.logFile) {
      fs.appendFileSync(testConfig.output.logFile, logMessage + '\\n')
    }
  },

  info: (message) => logger.log(`ℹ️  ${message}`, colors.blue),
  success: (message) => logger.log(`✅ ${message}`, colors.green),
  warning: (message) => logger.log(`⚠️  ${message}`, colors.yellow),
  error: (message) => logger.log(`❌ ${message}`, colors.red),
  header: (message) => logger.log(`\\n🚀 ${message}\\n${'='.repeat(50)}`, colors.cyan + colors.bright)
}

/**
 * Run a single test suite
 */
async function runTestSuite(suite) {
  return new Promise((resolve) => {
    logger.info(`Starting test suite: ${suite.name}`)

    const startTime = Date.now()
    const child = spawn(suite.command, suite.args, {
      stdio: 'pipe',
      shell: true,
      timeout: suite.timeout
    })

    let stdout = ''
    let stderr = ''

    child.stdout.on('data', (data) => {
      stdout += data.toString()
      if (testConfig.output.verbose) {
        process.stdout.write(data)
      }
    })

    child.stderr.on('data', (data) => {
      stderr += data.toString()
      if (testConfig.output.verbose) {
        process.stderr.write(data)
      }
    })

    child.on('close', (code) => {
      const endTime = Date.now()
      const duration = endTime - startTime

      const result = {
        suite: suite.name,
        command: `${suite.command} ${suite.args.join(' ')}`,
        exitCode: code,
        duration: duration,
        success: code === 0,
        critical: suite.critical,
        stdout: stdout,
        stderr: stderr,
        timestamp: new Date().toISOString()
      }

      if (result.success) {
        logger.success(`${suite.name} completed successfully in ${duration}ms`)
      } else {
        logger.error(`${suite.name} failed with exit code ${code} after ${duration}ms`)
        if (stderr) {
          logger.error(`Error output: ${stderr.substring(0, 500)}`)
        }
      }

      resolve(result)
    })

    child.on('error', (error) => {
      const result = {
        suite: suite.name,
        command: `${suite.command} ${suite.args.join(' ')}`,
        exitCode: -1,
        duration: Date.now() - startTime,
        success: false,
        critical: suite.critical,
        error: error.message,
        timestamp: new Date().toISOString()
      }

      logger.error(`${suite.name} failed to start: ${error.message}`)
      resolve(result)
    })
  })
}

/**
 * Parse test output for statistics
 */
function parseTestResults(results) {
  const stats = {
    total: results.length,
    passed: 0,
    failed: 0,
    critical_failed: 0,
    total_duration: 0,
    coverage: null
  }

  let totalTests = 0
  let passedTests = 0

  results.forEach(result => {
    stats.total_duration += result.duration

    if (result.success) {
      stats.passed++
    } else {
      stats.failed++
      if (result.critical) {
        stats.critical_failed++
      }
    }

    // Parse test counts from output
    if (result.stdout) {
      const testMatch = result.stdout.match(/(\\d+) passing/)
      if (testMatch) {
        passedTests += parseInt(testMatch[1])
      }

      const totalMatch = result.stdout.match(/Tests:\\s*(\\d+) passed/)
      if (totalMatch) {
        totalTests += parseInt(totalMatch[1])
      }
    }
  })

  stats.test_cases = {
    total: totalTests,
    passed: passedTests,
    failed: totalTests - passedTests
  }

  return stats
}

/**
 * Generate test report
 */
function generateReport(results, stats) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: stats,
    suites: results,
    environment: {
      node_version: process.version,
      platform: process.platform,
      cwd: process.cwd()
    },
    recommendations: generateRecommendations(results, stats)
  }

  if (testConfig.output.reportFile) {
    fs.writeFileSync(testConfig.output.reportFile, JSON.stringify(report, null, 2))
    logger.info(`Test report saved to ${testConfig.output.reportFile}`)
  }

  return report
}

/**
 * Generate recommendations based on results
 */
function generateRecommendations(results, stats) {
  const recommendations = []

  if (stats.critical_failed > 0) {
    recommendations.push({
      level: 'critical',
      message: `${stats.critical_failed} critical test suite(s) failed. These must be fixed before deployment.`
    })
  }

  if (stats.failed > 0 && stats.critical_failed === 0) {
    recommendations.push({
      level: 'warning',
      message: `${stats.failed} non-critical test suite(s) failed. Consider fixing these for better reliability.`
    })
  }

  if (stats.passed === stats.total) {
    recommendations.push({
      level: 'success',
      message: 'All test suites passed! System is ready for deployment.'
    })
  }

  // Performance recommendations
  const averageDuration = stats.total_duration / stats.total
  if (averageDuration > 20000) {
    recommendations.push({
      level: 'info',
      message: `Average test suite duration is ${Math.round(averageDuration)}ms. Consider optimizing slow tests.`
    })
  }

  return recommendations
}

/**
 * Print final summary
 */
function printSummary(stats, recommendations) {
  logger.header('TEST EXECUTION SUMMARY')

  logger.log(`📊 Test Suites: ${stats.passed}/${stats.total} passed`)
  if (stats.test_cases.total > 0) {
    logger.log(`📋 Test Cases: ${stats.test_cases.passed}/${stats.test_cases.total} passed`)
  }
  logger.log(`⏱️  Total Duration: ${Math.round(stats.total_duration / 1000)}s`)

  if (stats.critical_failed > 0) {
    logger.error(`🚨 Critical Failures: ${stats.critical_failed}`)
  }

  logger.log('\\n📋 RECOMMENDATIONS:')
  recommendations.forEach(rec => {
    const icon = {
      critical: '🚨',
      warning: '⚠️',
      success: '✅',
      info: 'ℹ️'
    }[rec.level] || 'ℹ️'

    const color = {
      critical: colors.red,
      warning: colors.yellow,
      success: colors.green,
      info: colors.blue
    }[rec.level] || colors.reset

    logger.log(`${icon} ${rec.message}`, color)
  })

  // Final verdict
  logger.log('\\n' + '='.repeat(60))
  if (stats.critical_failed === 0) {
    logger.success('🎉 SYSTEM READY - All critical tests passing!')
  } else {
    logger.error('🚫 SYSTEM NOT READY - Critical test failures detected!')
  }
  logger.log('='.repeat(60))
}

/**
 * Check system requirements
 */
async function checkSystemRequirements() {
  logger.info('Checking system requirements...')

  // Check if package.json exists
  if (!fs.existsSync('package.json')) {
    logger.error('package.json not found. Run from project root directory.')
    process.exit(1)
  }

  // Check if jest.config.js exists
  if (!fs.existsSync('jest.config.js')) {
    logger.warning('jest.config.js not found. Using default configuration.')
  }

  // Check if test files exist
  let missingTests = 0
  testConfig.suites.forEach(suite => {
    const testFile = suite.args.find(arg => arg.includes('.test.'))
    if (testFile && !fs.existsSync(testFile)) {
      logger.warning(`Test file not found: ${testFile}`)
      missingTests++
    }
  })

  if (missingTests > 0) {
    logger.warning(`${missingTests} test files are missing but will continue anyway.`)
  }

  logger.success('System requirements check completed')
}

/**
 * Main execution function
 */
async function main() {
  const startTime = Date.now()

  // Clear previous logs
  if (fs.existsSync(testConfig.output.logFile)) {
    fs.unlinkSync(testConfig.output.logFile)
  }

  logger.header('BEYONDROUNDS COMPREHENSIVE TEST SUITE')
  logger.info(`Starting test execution with ${testConfig.suites.length} test suites`)

  try {
    // Check system requirements
    await checkSystemRequirements()

    // Run all test suites
    logger.info('\\nExecuting test suites...')
    const results = []

    for (const suite of testConfig.suites) {
      const result = await runTestSuite(suite)
      results.push(result)

      // Short break between suites
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    // Calculate statistics
    const stats = parseTestResults(results)

    // Generate report
    const report = generateReport(results, stats)

    // Print summary
    printSummary(stats, report.recommendations)

    const totalTime = Date.now() - startTime
    logger.info(`\\nTotal execution time: ${Math.round(totalTime / 1000)}s`)

    // Exit with appropriate code
    process.exit(stats.critical_failed > 0 ? 1 : 0)

  } catch (error) {
    logger.error(`Test execution failed: ${error.message}`)
    console.error(error)
    process.exit(1)
  }
}

// Handle CLI arguments
const args = process.argv.slice(2)
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
BeyondRounds Test Runner

Usage: node run-all-tests.js [options]

Options:
  --help, -h          Show this help message
  --quiet, -q         Run in quiet mode (less verbose output)
  --fast              Skip non-critical tests
  --coverage          Run with coverage report

Examples:
  node run-all-tests.js                 # Run all tests
  node run-all-tests.js --quiet         # Run quietly
  node run-all-tests.js --fast          # Run critical tests only
  node run-all-tests.js --coverage      # Run with coverage
`)
  process.exit(0)
}

if (args.includes('--quiet') || args.includes('-q')) {
  testConfig.output.verbose = false
}

if (args.includes('--fast')) {
  testConfig.suites = testConfig.suites.filter(suite => suite.critical)
  logger.info('Fast mode: Running critical tests only')
}

if (args.includes('--coverage')) {
  testConfig.suites.forEach(suite => {
    if (!suite.args.includes('--coverage')) {
      suite.args.push('--coverage')
    }
  })
  logger.info('Coverage mode: Including coverage reports')
}

// Start the test execution
if (require.main === module) {
  main()
}

module.exports = { runTestSuite, parseTestResults, generateReport }