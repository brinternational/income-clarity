# Testing Responsibilities by Agent

## Overview
This document defines which tests each agent should run to ensure quality and prevent regressions.

## Agent Testing Matrix

### Frontend Agent (React/UI Specialist)
**Primary Responsibility**: User interface and component functionality

**Tests to Run**:
- `npm test` - All Jest unit tests for components
- `npm run test:e2e` - E2E tests for user interactions
- Component-specific tests in `__tests__/components/`
- Visual regression testing

**Test Categories**:
- Component rendering
- User interactions (clicks, form inputs)
- Responsive design
- Accessibility compliance
- React hooks behavior
- Form validation

**Completion Requirements**:
- All component tests passing
- E2E tests covering user flows
- No console errors in browser
- Accessibility audit passes

### Backend Node Specialist
**Primary Responsibility**: Server-side functionality and API endpoints

**Tests to Run**:
- `npm test` - API route tests
- Integration tests for database operations
- Authentication flow tests
- Server-side rendering tests

**Test Categories**:
- API endpoint responses
- Authentication logic
- Database queries
- Server-side validation
- Error handling
- Performance under load

**Completion Requirements**:
- All API tests passing
- No server errors in logs
- Authentication flows work
- Database operations succeed

### Meta Orchestrator (claude-base)
**Primary Responsibility**: Overall system integrity and quality gates

**Tests to Run**:
- `npm run test:all` - Complete test suite
- `npm run build` - Production build verification
- `npm run lint` - Code quality checks
- `npm run ci` - Full CI pipeline

**Test Categories**:
- System integration
- Cross-feature compatibility
- Build process verification
- Deployment readiness
- Performance benchmarks

**Completion Requirements**:
- ALL tests must pass (no exceptions)
- Production build succeeds
- No lint errors
- Performance within budget

## Test Execution Standards

### Before Code Changes
```bash
# Check current status
npm test -- --watchAll=false
```

### After Code Changes
```bash
# Run affected tests
npm test -- --watchAll=false
npm run test:e2e
```

### Before Task Completion
```bash
# Full validation
npm run test:all
npm run build
```

## Test Reporting Format

### Required in Completion Messages

```
## Test Results
- Unit Tests: XXX/366 passing
- E2E Tests: XX/XX passing  
- Build Status: ✅ Success / ❌ Failed
- Lint Errors: 0

### Failed Tests (if any):
- TestName: Reason for failure
- TestName2: Reason for failure

### Actions Taken:
- Fixed component rendering issue
- Updated test assertions
- Resolved import conflicts
```

### Success Criteria

**NEVER mark a task complete unless**:
1. All relevant tests are passing
2. No new test failures introduced
3. Test results are documented
4. Build succeeds without errors

### Failure Handling

**If tests fail**:
1. Document exactly which tests failed
2. Investigate and fix the root cause
3. Re-run tests to verify fix
4. Do not proceed until resolved

**Common Test Failures**:
- Import/export issues → Fix module paths
- Component rendering → Check React component structure  
- API responses → Verify server is running on correct port
- E2E timeouts → Check server startup time
- Hydration mismatches → Review SSR/client differences

## Quality Gates

### No Deployment Without:
- All unit tests passing
- All E2E tests passing  
- Production build succeeding
- Zero lint errors
- Performance within budget

### No Task Completion Without:
- Relevant tests written/updated
- All tests passing
- Test results documented
- No regressions introduced

## Emergency Procedures

### If Test Suite is Completely Broken:
1. Stop all development work
2. Escalate to Meta Orchestrator
3. Investigate test infrastructure
4. Fix test setup before continuing
5. Re-establish baseline

### If E2E Tests Won't Run:
1. Check server is running on port 3000
2. Verify Playwright configuration
3. Check for port conflicts
4. Review server startup logs
5. Fix infrastructure before feature work

---

**Remember**: Testing is not optional. Quality is everyone's responsibility.