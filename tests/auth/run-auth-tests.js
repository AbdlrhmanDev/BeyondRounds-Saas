#!/usr/bin/env node

/**
 * BeyondRounds Authentication Test Runner
 * 
 * This script runs all authentication and authorization tests
 * with proper configuration and reporting.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Test suites configuration
const testSuites = [
  {
    name: 'Middleware Authentication',
    file: 'middleware-auth.test.ts',
    description: 'Tests Next.js middleware authentication logic',
    critical: true,
  },
  {
    name: 'RLS Policies',
    file: 'rls-policies.test.ts',
    description: 'Tests database row-level security policies',
    critical: true,
  },
  {
    name: 'Admin Authorization',
    file: 'admin-authorization.test.tsx',
    description: 'Tests admin panel access and operations',
    critical: true,
  },
  {
    name: 'User Permissions',
    file: 'user-permissions.test.ts',
    description: 'Tests user-level permissions and access control',
    critical: true,
  },
  {
    name: 'API Authorization',
    file: 'api-authorization.test.ts',
    description: 'Tests API endpoint security and authorization',
    critical: true,
  },
  {
    name: 'Session Security',
    file: 'session-security.test.ts',
    description: 'Tests session management and security measures',
    critical: true,
  },
  {
    name: 'Password Reset & Verification',
    file: 'password-reset-verification.test.tsx',
    description: 'Tests password recovery and email verification',
    critical: false,
  },
  {
    name: 'Integration Tests',
    file: 'auth-integration.test.tsx',
    description: 'Tests end-to-end authentication flows',
    critical: true,
  },
];

// Command line arguments
const args = process.argv.slice(2);
const options = {
  coverage: args.includes('--coverage') || args.includes('-c'),
  watch: args.includes('--watch') || args.includes('-w'),
  verbose: args.includes('--verbose') || args.includes('-v'),
  bail: args.includes('--bail') || args.includes('-b'),
  suite: args.find(arg => arg.startsWith('--suite='))?.split('=')[1],
  critical: args.includes('--critical-only'),
  help: args.includes('--help') || args.includes('-h'),
};

function printHeader() {
  console.log(`${colors.cyan}${colors.bright}`);
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║                BeyondRounds Authentication                   ║');
  console.log('║                     Test Suite Runner                        ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log(`${colors.reset}\n`);
}

function printHelp() {
  console.log(`${colors.yellow}Usage: node run-auth-tests.js [options]${colors.reset}\n`);
  console.log('Options:');
  console.log('  --coverage, -c       Generate coverage report');
  console.log('  --watch, -w          Run tests in watch mode');
  console.log('  --verbose, -v        Enable verbose output');
  console.log('  --bail, -b           Stop on first test failure');
  console.log('  --critical-only      Run only critical security tests');
  console.log('  --suite=<name>       Run specific test suite');
  console.log('  --help, -h           Show this help message\n');
  
  console.log('Available test suites:');
  testSuites.forEach((suite, index) => {
    const marker = suite.critical ? '🔒' : '📋';
    console.log(`  ${marker} ${suite.name.toLowerCase().replace(/\s+/g, '-')}`);
  });
  
  console.log('\nExamples:');
  console.log('  node run-auth-tests.js --coverage');
  console.log('  node run-auth-tests.js --suite=middleware-authentication');
  console.log('  node run-auth-tests.js --critical-only --bail');
}

function checkEnvironment() {
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ];

  const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missing.length > 0) {
    console.log(`${colors.yellow}⚠️  Warning: Missing environment variables:${colors.reset}`);
    missing.forEach(envVar => {
      console.log(`   - ${envVar}`);
    });
    console.log('\n   Tests may fail without proper configuration.\n');
  }
}

function runTestSuite(suite, jestOptions = []) {
  const testFile = path.join(__dirname, suite.file);
  
  if (!fs.existsSync(testFile)) {
    console.log(`${colors.red}❌ Test file not found: ${suite.file}${colors.reset}`);
    return false;
  }

  console.log(`${colors.blue}🧪 Running: ${colors.bright}${suite.name}${colors.reset}`);
  console.log(`${colors.dim}   ${suite.description}${colors.reset}`);
  
  const command = `npx jest ${testFile} ${jestOptions.join(' ')}`;
  
  try {
    execSync(command, { 
      stdio: options.verbose ? 'inherit' : 'pipe',
      cwd: process.cwd(),
    });
    
    console.log(`${colors.green}✅ ${suite.name} - PASSED${colors.reset}\n`);
    return true;
  } catch (error) {
    console.log(`${colors.red}❌ ${suite.name} - FAILED${colors.reset}`);
    
    if (!options.verbose) {
      console.log(`${colors.dim}   Run with --verbose for detailed output${colors.reset}`);
    }
    
    console.log('');
    return false;
  }
}

function runAllTests() {
  checkEnvironment();
  
  // Build Jest options
  const jestOptions = [];
  
  if (options.coverage) {
    jestOptions.push('--coverage');
    jestOptions.push('--coverageDirectory=coverage/auth');
    jestOptions.push('--coverageReporters=text,html,lcov');
  }
  
  if (options.watch) {
    jestOptions.push('--watch');
  }
  
  if (options.verbose) {
    jestOptions.push('--verbose');
  }
  
  if (options.bail) {
    jestOptions.push('--bail');
  }

  // Filter test suites
  let suitesToRun = testSuites;
  
  if (options.critical) {
    suitesToRun = testSuites.filter(suite => suite.critical);
    console.log(`${colors.yellow}🔒 Running critical security tests only${colors.reset}\n`);
  }
  
  if (options.suite) {
    const suiteName = options.suite.toLowerCase().replace(/[-_]/g, ' ');
    suitesToRun = testSuites.filter(suite => 
      suite.name.toLowerCase().includes(suiteName) ||
      suite.file.toLowerCase().includes(options.suite.toLowerCase())
    );
    
    if (suitesToRun.length === 0) {
      console.log(`${colors.red}❌ No test suite found matching: ${options.suite}${colors.reset}`);
      return process.exit(1);
    }
  }

  // Run tests
  console.log(`${colors.magenta}📊 Running ${suitesToRun.length} test suite(s)${colors.reset}\n`);
  
  const startTime = Date.now();
  let passed = 0;
  let failed = 0;

  for (const suite of suitesToRun) {
    const success = runTestSuite(suite, jestOptions);
    
    if (success) {
      passed++;
    } else {
      failed++;
      
      if (options.bail) {
        console.log(`${colors.red}🛑 Stopping on first failure (--bail)${colors.reset}`);
        break;
      }
    }
  }

  // Print summary
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  console.log(`${colors.cyan}${colors.bright}📈 Test Summary${colors.reset}`);
  console.log('─'.repeat(50));
  console.log(`${colors.green}✅ Passed: ${passed}${colors.reset}`);
  console.log(`${colors.red}❌ Failed: ${failed}${colors.reset}`);
  console.log(`${colors.blue}⏱️  Duration: ${duration}s${colors.reset}`);
  
  if (options.coverage) {
    console.log(`${colors.yellow}📊 Coverage report: coverage/auth/index.html${colors.reset}`);
  }
  
  console.log('');

  // Exit with appropriate code
  if (failed > 0) {
    console.log(`${colors.red}${colors.bright}🚨 Some tests failed! Please review and fix issues.${colors.reset}`);
    process.exit(1);
  } else {
    console.log(`${colors.green}${colors.bright}🎉 All authentication tests passed!${colors.reset}`);
    process.exit(0);
  }
}

// Main execution
function main() {
  printHeader();
  
  if (options.help) {
    printHelp();
    return;
  }

  // Validate that we're in the right directory
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    console.log(`${colors.red}❌ Error: package.json not found. Please run from project root.${colors.reset}`);
    process.exit(1);
  }

  runAllTests();
}

// Handle process signals
process.on('SIGINT', () => {
  console.log(`\n${colors.yellow}⚠️  Test execution interrupted${colors.reset}`);
  process.exit(130);
});

process.on('SIGTERM', () => {
  console.log(`\n${colors.yellow}⚠️  Test execution terminated${colors.reset}`);
  process.exit(143);
});

// Run the main function
main();


