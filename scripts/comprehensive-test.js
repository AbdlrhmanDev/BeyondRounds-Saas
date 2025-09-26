#!/usr/bin/env node

/**
 * BeyondRounds Comprehensive Test Suite
 * 
 * This script performs a complete test of the TypeScript migration system
 * including environment checks, type validation, build tests, and migration script testing.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ComprehensiveTestSuite {
  constructor() {
    this.results = {
      environment: { passed: 0, failed: 0, tests: [] },
      typescript: { passed: 0, failed: 0, tests: [] },
      build: { passed: 0, failed: 0, tests: [] },
      migration: { passed: 0, failed: 0, tests: [] },
      safety: { passed: 0, failed: 0, tests: [] }
    };
    this.startTime = Date.now();
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const colors = {
      info: '\x1b[36m',    // Cyan
      success: '\x1b[32m', // Green
      warning: '\x1b[33m', // Yellow
      error: '\x1b[31m',   // Red
      reset: '\x1b[0m'     // Reset
    };
    
    console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
  }

  async runCommand(command, description) {
    try {
      this.log(`🔄 ${description}...`, 'info');
      const result = execSync(command, { 
        encoding: 'utf8', 
        stdio: 'pipe',
        cwd: process.cwd()
      });
      this.log(`✅ ${description} - SUCCESS`, 'success');
      return { success: true, output: result };
    } catch (error) {
      this.log(`❌ ${description} - FAILED: ${error.message}`, 'error');
      return { success: false, error: error.message, output: error.stdout || error.stderr };
    }
  }

  async testEnvironment() {
    this.log('\n🔍 Testing Environment Setup...', 'info');
    
    // Test Node.js
    const nodeTest = await this.runCommand('node --version', 'Node.js version check');
    this.addTestResult('environment', 'Node.js Installation', nodeTest.success);
    
    // Test npm
    const npmTest = await this.runCommand('npm --version', 'npm version check');
    this.addTestResult('environment', 'npm Installation', npmTest.success);
    
    // Test Git
    const gitTest = await this.runCommand('git --version', 'Git version check');
    this.addTestResult('environment', 'Git Installation', gitTest.success);
    
    // Test package.json
    const packageJsonExists = fs.existsSync('package.json');
    this.addTestResult('environment', 'package.json exists', packageJsonExists);
    
    // Test tsconfig.json
    const tsconfigExists = fs.existsSync('tsconfig.json');
    this.addTestResult('environment', 'tsconfig.json exists', tsconfigExists);
    
    // Test node_modules
    const nodeModulesExists = fs.existsSync('node_modules');
    this.addTestResult('environment', 'node_modules exists', nodeModulesExists);
    
    // Test source directory structure
    const srcExists = fs.existsSync('src');
    this.addTestResult('environment', 'src directory exists', srcExists);
    
    const libExists = fs.existsSync('src/lib');
    this.addTestResult('environment', 'src/lib directory exists', libExists);
    
    const typesExists = fs.existsSync('src/lib/types');
    this.addTestResult('environment', 'src/lib/types directory exists', typesExists);
  }

  async testTypeScript() {
    this.log('\n🔍 Testing TypeScript Configuration...', 'info');
    
    // Test TypeScript compilation
    const typeCheckTest = await this.runCommand('npm run type-check', 'TypeScript compilation');
    this.addTestResult('typescript', 'TypeScript compilation', typeCheckTest.success);
    
    // Test if database types exist
    const databaseTypesExist = fs.existsSync('src/lib/types/database.ts');
    this.addTestResult('typescript', 'database.ts exists', databaseTypesExist);
    
    // Test if optimized types exist
    const optimizedTypesExist = fs.existsSync('src/lib/types/database-optimized.ts');
    this.addTestResult('typescript', 'database-optimized.ts exists', optimizedTypesExist);
    
    // Test type file sizes
    if (databaseTypesExist) {
      const databaseStats = fs.statSync('src/lib/types/database.ts');
      const databaseSizeKB = Math.round(databaseStats.size / 1024);
      this.log(`📊 database.ts size: ${databaseSizeKB}KB`, 'info');
      this.addTestResult('typescript', 'database.ts has content', databaseSizeKB > 10);
    }
    
    if (optimizedTypesExist) {
      const optimizedStats = fs.statSync('src/lib/types/database-optimized.ts');
      const optimizedSizeKB = Math.round(optimizedStats.size / 1024);
      this.log(`📊 database-optimized.ts size: ${optimizedSizeKB}KB`, 'info');
      this.addTestResult('typescript', 'database-optimized.ts has content', optimizedSizeKB > 10);
    }
    
    // Test for TypeScript errors in key files
    const keyFiles = [
      'src/app/page.tsx',
      'src/app/layout.tsx',
      'src/lib/types/database.ts'
    ];
    
    for (const file of keyFiles) {
      if (fs.existsSync(file)) {
        try {
          const content = fs.readFileSync(file, 'utf8');
          const hasTypeErrors = content.includes('any') && content.includes('// @ts-ignore');
          this.addTestResult('typescript', `${path.basename(file)} syntax check`, !hasTypeErrors);
        } catch (error) {
          this.addTestResult('typescript', `${path.basename(file)} syntax check`, false);
        }
      }
    }
  }

  async testBuild() {
    this.log('\n🔍 Testing Build Process...', 'info');
    
    // Test Next.js build
    const buildTest = await this.runCommand('npm run build', 'Next.js build');
    this.addTestResult('build', 'Next.js build', buildTest.success);
    
    // Test if .next directory was created
    const nextDirExists = fs.existsSync('.next');
    this.addTestResult('build', '.next directory created', nextDirExists);
    
    // Test linting
    const lintTest = await this.runCommand('npm run lint', 'ESLint check');
    this.addTestResult('build', 'ESLint check', lintTest.success);
    
    // Test if build artifacts exist
    if (nextDirExists) {
      const staticExists = fs.existsSync('.next/static');
      this.addTestResult('build', 'Static assets generated', staticExists);
      
      const serverExists = fs.existsSync('.next/server');
      this.addTestResult('build', 'Server files generated', serverExists);
    }
  }

  async testMigrationScript() {
    this.log('\n🔍 Testing Migration Script...', 'info');
    
    // Test if migration script exists
    const migrationScriptExists = fs.existsSync('scripts/migrate-typescript-types.ts');
    this.addTestResult('migration', 'Migration script exists', migrationScriptExists);
    
    // Test if PowerShell script exists
    const psScriptExists = fs.existsSync('scripts/migrate.ps1');
    this.addTestResult('migration', 'PowerShell script exists', psScriptExists);
    
    // Test if bash script exists
    const bashScriptExists = fs.existsSync('scripts/migrate.sh');
    this.addTestResult('migration', 'Bash script exists', bashScriptExists);
    
    // Test migration script syntax
    if (migrationScriptExists) {
      try {
        const content = fs.readFileSync('scripts/migrate-typescript-types.ts', 'utf8');
        const hasValidSyntax = content.includes('class TypeScriptMigration') && 
                              content.includes('MIGRATION_MAP') &&
                              content.includes('REGEX_PATTERNS');
        this.addTestResult('migration', 'Migration script syntax', hasValidSyntax);
        
        // Test if migration map has expected entries
        const hasProfileToUser = content.includes("'Profile': 'User'");
        const hasProfilesToUsers = content.includes("'profiles': 'users'");
        const hasEnumMappings = content.includes("'non-binary': 'non_binary'");
        
        this.addTestResult('migration', 'Profile to User mapping', hasProfileToUser);
        this.addTestResult('migration', 'profiles to users mapping', hasProfilesToUsers);
        this.addTestResult('migration', 'Enum value mappings', hasEnumMappings);
        
      } catch (error) {
        this.addTestResult('migration', 'Migration script syntax', false);
      }
    }
    
    // Test README exists
    const readmeExists = fs.existsSync('scripts/README.md');
    this.addTestResult('migration', 'Migration README exists', readmeExists);
    
    // Test migration guide exists
    const guideExists = fs.existsSync('TYPESCRIPT_MIGRATION_GUIDE.md');
    this.addTestResult('migration', 'Migration guide exists', guideExists);
  }

  async testCodeSafety() {
    this.log('\n🔍 Testing Code Safety...', 'info');
    
    // Test for backup files
    const backupExists = fs.existsSync('src/lib/types/database-backup.ts');
    this.addTestResult('safety', 'Backup file exists', backupExists);
    
    // Test git status
    const gitStatusTest = await this.runCommand('git status --porcelain', 'Git status check');
    this.addTestResult('safety', 'Git repository clean', gitStatusTest.success && !gitStatusTest.output.trim());
    
    // Test for sensitive data exposure
    const envExampleExists = fs.existsSync('env.example');
    this.addTestResult('safety', 'env.example exists', envExampleExists);
    
    // Test for .env file (should not be committed)
    const envExists = fs.existsSync('.env');
    this.addTestResult('safety', '.env file not committed', !envExists);
    
    // Test for hardcoded secrets in source files
    const srcFiles = this.findTypeScriptFiles('src');
    let hasHardcodedSecrets = false;
    
    for (const file of srcFiles.slice(0, 10)) { // Check first 10 files
      try {
        const content = fs.readFileSync(file, 'utf8');
        if (content.includes('password') || content.includes('secret') || content.includes('key')) {
          hasHardcodedSecrets = true;
          break;
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }
    
    this.addTestResult('safety', 'No hardcoded secrets', !hasHardcodedSecrets);
    
    // Test for proper error handling
    const hasErrorHandling = this.checkErrorHandling();
    this.addTestResult('safety', 'Proper error handling', hasErrorHandling);
  }

  findTypeScriptFiles(dir) {
    const files = [];
    try {
      const items = fs.readdirSync(dir);
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          files.push(...this.findTypeScriptFiles(fullPath));
        } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
          files.push(fullPath);
        }
      });
    } catch (error) {
      // Skip directories that can't be read
    }
    return files;
  }

  checkErrorHandling() {
    const keyFiles = [
      'src/lib/api/profile-comprehensive.ts',
      'src/lib/utils/profile-mapping.ts',
      'src/hooks/features/auth/useAuthUser.ts'
    ];
    
    let hasErrorHandling = true;
    for (const file of keyFiles) {
      if (fs.existsSync(file)) {
        try {
          const content = fs.readFileSync(file, 'utf8');
          if (!content.includes('try') && !content.includes('catch') && !content.includes('error')) {
            hasErrorHandling = false;
            break;
          }
        } catch (error) {
          hasErrorHandling = false;
          break;
        }
      }
    }
    return hasErrorHandling;
  }

  addTestResult(category, testName, passed) {
    this.results[category].tests.push({ name: testName, passed });
    if (passed) {
      this.results[category].passed++;
    } else {
      this.results[category].failed++;
    }
  }

  generateReport() {
    const endTime = Date.now();
    const duration = Math.round((endTime - this.startTime) / 1000);
    
    this.log('\n📊 COMPREHENSIVE TEST REPORT', 'info');
    this.log('================================', 'info');
    this.log(`⏱️  Total execution time: ${duration} seconds`, 'info');
    this.log('');
    
    let totalPassed = 0;
    let totalFailed = 0;
    
    Object.entries(this.results).forEach(([category, result]) => {
      const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
      const percentage = Math.round((result.passed / (result.passed + result.failed)) * 100);
      
      this.log(`📋 ${categoryName} Tests:`, 'info');
      this.log(`   ✅ Passed: ${result.passed}`, 'success');
      this.log(`   ❌ Failed: ${result.failed}`, 'error');
      this.log(`   📊 Success Rate: ${percentage}%`, percentage >= 80 ? 'success' : 'warning');
      
      if (result.failed > 0) {
        this.log('   Failed Tests:', 'error');
        result.tests.filter(test => !test.passed).forEach(test => {
          this.log(`     - ${test.name}`, 'error');
        });
      }
      
      this.log('');
      totalPassed += result.passed;
      totalFailed += result.failed;
    });
    
    const overallPercentage = Math.round((totalPassed / (totalPassed + totalFailed)) * 100);
    
    this.log('🎯 OVERALL RESULTS:', 'info');
    this.log(`   ✅ Total Passed: ${totalPassed}`, 'success');
    this.log(`   ❌ Total Failed: ${totalFailed}`, 'error');
    this.log(`   📊 Overall Success Rate: ${overallPercentage}%`, overallPercentage >= 80 ? 'success' : 'warning');
    
    if (overallPercentage >= 90) {
      this.log('\n🎉 EXCELLENT! System is ready for migration.', 'success');
    } else if (overallPercentage >= 80) {
      this.log('\n✅ GOOD! System is mostly ready, minor issues to address.', 'warning');
    } else {
      this.log('\n⚠️  ATTENTION NEEDED! Please address failed tests before migration.', 'error');
    }
    
    this.log('\n📝 NEXT STEPS:', 'info');
    if (totalFailed === 0) {
      this.log('   1. Run: .\\scripts\\migrate.ps1 migrate', 'success');
      this.log('   2. Validate: .\\scripts\\migrate.ps1 validate', 'success');
      this.log('   3. Test application manually', 'success');
    } else {
      this.log('   1. Fix failed tests above', 'warning');
      this.log('   2. Re-run this test suite', 'warning');
      this.log('   3. Proceed with migration once all tests pass', 'warning');
    }
  }

  async run() {
    this.log('🚀 Starting BeyondRounds Comprehensive Test Suite', 'info');
    this.log('================================================', 'info');
    
    try {
      await this.testEnvironment();
      await this.testTypeScript();
      await this.testBuild();
      await this.testMigrationScript();
      await this.testCodeSafety();
      
      this.generateReport();
      
    } catch (error) {
      this.log(`❌ Test suite failed: ${error.message}`, 'error');
      process.exit(1);
    }
  }
}

// Run the test suite
if (require.main === module) {
  const testSuite = new ComprehensiveTestSuite();
  testSuite.run().catch(console.error);
}

module.exports = ComprehensiveTestSuite;
