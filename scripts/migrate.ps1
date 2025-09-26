# BeyondRounds TypeScript Migration PowerShell Script
# This script provides easy commands to run the TypeScript migration on Windows

param(
    [Parameter(Position=0)]
    [ValidateSet("migrate", "validate", "rollback", "help")]
    [string]$Command = "migrate"
)

# Set error action preference
$ErrorActionPreference = "Stop"

Write-Host "🚀 BeyondRounds TypeScript Migration" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: Node.js is not installed" -ForegroundColor Red
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-Host "✅ npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: npm is not installed" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Environment check passed" -ForegroundColor Green
Write-Host ""

# Function to run migration
function Run-Migration {
    Write-Host "🔄 Starting TypeScript migration..." -ForegroundColor Yellow
    Write-Host ""
    
    # Create backup branch
    Write-Host "📝 Creating backup branch..." -ForegroundColor Blue
    try {
        git checkout -b feature/typescript-migration-backup 2>$null
        git add .
        git commit -m "backup: pre-migration state" 2>$null
    } catch {
        Write-Host "⚠️  Backup branch already exists or no changes to commit" -ForegroundColor Yellow
    }
    
    # Switch to migration branch
    try {
        git checkout -b feature/typescript-migration 2>$null
    } catch {
        Write-Host "⚠️  Migration branch already exists, switching to it" -ForegroundColor Yellow
        git checkout feature/typescript-migration
    }
    
    # Run the migration script
    Write-Host "🔧 Running migration script..." -ForegroundColor Blue
    npx ts-node scripts/migrate-typescript-types.ts
    
    Write-Host ""
    Write-Host "✅ Migration completed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Run: npm run type-check" -ForegroundColor White
    Write-Host "2. Run: npm test" -ForegroundColor White
    Write-Host "3. Run: npm run build" -ForegroundColor White
    Write-Host "4. Test the application manually" -ForegroundColor White
    Write-Host "5. Commit changes: git add . && git commit -m 'feat: migrate to optimized TypeScript types'" -ForegroundColor White
}

# Function to validate migration
function Validate-Migration {
    Write-Host "🧪 Validating migration..." -ForegroundColor Yellow
    Write-Host ""
    
    # Check TypeScript compilation
    Write-Host "🔍 Checking TypeScript compilation..." -ForegroundColor Blue
    npm run type-check
    
    # Run tests
    Write-Host "🧪 Running tests..." -ForegroundColor Blue
    npm test
    
    # Build project
    Write-Host "🏗️  Building project..." -ForegroundColor Blue
    npm run build
    
    Write-Host ""
    Write-Host "✅ Validation completed successfully!" -ForegroundColor Green
}

# Function to rollback migration
function Rollback-Migration {
    Write-Host "🔄 Rolling back migration..." -ForegroundColor Yellow
    Write-Host ""
    
    # Switch to backup branch
    try {
        git checkout feature/typescript-migration-backup
    } catch {
        Write-Host "❌ Backup branch not found. Manual rollback required." -ForegroundColor Red
        exit 1
    }
    
    # Restore original files
    if (Test-Path "src/lib/types/database-backup.ts") {
        Copy-Item "src/lib/types/database-backup.ts" "src/lib/types/database.ts" -Force
        Write-Host "✅ Restored original database.ts" -ForegroundColor Green
    }
    
    Write-Host "✅ Rollback completed!" -ForegroundColor Green
}

# Function to show help
function Show-Help {
    Write-Host "Usage: .\migrate.ps1 [command]" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Commands:" -ForegroundColor Yellow
    Write-Host "  migrate   - Run the TypeScript migration (default)" -ForegroundColor White
    Write-Host "  validate  - Validate the migration results" -ForegroundColor White
    Write-Host "  rollback  - Rollback the migration" -ForegroundColor White
    Write-Host "  help      - Show this help message" -ForegroundColor White
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Yellow
    Write-Host "  .\migrate.ps1 migrate" -ForegroundColor White
    Write-Host "  .\migrate.ps1 validate" -ForegroundColor White
    Write-Host "  .\migrate.ps1 rollback" -ForegroundColor White
}

# Main execution
switch ($Command) {
    "migrate" {
        Run-Migration
    }
    "validate" {
        Validate-Migration
    }
    "rollback" {
        Rollback-Migration
    }
    "help" {
        Show-Help
    }
    default {
        Write-Host "❌ Unknown command: $Command" -ForegroundColor Red
        Write-Host "Run '.\migrate.ps1 help' for usage information" -ForegroundColor Yellow
        exit 1
    }
}
