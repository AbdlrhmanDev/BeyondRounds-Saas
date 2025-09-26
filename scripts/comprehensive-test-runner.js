#!/usr/bin/env node

/**
 * Comprehensive Test Runner for BeyondRounds
 * 
 * This script orchestrates the execution of all test suites:
 * - Unit tests (components, hooks, utilities)
 * - Integration tests (end-to-end workflows)
 * - API tests (route handlers and endpoints)
 * - Database tests (CRUD operations, RLS policies)
 * - Performance tests (load testing, memory usage)
 * - Comprehensive tests (full system integration)
 */

const { execSync, spawn } = require('child_process')
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
  white: '\x1b[37m'
}

class TestRunner {
  constructor() {
    this.startTime = Date.now()
    this.results = {
      unit: { status: 'pending', duration: 0, coverage: null },
      integration: { status: 'pending', duration: 0, coverage: null },
      api: { status: 'pending', duration: 0, coverage: null },
      database: { status: 'pending', duration: 0, coverage: null },
      performance: { status: 'pending', duration: 0, coverage: null },
      comprehensive: { status: 'pending', duration: 0, coverage: null }
    }
    this.options = this.parseArguments()
  }

  parseArguments() {
    const args = process.argv.slice(2)
    return {
      coverage: args.includes('--coverage') || args.includes('-c'),
      watch: args.includes('--watch') || args.includes('-w'),
      verbose: args.includes('--verbose') || args.includes('-v'),
      suite: args.find(arg => ['unit', 'integration', 'api', 'database', 'performance', 'comprehensive', 'all'].includes(arg)) || 'all',
      parallel: args.includes('--parallel') || args.includes('-p'),
      bail: args.includes('--bail') || args.includes('-b'),
      updateSnapshots: args.includes('--updateSnapshots') || args.includes('-u'),
      silent: args.includes('--silent') || args.includes('-s'),
      reporter: args.find(arg => arg.startsWith('--reporter='))?.split('=')[1] || 'default'
    }
  }

  log(message, color = 'white') {
    if (!this.options.silent) {
      console.log(`${colors[color]}${message}${colors.reset}`)
    }
  }

  logHeader(message) {
    if (!this.options.silent) {
      console.log(`\n${colors.bright}${colors.cyan}${'='.repeat(80)}`)
      console.log(`${message.toUpperCase()}`)
      console.log(`${'='.repeat(80)}${colors.reset}\n`)
    }
  }

  logSection(message) {
    if (!this.options.silent) {
      console.log(`\n${colors.bright}${colors.blue}${'-'.repeat(40)}`)
      console.log(`${message}`)
      console.log(`${'-'.repeat(40)}${colors.reset}`)
    }
  }

  async runTestSuite(suiteName, command) {
    this.logSection(`Running ${suiteName} tests`)
    const startTime = Date.now()
    
    try {
      const options = {
        stdio: this.options.silent ? 'pipe' : 'inherit',
        cwd: process.cwd()
      }

      if (this.options.coverage) {
        command = command.replace('jest', 'jest --coverage')
      }

      if (this.options.verbose) {
        command += ' --verbose'
      }

      if (this.options.bail) {
        command += ' --bail'
      }

      if (this.options.updateSnapshots) {
        command += ' --updateSnapshots'
      }

      const result = execSync(command, options)
      const duration = Date.now() - startTime

      this.results[suiteName] = {
        status: 'passed',
        duration,
        coverage: this.options.coverage ? this.extractCoverage(suiteName) : null
      }

      this.log(`✅ ${suiteName} tests completed in ${duration}ms`, 'green')
      return true

    } catch (error) {
      const duration = Date.now() - startTime
      
      this.results[suiteName] = {
        status: 'failed',
        duration,
        coverage: null,
        error: error.message
      }

      this.log(`❌ ${suiteName} tests failed after ${duration}ms`, 'red')
      if (this.options.verbose && !this.options.silent) {
        console.error(error.message)
      }
      
      if (this.options.bail) {
        throw error
      }
      
      return false
    }
  }

  extractCoverage(suiteName) {
    try {
      const coveragePath = path.join(process.cwd(), 'coverage', 'coverage-summary.json')
      if (fs.existsSync(coveragePath)) {
        const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'))
        return {
          lines: coverage.total?.lines?.pct || 0,
          functions: coverage.total?.functions?.pct || 0,
          branches: coverage.total?.branches?.pct || 0,
          statements: coverage.total?.statements?.pct || 0
        }
      }
    } catch (error) {
      this.log(`Warning: Could not extract coverage for ${suiteName}`, 'yellow')
    }
    return null
  }

  async runPreflightChecks() {
    this.logSection('Running preflight checks')

    // Check if Jest is installed
    try {
      execSync('npx jest --version', { stdio: 'pipe' })
      this.log('✅ Jest is available', 'green')
    } catch (error) {
      this.log('❌ Jest is not available', 'red')
      throw new Error('Jest is required to run tests')
    }

    // Check if test files exist
    const testSuites = {
      unit: ['tests/components', 'tests/hooks', 'tests/lib'],
      integration: ['tests/integration'],
      api: ['tests/api'],
      database: ['tests/database'],
      performance: ['tests/performance'],
      comprehensive: ['tests/comprehensive-all-systems-master.test.tsx']
    }

    for (const [suite, paths] of Object.entries(testSuites)) {
      const hasTests = paths.some(testPath => {
        const fullPath = path.join(process.cwd(), testPath)
        return fs.existsSync(fullPath)
      })

      if (hasTests) {
        this.log(`✅ ${suite} tests found`, 'green')
      } else {
        this.log(`⚠️  ${suite} tests not found`, 'yellow')
      }
    }

    // Check environment variables
    const requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY'
    ]

    for (const envVar of requiredEnvVars) {
      if (process.env[envVar]) {
        this.log(`✅ ${envVar} is set`, 'green')
      } else {
        this.log(`⚠️  ${envVar} is not set`, 'yellow')
      }
    }

    this.log('Preflight checks completed', 'cyan')
  }

  async runAllTests() {
    const testSuites = {
      unit: 'jest --testPathPattern=tests/(components|hooks|lib)',
      integration: 'jest --testPathPattern=tests/integration',
      api: 'jest --testPathPattern=tests/api',
      database: 'jest --testPathPattern=tests/database',
      performance: 'jest --testPathPattern=tests/performance',
      comprehensive: 'jest --testPathPattern=tests/comprehensive'
    }

    let allPassed = true

    if (this.options.suite === 'all') {
      // Run all test suites
      for (const [suiteName, command] of Object.entries(testSuites)) {
        const passed = await this.runTestSuite(suiteName, command)
        if (!passed) {
          allPassed = false
        }
      }
    } else {
      // Run specific test suite
      const command = testSuites[this.options.suite]
      if (command) {
        const passed = await this.runTestSuite(this.options.suite, command)
        if (!passed) {
          allPassed = false
        }
      } else {
        throw new Error(`Unknown test suite: ${this.options.suite}`)
      }
    }

    return allPassed
  }

  generateReport() {
    const totalDuration = Date.now() - this.startTime
    
    this.logHeader('Test Results Summary')

    // Test results table
    console.log(`${colors.bright}Test Suite Results:${colors.reset}`)
    console.log('┌─────────────────┬─────────┬─────────────┬─────────────────────────────┐')
    console.log('│ Suite           │ Status  │ Duration    │ Coverage                    │')
    console.log('├─────────────────┼─────────┼─────────────┼─────────────────────────────┤')

    for (const [suiteName, result] of Object.entries(this.results)) {
      if (result.status === 'pending') continue

      const status = result.status === 'passed' ? 
        `${colors.green}✅ PASS${colors.reset}` : 
        `${colors.red}❌ FAIL${colors.reset}`
      
      const duration = `${result.duration}ms`.padStart(11)
      
      let coverage = 'N/A'
      if (result.coverage) {
        const { lines, functions, branches, statements } = result.coverage
        coverage = `L:${lines}% F:${functions}% B:${branches}% S:${statements}%`
      }
      
      console.log(`│ ${suiteName.padEnd(15)} │ ${status.padEnd(15)} │ ${duration} │ ${coverage.padEnd(27)} │`)
    }

    console.log('└─────────────────┴─────────┴─────────────┴─────────────────────────────┘')

    // Summary statistics
    const totalTests = Object.keys(this.results).length
    const passedTests = Object.values(this.results).filter(r => r.status === 'passed').length
    const failedTests = Object.values(this.results).filter(r => r.status === 'failed').length
    const pendingTests = Object.values(this.results).filter(r => r.status === 'pending').length

    console.log(`\n${colors.bright}Summary:${colors.reset}`)
    console.log(`Total Duration: ${totalDuration}ms`)
    console.log(`Test Suites: ${totalTests} total, ${colors.green}${passedTests} passed${colors.reset}, ${colors.red}${failedTests} failed${colors.reset}, ${pendingTests} pending`)

    // Overall coverage
    if (this.options.coverage) {
      const coverageResults = Object.values(this.results)
        .filter(r => r.coverage)
        .map(r => r.coverage)

      if (coverageResults.length > 0) {
        const avgLines = Math.round(coverageResults.reduce((sum, c) => sum + c.lines, 0) / coverageResults.length)
        const avgFunctions = Math.round(coverageResults.reduce((sum, c) => sum + c.functions, 0) / coverageResults.length)
        const avgBranches = Math.round(coverageResults.reduce((sum, c) => sum + c.branches, 0) / coverageResults.length)
        const avgStatements = Math.round(coverageResults.reduce((sum, c) => sum + c.statements, 0) / coverageResults.length)

        console.log(`\n${colors.bright}Overall Coverage:${colors.reset}`)
        console.log(`Lines: ${avgLines}% | Functions: ${avgFunctions}% | Branches: ${avgBranches}% | Statements: ${avgStatements}%`)
      }
    }

    // Recommendations
    console.log(`\n${colors.bright}Recommendations:${colors.reset}`)
    
    if (failedTests > 0) {
      console.log(`${colors.red}• Fix failing tests before deployment${colors.reset}`)
    }

    if (this.options.coverage) {
      const lowCoverage = Object.values(this.results)
        .filter(r => r.coverage && r.coverage.lines < 70)
        .length

      if (lowCoverage > 0) {
        console.log(`${colors.yellow}• Improve test coverage for ${lowCoverage} test suite(s)${colors.reset}`)
      }
    }

    if (totalDuration > 30000) { // 30 seconds
      console.log(`${colors.yellow}• Consider optimizing slow tests (total duration: ${totalDuration}ms)${colors.reset}`)
    }

    if (passedTests === totalTests - pendingTests && failedTests === 0) {
      console.log(`${colors.green}• All tests are passing! 🎉${colors.reset}`)
    }

    return failedTests === 0
  }

  async saveReport() {
    const report = {
      timestamp: new Date().toISOString(),
      totalDuration: Date.now() - this.startTime,
      options: this.options,
      results: this.results,
      summary: {
        total: Object.keys(this.results).length,
        passed: Object.values(this.results).filter(r => r.status === 'passed').length,
        failed: Object.values(this.results).filter(r => r.status === 'failed').length,
        pending: Object.values(this.results).filter(r => r.status === 'pending').length
      }
    }

    const reportsDir = path.join(process.cwd(), 'test-reports')
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true })
    }

    const reportFile = path.join(reportsDir, `test-report-${Date.now()}.json`)
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2))

    this.log(`\nTest report saved to: ${reportFile}`, 'cyan')
    return reportFile
  }

  async run() {
    try {
      this.logHeader(`BeyondRounds Comprehensive Test Suite`)
      
      this.log(`Running test suite: ${this.options.suite}`, 'cyan')
      this.log(`Options: ${JSON.stringify(this.options, null, 2)}`, 'blue')

      // Run preflight checks
      await this.runPreflightChecks()

      // Run tests
      const allPassed = await this.runAllTests()

      // Generate and save report
      const success = this.generateReport()
      await this.saveReport()

      // Exit with appropriate code
      if (success && allPassed) {
        this.log(`\n🎉 All tests completed successfully!`, 'green')
        process.exit(0)
      } else {
        this.log(`\n❌ Some tests failed. Check the results above.`, 'red')
        process.exit(1)
      }

    } catch (error) {
      this.log(`\n💥 Test runner failed: ${error.message}`, 'red')
      if (this.options.verbose) {
        console.error(error.stack)
      }
      process.exit(1)
    }
  }
}

// Help text
function showHelp() {
  console.log(`
${colors.bright}BeyondRounds Comprehensive Test Runner${colors.reset}

Usage: node scripts/comprehensive-test-runner.js [options] [suite]

Test Suites:
  unit           Run unit tests (components, hooks, utilities)
  integration    Run integration tests (end-to-end workflows)
  api            Run API tests (route handlers)
  database       Run database tests (CRUD, RLS policies)
  performance    Run performance tests (load testing, memory)
  comprehensive  Run comprehensive system tests
  all            Run all test suites (default)

Options:
  --coverage, -c        Generate coverage reports
  --watch, -w          Run tests in watch mode
  --verbose, -v        Show detailed output
  --parallel, -p       Run tests in parallel
  --bail, -b           Stop on first test failure
  --updateSnapshots, -u Update Jest snapshots
  --silent, -s         Suppress console output
  --reporter=<type>    Specify test reporter
  --help, -h           Show this help message

Examples:
  node scripts/comprehensive-test-runner.js
  node scripts/comprehensive-test-runner.js unit --coverage
  node scripts/comprehensive-test-runner.js all --verbose --bail
  node scripts/comprehensive-test-runner.js performance --silent

Environment Variables:
  NEXT_PUBLIC_SUPABASE_URL      Supabase project URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY Supabase anonymous key
  NODE_ENV                      Test environment (usually 'test')
`)
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2)
  
  if (args.includes('--help') || args.includes('-h')) {
    showHelp()
    process.exit(0)
  }

  const runner = new TestRunner()
  runner.run()
}

module.exports = TestRunner



