#!/bin/bash

# BeyondRounds TypeScript Migration Execution Script
# This script provides easy commands to run the TypeScript migration

set -e  # Exit on any error

echo "🚀 BeyondRounds TypeScript Migration"
echo "===================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm is not installed"
    exit 1
fi

echo "✅ Environment check passed"
echo ""

# Function to run migration
run_migration() {
    echo "🔄 Starting TypeScript migration..."
    echo ""
    
    # Create backup branch
    echo "📝 Creating backup branch..."
    git checkout -b feature/typescript-migration-backup || true
    git add .
    git commit -m "backup: pre-migration state" || true
    
    # Switch to migration branch
    git checkout -b feature/typescript-migration || true
    
    # Run the migration script
    echo "🔧 Running migration script..."
    npx ts-node scripts/migrate-typescript-types.ts
    
    echo ""
    echo "✅ Migration completed!"
    echo ""
    echo "Next steps:"
    echo "1. Run: npm run type-check"
    echo "2. Run: npm test"
    echo "3. Run: npm run build"
    echo "4. Test the application manually"
    echo "5. Commit changes: git add . && git commit -m 'feat: migrate to optimized TypeScript types'"
}

# Function to validate migration
validate_migration() {
    echo "🧪 Validating migration..."
    echo ""
    
    # Check TypeScript compilation
    echo "🔍 Checking TypeScript compilation..."
    npm run type-check
    
    # Run tests
    echo "🧪 Running tests..."
    npm test
    
    # Build project
    echo "🏗️  Building project..."
    npm run build
    
    echo ""
    echo "✅ Validation completed successfully!"
}

# Function to rollback migration
rollback_migration() {
    echo "🔄 Rolling back migration..."
    echo ""
    
    # Switch to backup branch
    git checkout feature/typescript-migration-backup || {
        echo "❌ Backup branch not found. Manual rollback required."
        exit 1
    }
    
    # Restore original files
    cp src/lib/types/database-backup.ts src/lib/types/database.ts || true
    
    echo "✅ Rollback completed!"
}

# Main menu
case "${1:-migrate}" in
    "migrate")
        run_migration
        ;;
    "validate")
        validate_migration
        ;;
    "rollback")
        rollback_migration
        ;;
    "help"|"-h"|"--help")
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  migrate   - Run the TypeScript migration (default)"
        echo "  validate  - Validate the migration results"
        echo "  rollback  - Rollback the migration"
        echo "  help      - Show this help message"
        echo ""
        echo "Examples:"
        echo "  $0 migrate"
        echo "  $0 validate"
        echo "  $0 rollback"
        ;;
    *)
        echo "❌ Unknown command: $1"
        echo "Run '$0 help' for usage information"
        exit 1
        ;;
esac
