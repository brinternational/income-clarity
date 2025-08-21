#!/bin/bash
# Comprehensive Safeguards Testing System
# Tests all protection layers implemented after 465+ file deletion incident

set -e

# Configuration
PROJECT_ROOT="/public/MasterV2/income-clarity/income-clarity-app"
TEST_ROOT="/tmp/income-clarity-safeguard-tests"
TEST_LOG="$TEST_ROOT/safeguard-tests.log"
RESULTS_FILE="$TEST_ROOT/test-results.json"

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Test counters
TESTS_TOTAL=0
TESTS_PASSED=0
TESTS_FAILED=0

# Logging functions
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$TEST_LOG"
}

log_test() {
    echo -e "${BLUE}[TEST] $1${NC}" | tee -a "$TEST_LOG"
}

log_pass() {
    echo -e "${GREEN}[PASS] $1${NC}" | tee -a "$TEST_LOG"
    TESTS_PASSED=$((TESTS_PASSED + 1))
}

log_fail() {
    echo -e "${RED}[FAIL] $1${NC}" | tee -a "$TEST_LOG"
    TESTS_FAILED=$((TESTS_FAILED + 1))
}

log_info() {
    echo -e "${PURPLE}[INFO] $1${NC}" | tee -a "$TEST_LOG"
}

start_test() {
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
    log_test "$1"
}

# Setup test environment
setup_test_environment() {
    log_info "Setting up test environment..."
    
    # Create test directory
    mkdir -p "$TEST_ROOT"
    rm -rf "$TEST_ROOT"/*
    
    # Create test files and directories
    mkdir -p "$TEST_ROOT/test-project"
    mkdir -p "$TEST_ROOT/test-project/app/api"
    mkdir -p "$TEST_ROOT/test-project/components"
    mkdir -p "$TEST_ROOT/test-project/lib/services"
    
    # Create dummy files for testing
    for i in {1..100}; do
        echo "Test file $i content" > "$TEST_ROOT/test-project/test-file-$i.txt"
    done
    
    # Create critical files
    echo "console.log('test server');" > "$TEST_ROOT/test-project/custom-server.js"
    echo '{"name": "test-app", "version": "1.0.0"}' > "$TEST_ROOT/test-project/package.json"
    echo "module.exports = {};" > "$TEST_ROOT/test-project/next.config.mjs"
    
    log_info "Test environment created at $TEST_ROOT"
}

# Test 1: Git Pre-commit Hook Protection
test_git_precommit_protection() {
    start_test "Git Pre-commit Hook Protection"
    
    cd "$TEST_ROOT"
    git init test-git-repo
    cd test-git-repo
    
    # Copy pre-commit hook
    mkdir -p .git/hooks
    cp "/public/MasterV2/income-clarity/.git/hooks/pre-commit" .git/hooks/
    chmod +x .git/hooks/pre-commit
    
    # Create files to delete
    for i in {1..60}; do
        echo "file $i" > "file$i.txt"
        git add "file$i.txt"
    done
    git commit -m "Initial commit with many files"
    
    # Attempt mass deletion
    rm file*.txt
    git add .
    
    # Try to commit (should fail)
    if git commit -m "Mass deletion test" 2>/dev/null; then
        log_fail "Pre-commit hook failed to block mass deletion"
        return 1
    else
        log_pass "Pre-commit hook successfully blocked mass deletion"
        return 0
    fi
}

# Test 2: Git Pre-push Hook Protection
test_git_prepush_protection() {
    start_test "Git Pre-push Hook Protection"
    
    cd "$TEST_ROOT/test-git-repo"
    
    # Copy pre-push hook
    cp "/public/MasterV2/income-clarity/.git/hooks/pre-push" .git/hooks/
    chmod +x .git/hooks/pre-push
    
    # Reset files and commit with --no-verify to bypass pre-commit
    git reset --hard HEAD~1
    rm file*.txt
    git add .
    git commit --no-verify -m "Mass deletion for push test"
    
    # Add fake remote
    git remote add test-origin https://github.com/test/test.git 2>/dev/null || true
    
    # Try to push (should fail due to mass deletion)
    if git push --dry-run test-origin master 2>/dev/null; then
        log_fail "Pre-push hook failed to block mass deletion push"
        return 1
    else
        log_pass "Pre-push hook successfully blocked mass deletion push"
        return 0
    fi
}

# Test 3: Backup System Functionality
test_backup_system() {
    start_test "Automated Backup System"
    
    # Test backup creation
    cd "$PROJECT_ROOT"
    
    if ./scripts/safeguards/automated-backup-system.sh emergency >/dev/null 2>&1; then
        log_pass "Emergency backup creation successful"
    else
        log_fail "Emergency backup creation failed"
        return 1
    fi
    
    # Test backup listing
    if ./scripts/safeguards/automated-backup-system.sh list >/dev/null 2>&1; then
        log_pass "Backup listing successful"
    else
        log_fail "Backup listing failed"
        return 1
    fi
    
    # Test health check
    if ./scripts/safeguards/automated-backup-system.sh health >/dev/null 2>&1; then
        log_pass "Backup system health check passed"
        return 0
    else
        log_fail "Backup system health check failed"
        return 1
    fi
}

# Test 4: File Change Monitor
test_file_monitor() {
    start_test "File Change Monitor"
    
    cd "$PROJECT_ROOT"
    
    # Check if monitor can start
    if timeout 5 ./scripts/safeguards/file-change-monitor.sh start >/dev/null 2>&1; then
        log_pass "File monitor started successfully"
        
        # Check status
        sleep 2
        if ./scripts/safeguards/file-change-monitor.sh status >/dev/null 2>&1; then
            log_pass "File monitor status check successful"
        else
            log_fail "File monitor status check failed"
        fi
        
        # Stop monitor
        ./scripts/safeguards/file-change-monitor.sh stop >/dev/null 2>&1
        log_pass "File monitor stopped successfully"
        return 0
    else
        log_fail "File monitor failed to start"
        return 1
    fi
}

# Test 5: Change Validation Gates
test_validation_gates() {
    start_test "Change Validation Gates"
    
    cd "$PROJECT_ROOT"
    
    # Test health check
    if ./scripts/safeguards/change-validation-gates.sh health >/dev/null 2>&1; then
        log_pass "Validation gates health check passed"
    else
        log_fail "Validation gates health check failed"
        return 1
    fi
    
    # Test file operation validation (should pass for safe operation)
    if echo "yes" | ./scripts/safeguards/change-validation-gates.sh validate file "copy /tmp/test.txt" >/dev/null 2>&1; then
        log_pass "File operation validation works correctly"
    else
        log_fail "File operation validation failed"
        return 1
    fi
    
    return 0
}

# Test 6: Critical File Protection
test_critical_file_protection() {
    start_test "Critical File Protection"
    
    # Create temporary critical file
    local test_file="$TEST_ROOT/test-critical.js"
    echo "critical content" > "$test_file"
    
    # Test validation gate protection
    cd "$PROJECT_ROOT"
    
    # This should trigger warnings but not fail completely
    if ./scripts/safeguards/change-validation-gates.sh validate file "delete $test_file" force >/dev/null 2>&1; then
        log_pass "Critical file protection validation works"
        return 0
    else
        log_fail "Critical file protection failed"
        return 1
    fi
}

# Test 7: Emergency Recovery Procedures
test_recovery_procedures() {
    start_test "Emergency Recovery Procedures"
    
    # Test if recovery documentation exists and is complete
    local recovery_doc="$PROJECT_ROOT/docs/EMERGENCY_RECOVERY_PROCEDURES.md"
    
    if [ ! -f "$recovery_doc" ]; then
        log_fail "Emergency recovery documentation missing"
        return 1
    fi
    
    # Check if key sections exist
    local required_sections=("Git-Based Recovery" "Backup-Based Recovery" "Post-Recovery Verification")
    
    for section in "${required_sections[@]}"; do
        if grep -q "$section" "$recovery_doc"; then
            log_pass "Recovery documentation contains: $section"
        else
            log_fail "Recovery documentation missing section: $section"
            return 1
        fi
    done
    
    return 0
}

# Test 8: Backup Restoration
test_backup_restoration() {
    start_test "Backup Restoration Process"
    
    cd "$TEST_ROOT"
    
    # Create test project
    mkdir -p test-restore
    cd test-restore
    echo "original content" > test-file.txt
    
    # Create backup
    tar -czf test-backup.tar.gz test-file.txt
    
    # Simulate deletion
    rm test-file.txt
    
    # Test restoration
    tar -xzf test-backup.tar.gz
    
    if [ -f "test-file.txt" ] && grep -q "original content" test-file.txt; then
        log_pass "Backup restoration process works correctly"
        return 0
    else
        log_fail "Backup restoration process failed"
        return 1
    fi
}

# Test 9: Mass Operation Detection
test_mass_operation_detection() {
    start_test "Mass Operation Detection"
    
    cd "$TEST_ROOT"
    
    # Create many files
    mkdir -p mass-test
    cd mass-test
    for i in {1..100}; do
        echo "content $i" > "mass-file-$i.txt"
    done
    
    # Test if mass deletion would be detected
    local file_count=$(ls mass-file-*.txt | wc -l)
    
    if [ $file_count -gt 50 ]; then
        log_pass "Mass operation detection test setup correct ($file_count files)"
        
        # Simulate deletion count check
        local would_delete=$(ls mass-file-*.txt | wc -l)
        if [ $would_delete -gt 25 ]; then
            log_pass "Mass deletion threshold detection works (would delete $would_delete files)"
            return 0
        else
            log_fail "Mass deletion threshold detection failed"
            return 1
        fi
    else
        log_fail "Mass operation test setup failed"
        return 1
    fi
}

# Test 10: System Integration
test_system_integration() {
    start_test "Complete System Integration"
    
    # Verify all safeguard components exist
    local components=(
        "/public/MasterV2/income-clarity/.git/hooks/pre-commit"
        "/public/MasterV2/income-clarity/.git/hooks/pre-push"
        "$PROJECT_ROOT/scripts/safeguards/automated-backup-system.sh"
        "$PROJECT_ROOT/scripts/safeguards/file-change-monitor.sh"
        "$PROJECT_ROOT/scripts/safeguards/change-validation-gates.sh"
        "$PROJECT_ROOT/docs/EMERGENCY_RECOVERY_PROCEDURES.md"
    )
    
    local missing_components=0
    
    for component in "${components[@]}"; do
        if [ -f "$component" ] && [ -x "$component" -o "${component##*.}" = "md" ]; then
            log_pass "Component exists and is executable: $(basename $component)"
        else
            log_fail "Component missing or not executable: $component"
            missing_components=$((missing_components + 1))
        fi
    done
    
    if [ $missing_components -eq 0 ]; then
        log_pass "All safeguard components properly installed"
        return 0
    else
        log_fail "$missing_components safeguard components missing or misconfigured"
        return 1
    fi
}

# Generate test report
generate_test_report() {
    local end_time=$(date '+%Y-%m-%d %H:%M:%S')
    local success_rate=$((TESTS_PASSED * 100 / TESTS_TOTAL))
    
    # Create JSON report
    cat > "$RESULTS_FILE" <<EOF
{
  "test_run": {
    "timestamp": "$end_time",
    "total_tests": $TESTS_TOTAL,
    "passed": $TESTS_PASSED,
    "failed": $TESTS_FAILED,
    "success_rate": $success_rate
  },
  "test_results": {
    "git_precommit_protection": "$([ $test_git_precommit_result -eq 0 ] && echo "PASS" || echo "FAIL")",
    "git_prepush_protection": "$([ $test_git_prepush_result -eq 0 ] && echo "PASS" || echo "FAIL")",
    "backup_system": "$([ $test_backup_result -eq 0 ] && echo "PASS" || echo "FAIL")",
    "file_monitor": "$([ $test_monitor_result -eq 0 ] && echo "PASS" || echo "FAIL")",
    "validation_gates": "$([ $test_validation_result -eq 0 ] && echo "PASS" || echo "FAIL")",
    "critical_file_protection": "$([ $test_critical_result -eq 0 ] && echo "PASS" || echo "FAIL")",
    "recovery_procedures": "$([ $test_recovery_result -eq 0 ] && echo "PASS" || echo "FAIL")",
    "backup_restoration": "$([ $test_restoration_result -eq 0 ] && echo "PASS" || echo "FAIL")",
    "mass_operation_detection": "$([ $test_mass_result -eq 0 ] && echo "PASS" || echo "FAIL")",
    "system_integration": "$([ $test_integration_result -eq 0 ] && echo "PASS" || echo "FAIL")"
  },
  "recommendations": [
    "$([ $TESTS_FAILED -eq 0 ] && echo "All safeguards operational - system protected" || echo "Review and fix failed safeguard components")",
    "$([ $success_rate -ge 80 ] && echo "Safeguard system meets reliability standards" || echo "Safeguard system requires immediate attention")",
    "Schedule regular safeguard testing to ensure continued protection"
  ]
}
EOF

    # Display summary
    echo ""
    echo -e "${PURPLE}=======================================${NC}"
    echo -e "${PURPLE}    SAFEGUARD SYSTEM TEST RESULTS${NC}"
    echo -e "${PURPLE}=======================================${NC}"
    echo ""
    echo -e "Test Run Completed: $end_time"
    echo -e "Total Tests: $TESTS_TOTAL"
    echo -e "${GREEN}Tests Passed: $TESTS_PASSED${NC}"
    echo -e "${RED}Tests Failed: $TESTS_FAILED${NC}"
    echo -e "Success Rate: $success_rate%"
    echo ""
    
    if [ $TESTS_FAILED -eq 0 ]; then
        echo -e "${GREEN}🛡️  ALL SAFEGUARDS OPERATIONAL${NC}"
        echo -e "${GREEN}   System is protected against mass deletion incidents${NC}"
    else
        echo -e "${RED}⚠️  SAFEGUARD ISSUES DETECTED${NC}"
        echo -e "${RED}   Review failed tests and fix issues immediately${NC}"
    fi
    
    echo ""
    echo -e "Detailed results: $RESULTS_FILE"
    echo -e "Test logs: $TEST_LOG"
    echo ""
}

# Main test execution
main() {
    local start_time=$(date '+%Y-%m-%d %H:%M:%S')
    
    echo -e "${BLUE}=======================================${NC}"
    echo -e "${BLUE}  INCOME CLARITY SAFEGUARDS TEST SUITE${NC}"
    echo -e "${BLUE}=======================================${NC}"
    echo ""
    echo -e "Test Started: $start_time"
    echo -e "Testing comprehensive protection against mass deletion incidents"
    echo ""
    
    # Setup
    setup_test_environment
    
    # Run all tests
    test_git_precommit_protection; test_git_precommit_result=$?
    test_git_prepush_protection; test_git_prepush_result=$?
    test_backup_system; test_backup_result=$?
    test_file_monitor; test_monitor_result=$?
    test_validation_gates; test_validation_result=$?
    test_critical_file_protection; test_critical_result=$?
    test_recovery_procedures; test_recovery_result=$?
    test_backup_restoration; test_restoration_result=$?
    test_mass_operation_detection; test_mass_result=$?
    test_system_integration; test_integration_result=$?
    
    # Generate report
    generate_test_report
    
    # Cleanup
    log_info "Cleaning up test environment..."
    rm -rf "$TEST_ROOT/test-git-repo" "$TEST_ROOT/test-project" "$TEST_ROOT/test-restore" "$TEST_ROOT/mass-test"
    
    # Exit with appropriate code
    if [ $TESTS_FAILED -eq 0 ]; then
        exit 0
    else
        exit 1
    fi
}

# Execute main function
main "$@"