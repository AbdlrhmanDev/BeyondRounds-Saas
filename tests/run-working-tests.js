#!/usr/bin/env node

/**
 * Working Test Runner for BeyondRounds
 * Runs stable, working test suites with proper reporting
 */

const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')

// Test configuration for working tests
const testConfig = {
  // Working test suites
  suites: [
    {
      name: 'Simple Working Tests',
      command: 'npm',
      args: ['test', 'tests/simple-working-test.test.tsx', '--verbose'],
      timeout: 15000,
      critical: true
    },
    {
      name: 'Existing System Tests',
      command: 'npm',
      args: ['test', 'tests/simple-system-test.test.tsx', '--verbose'],
      timeout: 20000,
      critical: false
    }
  ],

  // Output configuration
  output: {
    logFile: 'working-test-results.log',
    reportFile: 'working-test-report.json',
    verbose: true
  }
}

// Color utilities
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
}

// Logging utilities
const logger = {
  log: (message, color = colors.reset) => {
    const timestamp = new Date().toISOString()
    const logMessage = `[${timestamp}] ${message}`
    console.log(`${color}${logMessage}${colors.reset}`)

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
    logger.info(`Starting: ${suite.name}`)

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
      const duration = Date.now() - startTime
      const result = {
        suite: suite.name,
        exitCode: code,
        duration: duration,
        success: code === 0,
        critical: suite.critical,
        stdout: stdout,
        stderr: stderr,
        timestamp: new Date().toISOString()
      }

      if (result.success) {
        logger.success(`${suite.name} ✅ (${duration}ms)`)
      } else {
        logger.error(`${suite.name} ❌ (${duration}ms)`)
      }

      resolve(result)
    })

    child.on('error', (error) => {
      logger.error(`${suite.name} failed to start: ${error.message}`)
      resolve({
        suite: suite.name,
        exitCode: -1,
        success: false,
        critical: suite.critical,
        error: error.message,
        timestamp: new Date().toISOString()
      })
    })
  })
}

/**
 * Parse test results for statistics
 */
function parseTestResults(results) {
  const stats = {
    total: results.length,
    passed: 0,
    failed: 0,
    critical_failed: 0,
    total_duration: 0
  }

  results.forEach(result => {
    stats.total_duration += result.duration || 0

    if (result.success) {
      stats.passed++
    } else {
      stats.failed++
      if (result.critical) {
        stats.critical_failed++
      }
    }
  })

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
    }
  }

  if (testConfig.output.reportFile) {
    fs.writeFileSync(testConfig.output.reportFile, JSON.stringify(report, null, 2))
    logger.info(`Report saved: ${testConfig.output.reportFile}`)
  }

  return report
}

/**
 * Print summary
 */
function printSummary(stats) {
  logger.header('TEST EXECUTION SUMMARY')

  logger.log(`📊 Test Suites: ${stats.passed}/${stats.total} passed`)
  logger.log(`⏱️  Total Duration: ${Math.round(stats.total_duration / 1000)}s`)

  if (stats.critical_failed > 0) {
    logger.error(`🚨 Critical Failures: ${stats.critical_failed}`)
  }

  logger.log('\\n' + '='.repeat(60))
  if (stats.critical_failed === 0) {
    logger.success('🎉 ALL CRITICAL TESTS PASSING!')
  } else {
    logger.error('🚫 CRITICAL TEST FAILURES DETECTED!')
  }
  logger.log('='.repeat(60))
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

  logger.header('BEYONDROUNDS WORKING TEST RUNNER')
  logger.info(`Running ${testConfig.suites.length} working test suites`)

  try {
    const results = []

    // Run test suites sequentially
    for (const suite of testConfig.suites) {
      const result = await runTestSuite(suite)
      results.push(result)

      // Short break between suites
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    // Generate statistics and report
    const stats = parseTestResults(results)
    generateReport(results, stats)
    printSummary(stats)

    const totalTime = Date.now() - startTime
    logger.info(`Total execution time: ${Math.round(totalTime / 1000)}s`)

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
BeyondRounds Working Test Runner

Usage: node run-working-tests.js [options]

Options:
  --help, -h          Show this help message
  --quiet, -q         Run in quiet mode
  --critical-only     Run critical tests only

Examples:
  node run-working-tests.js                 # Run all working tests
  node run-working-tests.js --quiet         # Run quietly
  node run-working-tests.js --critical-only # Critical tests only
`)
  process.exit(0)
}

if (args.includes('--quiet') || args.includes('-q')) {
  testConfig.output.verbose = false
}

if (args.includes('--critical-only')) {
  testConfig.suites = testConfig.suites.filter(suite => suite.critical)
  logger.info('Critical tests only mode')
}

// Start execution
if (require.main === module) {
  main()
}

module.exports = { runTestSuite, parseTestResults, generateReport }