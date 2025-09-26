#!/usr/bin/env node

/**
 * Full Test Suite Runner for BeyondRounds
 * Runs all test suites including the comprehensive full system test
 */

// Add Node.js global functions for test environment
if (!globalThis.setTimeout) {
  globalThis.setTimeout = require('timers').setTimeout
}

const { spawn } = require('child_process')
const fs = require('fs')

// Complete test suite configuration
const testConfig = {
  suites: [
    {
      name: 'Working Foundation Tests',
      command: 'npm',
      args: ['test', 'tests/simple-working-test.test.tsx', '--verbose'],
      timeout: 20000,
      priority: 'high'
    },
    {
      name: 'System Core Tests',
      command: 'npm',
      args: ['test', 'tests/simple-system-test.test.tsx', '--verbose'],
      timeout: 25000,
      priority: 'high'
    },
    {
      name: 'Full Comprehensive Tests',
      command: 'npm',
      args: ['test', 'tests/full-comprehensive-test.test.tsx', '--verbose', '--testTimeout=30000'],
      timeout: 45000,
      priority: 'critical'
    }
  ],
  output: {
    logFile: 'full-test-results.log',
    reportFile: 'full-test-report.json'
  }
}

// Enhanced logging with emojis and colors
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
  header: (message) => logger.log(`\\n🚀 ${message}\\n${'='.repeat(60)}`, colors.cyan + colors.bright),
  separator: () => logger.log('━'.repeat(60), colors.magenta)
}

/**
 * Enhanced test suite runner
 */
async function runTestSuite(suite) {
  return new Promise((resolve) => {
    logger.info(`🧪 Starting: ${suite.name}`)

    const startTime = Date.now()
    const child = spawn(suite.command, suite.args, {
      stdio: 'pipe',
      shell: true,
      timeout: suite.timeout
    })

    let stdout = ''
    let stderr = ''
    const testResults = {
      passed: 0,
      failed: 0,
      total: 0
    }

    child.stdout.on('data', (data) => {
      const output = data.toString()
      stdout += output

      // Parse Jest output for test results
      const passedMatch = output.match(/(\\d+) passing/)
      const failedMatch = output.match(/(\\d+) failing/)
      const totalMatch = output.match(/Tests:\\s*(\\d+) passed/)

      if (passedMatch) testResults.passed = parseInt(passedMatch[1])
      if (failedMatch) testResults.failed = parseInt(failedMatch[1])
      if (totalMatch) testResults.total = parseInt(totalMatch[1])

      process.stdout.write(output)
    })

    child.stderr.on('data', (data) => {
      stderr += data.toString()
      process.stderr.write(data)
    })

    child.on('close', (code) => {
      const duration = Date.now() - startTime
      const result = {
        suite: suite.name,
        priority: suite.priority,
        exitCode: code,
        duration: duration,
        success: code === 0,
        testResults,
        stdout,
        stderr,
        timestamp: new Date().toISOString()
      }

      if (result.success) {
        logger.success(`${suite.name} completed ✨ (${Math.round(duration/1000)}s)`)
        if (testResults.total > 0) {
          logger.success(`   📊 Tests: ${testResults.passed}/${testResults.total} passed`)
        }
      } else {
        logger.error(`${suite.name} failed ❌ (${Math.round(duration/1000)}s)`)
        if (testResults.failed > 0) {
          logger.error(`   📊 Tests: ${testResults.failed} failed`)
        }
      }

      resolve(result)
    })

    child.on('error', (error) => {
      logger.error(`Failed to start ${suite.name}: ${error.message}`)
      resolve({
        suite: suite.name,
        priority: suite.priority,
        exitCode: -1,
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      })
    })
  })
}

/**
 * Enhanced results analysis
 */
function analyzeResults(results) {
  const stats = {
    total_suites: results.length,
    passed_suites: results.filter(r => r.success).length,
    failed_suites: results.filter(r => !r.success).length,
    critical_failures: results.filter(r => !r.success && r.priority === 'critical').length,
    total_duration: results.reduce((sum, r) => sum + (r.duration || 0), 0),
    total_tests: results.reduce((sum, r) => sum + (r.testResults?.total || 0), 0),
    passed_tests: results.reduce((sum, r) => sum + (r.testResults?.passed || 0), 0),
    failed_tests: results.reduce((sum, r) => sum + (r.testResults?.failed || 0), 0)
  }

  stats.suite_success_rate = stats.passed_suites / stats.total_suites
  stats.test_success_rate = stats.total_tests > 0 ? stats.passed_tests / stats.total_tests : 0

  return stats
}

/**
 * Generate comprehensive report
 */
function generateReport(results, stats) {
  const report = {
    execution_summary: {
      timestamp: new Date().toISOString(),
      total_execution_time: `${Math.round(stats.total_duration / 1000)}s`,
      environment: {
        node_version: process.version,
        platform: process.platform,
        memory_usage: process.memoryUsage()
      }
    },
    test_results: {
      suites: {
        total: stats.total_suites,
        passed: stats.passed_suites,
        failed: stats.failed_suites,
        success_rate: `${Math.round(stats.suite_success_rate * 100)}%`
      },
      individual_tests: {
        total: stats.total_tests,
        passed: stats.passed_tests,
        failed: stats.failed_tests,
        success_rate: `${Math.round(stats.test_success_rate * 100)}%`
      }
    },
    detailed_results: results.map(result => ({
      suite: result.suite,
      priority: result.priority,
      status: result.success ? 'PASSED' : 'FAILED',
      duration: `${Math.round((result.duration || 0) / 1000)}s`,
      tests: result.testResults || { passed: 0, failed: 0, total: 0 }
    })),
    system_status: {
      critical_systems: stats.critical_failures === 0 ? 'OPERATIONAL' : 'DEGRADED',
      overall_health: stats.suite_success_rate >= 0.8 ? 'HEALTHY' : 'NEEDS_ATTENTION',
      production_readiness: stats.critical_failures === 0 && stats.suite_success_rate >= 0.9 ? 'READY' : 'NOT_READY'
    },
    recommendations: generateRecommendations(results, stats)
  }

  if (testConfig.output.reportFile) {
    fs.writeFileSync(testConfig.output.reportFile, JSON.stringify(report, null, 2))
    logger.info(`📄 Comprehensive report saved: ${testConfig.output.reportFile}`)
  }

  return report
}

/**
 * Generate recommendations based on results
 */
function generateRecommendations(results, stats) {
  const recommendations = []

  if (stats.critical_failures > 0) {
    recommendations.push({
      level: 'CRITICAL',
      message: `${stats.critical_failures} critical test suite(s) failed. Immediate attention required.`,
      action: 'Fix critical issues before deployment'
    })
  }

  if (stats.suite_success_rate < 0.8) {
    recommendations.push({
      level: 'HIGH',
      message: `Suite success rate is ${Math.round(stats.suite_success_rate * 100)}% (target: 80%+)`,
      action: 'Investigate and fix failing test suites'
    })
  }

  if (stats.test_success_rate < 0.9 && stats.total_tests > 0) {
    recommendations.push({
      level: 'MEDIUM',
      message: `Individual test success rate is ${Math.round(stats.test_success_rate * 100)}% (target: 90%+)`,
      action: 'Review and fix failing individual tests'
    })
  }

  if (stats.total_duration > 120000) { // 2 minutes
    recommendations.push({
      level: 'LOW',
      message: `Total execution time is ${Math.round(stats.total_duration / 1000)}s (consider optimization)`,
      action: 'Optimize slow test suites for better developer experience'
    })
  }

  if (recommendations.length === 0) {
    recommendations.push({
      level: 'SUCCESS',
      message: 'All test suites passed successfully! System is ready for deployment.',
      action: 'Continue monitoring and maintain test coverage'
    })
  }

  return recommendations
}

/**
 * Print comprehensive summary
 */
function printSummary(stats, report) {
  logger.separator()
  logger.header('BEYONDROUNDS FULL TEST SUITE EXECUTION SUMMARY')

  logger.log(`\n🎯 EXECUTION OVERVIEW:`)
  logger.log(`   ⏱️  Total Time: ${Math.round(stats.total_duration / 1000)}s`)
  logger.log(`   📦 Test Suites: ${stats.passed_suites}/${stats.total_suites} passed (${Math.round(stats.suite_success_rate * 100)}%)`)
  logger.log(`   🧪 Individual Tests: ${stats.passed_tests}/${stats.total_tests} passed (${Math.round(stats.test_success_rate * 100)}%)`)

  logger.log(`\n📋 DETAILED RESULTS:`)
  report.detailed_results.forEach(result => {
    const statusEmoji = result.status === 'PASSED' ? '✅' : '❌'
    const priorityEmoji = result.priority === 'critical' ? '🔥' : result.priority === 'high' ? '⚡' : '📝'
    logger.log(`   ${statusEmoji} ${priorityEmoji} ${result.suite} (${result.duration})`)
    if (result.tests.total > 0) {
      logger.log(`      └─ Tests: ${result.tests.passed}/${result.tests.total} passed`)
    }
  })

  logger.log(`\n🎛️  SYSTEM STATUS:`)
  const systemEmoji = report.system_status.overall_health === 'HEALTHY' ? '🟢' : '🟡'
  logger.log(`   ${systemEmoji} Overall Health: ${report.system_status.overall_health}`)
  logger.log(`   🚀 Production Ready: ${report.system_status.production_readiness}`)
  logger.log(`   ⚙️  Critical Systems: ${report.system_status.critical_systems}`)

  logger.log(`\n📝 RECOMMENDATIONS:`)
  report.recommendations.forEach(rec => {
    const levelEmoji = {
      CRITICAL: '🚨',
      HIGH: '⚠️',
      MEDIUM: '💡',
      LOW: 'ℹ️',
      SUCCESS: '🎉'
    }[rec.level] || 'ℹ️'

    logger.log(`   ${levelEmoji} [${rec.level}] ${rec.message}`)
    logger.log(`      └─ Action: ${rec.action}`)
  })

  logger.separator()

  if (stats.critical_failures === 0 && stats.suite_success_rate >= 0.9) {
    logger.success('🎊 OUTSTANDING SUCCESS! All critical systems operational and ready for production!')
  } else if (stats.critical_failures === 0) {
    logger.success('✅ SUCCESS! Critical systems operational. Minor optimizations recommended.')
  } else {
    logger.error('🚫 CRITICAL ISSUES DETECTED! Immediate attention required before deployment.')
  }

  logger.separator()
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

  logger.header('BEYONDROUNDS COMPREHENSIVE FULL TEST SUITE')
  logger.info(`🎬 Starting execution of ${testConfig.suites.length} test suites`)
  logger.info(`📁 Results will be saved to: ${testConfig.output.reportFile}`)

  try {
    const results = []

    // Execute all test suites
    for (let i = 0; i < testConfig.suites.length; i++) {
      const suite = testConfig.suites[i]

      logger.separator()
      logger.info(`🔄 Progress: ${i + 1}/${testConfig.suites.length} suites`)

      const result = await runTestSuite(suite)
      results.push(result)

      // Short pause between suites
      if (i < testConfig.suites.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000)) // eslint-disable-line no-undef
      }
    }

    // Analyze results and generate report
    const stats = analyzeResults(results)
    const report = generateReport(results, stats)

    // Print comprehensive summary
    printSummary(stats, report)

    const totalTime = Date.now() - startTime
    logger.info(`\n⚡ Total execution completed in ${Math.round(totalTime / 1000)}s`)

    // Exit with appropriate code
    const exitCode = stats.critical_failures > 0 ? 1 : 0
    logger.info(`🔚 Exiting with code: ${exitCode}`)
    process.exit(exitCode)

  } catch (error) {
    logger.error(`💥 Test execution failed: ${error.message}`)
    console.error(error.stack)
    process.exit(1)
  }
}

// Handle CLI arguments
const args = process.argv.slice(2)

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
🧪 BeyondRounds Full Test Suite Runner

Usage: node run-full-test-suite.js [options]

Options:
  --help, -h           Show this help message
  --quick             Skip comprehensive tests (faster execution)
  --critical-only     Run only critical priority tests
  --verbose           Enable verbose output (default)

Test Suites:
  1. Working Foundation Tests    - Core functionality validation
  2. System Core Tests          - System components verification
  3. Full Comprehensive Tests   - Complete system integration

Examples:
  node run-full-test-suite.js                # Run complete test suite
  node run-full-test-suite.js --quick        # Skip comprehensive tests
  node run-full-test-suite.js --critical-only # Critical tests only

Report Files:
  - full-test-results.log      # Detailed execution log
  - full-test-report.json      # Structured test report
`)
  process.exit(0)
}

if (args.includes('--quick')) {
  testConfig.suites = testConfig.suites.slice(0, 2) // Skip comprehensive tests
  logger.info('🏃 Quick mode: Skipping comprehensive tests for faster execution')
}

if (args.includes('--critical-only')) {
  testConfig.suites = testConfig.suites.filter(suite => suite.priority === 'critical')
  logger.info('🔥 Critical mode: Running critical priority tests only')
}

// Start the test execution
if (require.main === module) {
  main()
}

module.exports = { runTestSuite, analyzeResults, generateReport }