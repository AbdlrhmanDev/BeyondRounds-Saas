# ==============================================
# PowerShell Quick Diagnostic Script
# ==============================================
# Run this to test user creation quickly

Write-Host "🔧 Quick Diagnostic Script for User Creation" -ForegroundColor Cyan
Write-Host ""

# Check if .env file exists
if (Test-Path ".env") {
    Write-Host "✅ .env file found" -ForegroundColor Green
} else {
    Write-Host "❌ .env file not found" -ForegroundColor Red
    Write-Host "Please create .env file with your Supabase credentials"
    exit 1
}

# Check if node_modules exists
if (Test-Path "node_modules") {
    Write-Host "✅ node_modules found" -ForegroundColor Green
} else {
    Write-Host "❌ node_modules not found" -ForegroundColor Red
    Write-Host "Please run: npm install"
    exit 1
}

Write-Host ""
Write-Host "📝 Running diagnostic script..." -ForegroundColor Yellow

# Run the diagnostic script
node scripts/diagnostic-user-creation.js

Write-Host ""
Write-Host "🏁 Diagnostic completed!" -ForegroundColor Green

