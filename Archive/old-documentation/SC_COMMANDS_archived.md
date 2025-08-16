# SC_COMMANDS.md - Income Clarity Project-Specific SuperClaude Commands

## Project Context
Income Clarity is a dividend income lifestyle management tool with:
- 5 Super Cards (Tax Strategy Engine as competitive moat)
- Advanced dashboard with SPY comparison
- Tax-aware calculations with location intelligence
- Milestone gamification for financial independence

## Custom Commands for Income Clarity

### `/sc:migrate-cards` - Migrate Super Cards to Production
**Purpose**: Consolidate and deploy the 5 Super Cards to production-ready state
**Agent**: frontend-react-specialist
**Persona**: frontend + architect
**MCP Servers**: Magic (UI), Context7 (patterns), Sequential (orchestration)
**Workflow**:
```bash
/sc:migrate-cards [card-name|all] [--optimize] [--test]

# Examples:
/sc:migrate-cards all --optimize          # Migrate all 5 cards with optimization
/sc:migrate-cards TaxStrategy --test      # Migrate Tax Strategy card with tests
/sc:migrate-cards IncomeClarityCard       # Migrate single card
```

**Execution Steps**:
1. Analyze current card implementation
2. Optimize for production (bundle size, performance)
3. Add TypeScript types
4. Implement error boundaries
5. Add loading states
6. Create tests if --test flag
7. Update APP_STRUCTURE_BLUEPRINT.md

### `/sc:implement-moat` - Build Tax Strategy Comparison Engine
**Purpose**: Implement the competitive moat feature comparing dividend vs covered calls vs 4% rule
**Agent**: frontend-react-specialist + backend-node-specialist
**Persona**: architect + frontend + backend
**MCP Servers**: All servers (complex feature)
**Workflow**:
```bash
/sc:implement-moat [--puerto-rico] [--california] [--texas]

# Examples:
/sc:implement-moat --puerto-rico    # Focus on PR tax advantages
/sc:implement-moat --all-states     # Implement all tax jurisdictions
```

**Execution Steps**:
1. Design strategy comparison architecture
2. Implement calculation engines for each strategy
3. Create visualization components
4. Add location-based tax calculations
5. Build interactive comparison UI
6. Add education tooltips
7. Implement strategy recommendations

### `/sc:consolidate-api` - Consolidate 5 API Endpoints
**Purpose**: Merge 5 separate card endpoints into unified super-cards API
**Agent**: backend-node-specialist
**Persona**: backend + architect
**MCP Servers**: Context7 (patterns), Sequential (refactoring)
**Workflow**:
```bash
/sc:consolidate-api [--optimize-cache] [--batch] [--graphql]

# Examples:
/sc:consolidate-api --optimize-cache    # Add caching layer
/sc:consolidate-api --batch             # Enable batch requests
/sc:consolidate-api --graphql           # Convert to GraphQL
```

**Execution Steps**:
1. Analyze current 5 endpoints
2. Design unified API structure
3. Implement data aggregation layer
4. Add caching strategy
5. Optimize query performance
6. Update frontend to use new API
7. Deprecate old endpoints

### `/sc:optimize-dashboard` - Optimize Dashboard Performance
**Purpose**: Improve dashboard load time and performance
**Agent**: frontend-react-specialist
**Persona**: performance + frontend
**MCP Servers**: Playwright (testing), Sequential (analysis)
**Workflow**:
```bash
/sc:optimize-dashboard [--target-ms] [--lazy-load] [--virtualize]

# Examples:
/sc:optimize-dashboard --target-ms 1500    # Target 1.5s load time
/sc:optimize-dashboard --lazy-load         # Implement lazy loading
/sc:optimize-dashboard --virtualize        # Add virtualization
```

### `/sc:implement-pwa` - Complete PWA Implementation
**Purpose**: Finalize PWA features for mobile app experience
**Agent**: frontend-react-specialist
**Persona**: frontend + performance
**MCP Servers**: Magic (UI), Playwright (testing)
**Workflow**:
```bash
/sc:implement-pwa [--offline] [--push] [--install]

# Examples:
/sc:implement-pwa --offline    # Add offline functionality
/sc:implement-pwa --push       # Enable push notifications
/sc:implement-pwa --install    # Improve install experience
```

### `/sc:test-clarity` - Run Income Clarity Test Suite
**Purpose**: Execute comprehensive testing for Income Clarity
**Agent**: general-purpose
**Persona**: qa
**MCP Servers**: Playwright (E2E), Sequential (test planning)
**Workflow**:
```bash
/sc:test-clarity [--unit] [--e2e] [--performance] [--accessibility]

# Examples:
/sc:test-clarity --e2e              # Run E2E tests
/sc:test-clarity --performance      # Test performance metrics
/sc:test-clarity --accessibility    # WCAG compliance testing
```

## Command Chains for Common Workflows

### Tax Moat Implementation Chain
```bash
# Complete Tax Strategy Comparison Engine workflow
/sc:analyze income-clarity --think-hard
/sc:design TaxStrategyEngine --wave-mode
/sc:implement-moat --puerto-rico --magic
/sc:build --api /api/tax-comparison --c7
/sc:test-clarity --e2e
/sc:document TaxStrategy --persona-scribe
```

### Super Cards Migration Chain
```bash
# Migrate all 5 Super Cards to production
/sc:analyze super-cards --seq
/sc:migrate-cards all --optimize
/sc:consolidate-api --optimize-cache
/sc:test-clarity --unit --e2e
/sc:git --smart-commit
```

### Performance Optimization Chain
```bash
# Optimize entire application performance
/sc:analyze --focus performance --play
/sc:optimize-dashboard --target-ms 1000
/sc:improve --perf --wave-mode
/sc:test-clarity --performance
```

## Project-Specific Flags

### Tax Location Flags
- `--puerto-rico` - Focus on PR 0% tax advantage
- `--california` - Include CA high tax scenarios
- `--texas` - Include TX no state tax scenarios
- `--all-states` - Comprehensive tax coverage

### Optimization Flags
- `--optimize-cache` - Add/improve caching
- `--optimize-bundle` - Reduce bundle size
- `--optimize-render` - Improve render performance
- `--optimize-mobile` - Mobile-specific optimizations

### Feature Flags
- `--with-animations` - Add premium animations
- `--with-export` - Add export functionality
- `--with-charts` - Enhanced visualizations
- `--with-ai` - AI-powered insights

## Neo4j Pattern Tracking

Track Income Clarity specific patterns:
```cypher
CREATE (p:ProjectPattern {
    project: "income-clarity",
    command: "{command}",
    success_rate: 0.95,
    avg_execution_time: 120,
    optimizations: ["cache", "lazy-load", "virtualize"]
})
```

## Success Metrics

### Performance Targets
- Dashboard load: <1.5s
- API response: <200ms
- Bundle size: <500KB
- Lighthouse score: >90

### Quality Targets
- TypeScript coverage: 100%
- Test coverage: >80%
- Accessibility: WCAG 2.1 AA
- Mobile responsive: 100%

## Active Development Focus

Current priorities for Income Clarity:
1. ✅ Tax Strategy Comparison Engine (competitive moat)
2. ⏳ Super Cards consolidation and optimization
3. ⏳ API endpoint consolidation
4. ⏳ PWA finalization
5. ⏳ Performance optimization to <1.5s load

Use these commands to accelerate Income Clarity development with SuperClaude intelligence!