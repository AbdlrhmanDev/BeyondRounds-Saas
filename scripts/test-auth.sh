#!/bin/bash

# Comprehensive Authentication Testing Script
# This script runs all authentication-related tests and provides detailed reporting

echo "🔐 Starting Comprehensive Authentication Flow Testing..."
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to run tests and capture results
run_test_suite() {
    local test_name="$1"
    local test_path="$2"
    
    echo -e "\n${BLUE}Running $test_name...${NC}"
    echo "----------------------------------------"
    
    if npm test -- "$test_path" --verbose --passWithNoTests; then
        echo -e "${GREEN}✅ $test_name PASSED${NC}"
        ((PASSED_TESTS++))
    else
        echo -e "${RED}❌ $test_name FAILED${NC}"
        ((FAILED_TESTS++))
    fi
    ((TOTAL_TESTS++))
}

# Function to check test coverage
check_coverage() {
    echo -e "\n${BLUE}Checking Test Coverage...${NC}"
    echo "----------------------------------------"
    
    npm test -- --coverage --testPathPattern=auth --passWithNoTests
}

# Function to run security-focused tests
run_security_tests() {
    echo -e "\n${YELLOW}🔒 Running Security-Focused Tests...${NC}"
    echo "=========================================="
    
    # Test password validation
    echo "Testing password validation..."
    node -e "
        const passwords = ['123', 'password', 'Password123!', 'MyStr0ng@Pass'];
        passwords.forEach(pwd => {
            const isStrong = pwd.length >= 6 && /[A-Z]/.test(pwd) && /[a-z]/.test(pwd) && /\d/.test(pwd);
            console.log(\`Password '\${pwd}': \${isStrong ? 'STRONG' : 'WEAK'}\`);
        });
    "
    
    # Test email validation
    echo -e "\nTesting email validation..."
    node -e "
        const emails = ['test@example.com', 'invalid-email', '@example.com', 'test@'];
        emails.forEach(email => {
            const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
            console.log(\`Email '\${email}': \${isValid ? 'VALID' : 'INVALID'}\`);
        });
    "
}

# Function to generate test report
generate_report() {
    echo -e "\n${BLUE}📊 Test Report${NC}"
    echo "=================="
    echo "Total Test Suites: $TOTAL_TESTS"
    echo -e "Passed: ${GREEN}$PASSED_TESTS${NC}"
    echo -e "Failed: ${RED}$FAILED_TESTS${NC}"
    
    if [ $FAILED_TESTS -eq 0 ]; then
        echo -e "\n${GREEN}🎉 All authentication tests passed!${NC}"
        exit 0
    else
        echo -e "\n${RED}⚠️  Some tests failed. Please review the output above.${NC}"
        exit 1
    fi
}

# Main execution
echo "Starting authentication test suite..."

# Run individual test suites
run_test_suite "Authentication Hook Tests" "tests/hooks/useAuthUser.test.tsx"
run_test_suite "Authentication Flow Tests" "tests/auth/auth-flow.test.tsx"
run_test_suite "Authentication Integration Tests" "tests/auth/auth-integration.test.tsx"
run_test_suite "Authentication Hooks Tests" "tests/auth/auth-hooks.test.tsx"

# Run security tests
run_security_tests

# Check coverage
check_coverage

# Generate final report
generate_report
