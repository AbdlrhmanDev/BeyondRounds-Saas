# Comprehensive Test Data Generator for BeyondRounds Medical Matching System
# PowerShell script to create complete test data for all database tables

Write-Host "🏥 BeyondRounds Medical Matching System" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Comprehensive Test Data Generator" -ForegroundColor Yellow
Write-Host "Creating complete test data for all tables" -ForegroundColor Green
Write-Host ""

# Check if Node.js is available
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check if .env.local exists
if (Test-Path ".env.local") {
    Write-Host "✅ Environment file found" -ForegroundColor Green
} else {
    Write-Host "❌ .env.local not found. Please create it first." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🚀 Starting comprehensive test data generation..." -ForegroundColor Yellow
Write-Host ""

# Run the Node.js script
try {
    node scripts/create-comprehensive-test-data.js
    
    Write-Host ""
    Write-Host "🎉 Comprehensive test data generation completed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Summary:" -ForegroundColor Cyan
    Write-Host "===========" -ForegroundColor Cyan
    Write-Host "• 5 Medical professionals created" -ForegroundColor White
    Write-Host "• 1 Admin account created" -ForegroundColor White
    Write-Host "• 3 Payment plans created" -ForegroundColor White
    Write-Host "• 2 Sample matches created" -ForegroundColor White
    Write-Host "• Chat rooms and messages created" -ForegroundColor White
    Write-Host "• Notifications system populated" -ForegroundColor White
    Write-Host "• Complete profile data with preferences" -ForegroundColor White
    Write-Host ""
    Write-Host "🔑 Login Credentials:" -ForegroundColor Yellow
    Write-Host "===================" -ForegroundColor Yellow
    Write-Host "Medical Professionals: MedicalPass123!" -ForegroundColor White
    Write-Host "Admin Account: AdminPassword123!" -ForegroundColor White
    Write-Host ""
    Write-Host "📧 Sample Accounts:" -ForegroundColor Cyan
    Write-Host "==================" -ForegroundColor Cyan
    Write-Host "• dr.ahmed.alharbi@beyondrounds.com (Cardiology)" -ForegroundColor White
    Write-Host "• dr.sara.almansouri@beyondrounds.com (Pediatrics)" -ForegroundColor White
    Write-Host "• dr.mohammed.alshehri@beyondrounds.com (Orthopedics)" -ForegroundColor White
    Write-Host "• dr.fatima.alqahtani@beyondrounds.com (Dermatology)" -ForegroundColor White
    Write-Host "• dr.khalid.alrashid@beyondrounds.com (Neurology)" -ForegroundColor White
    Write-Host "• admin@beyondrounds.com (Admin)" -ForegroundColor White
    Write-Host ""
    Write-Host "🔗 Login at: http://localhost:3000/auth/login" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Test Features Available:" -ForegroundColor Cyan
    Write-Host "===========================" -ForegroundColor Cyan
    Write-Host "• Complete user profiles with specialties" -ForegroundColor White
    Write-Host "• Payment plans and subscriptions" -ForegroundColor White
    Write-Host "• Matching algorithm with compatibility scores" -ForegroundColor White
    Write-Host "• Chat rooms and messaging system" -ForegroundColor White
    Write-Host "• Notifications system" -ForegroundColor White
    Write-Host "• Admin dashboard with full functionality" -ForegroundColor White
    Write-Host "• Profile preferences and availability" -ForegroundColor White
    Write-Host "• Verification documents system" -ForegroundColor White
    
} catch {
    Write-Host "❌ Error running comprehensive test data generation: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✨ Ready to test the comprehensive medical matching system!" -ForegroundColor Green






