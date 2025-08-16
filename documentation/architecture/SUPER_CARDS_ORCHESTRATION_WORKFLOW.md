# SUPER CARDS ORCHESTRATION WORKFLOW
*Updated Meta Orchestrator workflow for 5 Super Card architecture*
*Created: 2025-01-09*

## 🎯 Meta Orchestrator Daily Workflow for Super Cards

### Step-by-Step Orchestration Process

```markdown
1. Read /RULES/README.md → /RULES/rules.md →
   /RULES/context-management-rules.md → /RULES/pm-rules.md

2. Read /income-clarity/SUPER_CARDS_BLUEPRINT.md to understand
   the 5 Super Card architecture

3. Read /income-clarity/SUPER_CARDS_MASTER_TODO.md and verify all
   Super Card features have todos

4. If any Super Card features are missing from master todo, add them

5. Identify top 5 CRITICAL/HIGH priority tasks from the Super Cards todo

6. Check /ACTIVE_TODOS/super-cards-todos.json for any in-progress work

7. Review your memory at /AGENT_MEMORY/claude-base/memory.md

8. Check your mailbox at /AGENT_MEMORY/mailbox/claude-base/inbox/

9. For each high-priority task, determine:
   - Can it be worked on now? (dependencies met?)
   - Which agent(s) should handle it?
   - Can multiple tasks run in parallel?

10. Create task context in /CONTEXT_MAP/ACTIVE_TASKS/[TASK-ID]/ with:
    - README.md (requirements for Super Card)
    - current-state.md (what exists in current implementation)
    - technical-spec.md (Super Card implementation plan)
    - component-mapping.md (old components → Super Card mapping)
    - api-consolidation.md (how APIs will be merged)
```

## 📊 5 SUPER CARDS ARCHITECTURE

### 1. Performance Hub
**Purpose**: Portfolio performance and SPY comparison
**Combines**:
- SPY Comparison Card
- Holdings Performance Card
- Portfolio Overview Card
- Individual holding vs SPY bars
**Status**: Components exist, needs consolidation

### 2. Income Intelligence Hub
**Purpose**: Income clarity, projections, and stability
**Combines**:
- Income Clarity Card
- Income Progression Card
- Income Stability Score Card
- Cash Flow Projection Card
- Dividend Calendar
**Status**: Most components built, needs hub creation

### 3. Tax Strategy Hub
**Purpose**: Tax optimization and savings
**Combines**:
- Tax Intelligence Engine
- Tax Savings Calculator Card
- Tax Planning Card
- Tax Settings
- State comparison tools
**Status**: Engine complete, cards need integration

### 4. Portfolio Strategy Hub
**Purpose**: Strategy health and rebalancing
**Combines**:
- Strategy Health Card
- Rebalancing Intelligence Card
- Strategy Comparison Engine
- Margin Intelligence
**Status**: Components exist separately

### 5. Financial Planning Hub
**Purpose**: FIRE progress and milestones
**Combines**:
- FIRE Progress Card
- Expense Milestones
- Above Zero Tracker
- Goal setting tools
**Status**: Partially implemented

## 🚀 PRIORITY MATRIX FOR SUPER CARDS

### Critical Path (Week 1)
1. **Archive old 18-card system** → All agents
2. **Create Super Card containers** → frontend-react-specialist
3. **Consolidate API endpoints** → backend-node-specialist
4. **Update navigation for 5 cards** → frontend-react-specialist

### Integration Phase (Week 2)
1. **Integrate existing components into hubs** → frontend-react-specialist
2. **Implement state management** → backend-node-specialist
3. **Create tab navigation within cards** → frontend-react-specialist
4. **Optimize data fetching** → backend-node-specialist

### Optimization Phase (Week 3)
1. **Mobile responsiveness** → frontend-react-specialist
2. **Performance optimization** → backend-node-specialist
3. **Caching strategy** → backend-node-specialist
4. **Progressive disclosure** → frontend-react-specialist

### Polish Phase (Week 4)
1. **Animations and transitions** → frontend-react-specialist
2. **Error handling** → backend-node-specialist
3. **Testing** → qa-test-specialist
4. **Documentation** → all agents

## 📋 TASK CONTEXT TEMPLATE FOR SUPER CARDS

### /CONTEXT_MAP/ACTIVE_TASKS/[SUPER-CARD-NAME]/README.md
```markdown
# [Super Card Name] Implementation Task

## Overview
Which of the 5 Super Cards this task relates to

## Components to Integrate
- List of existing components to include
- New components needed
- Components to archive

## Data Requirements
- API endpoints needed
- State management requirements
- Caching strategy

## User Experience
- Tab structure
- Progressive disclosure strategy
- Mobile considerations

## Dependencies
- Other Super Cards
- Backend services
- External APIs

## Success Criteria
- Performance targets
- User experience goals
- Technical requirements
```

### /CONTEXT_MAP/ACTIVE_TASKS/[SUPER-CARD-NAME]/current-state.md
```markdown
# Current Implementation State

## Existing Components
- Component name → location → status
- Integration readiness assessment

## API Endpoints
- Current endpoints serving this data
- Consolidation opportunities

## State Management
- Current state implementation
- Migration requirements

## Known Issues
- Bugs to fix
- Performance problems
- UX issues
```

### /CONTEXT_MAP/ACTIVE_TASKS/[SUPER-CARD-NAME]/technical-spec.md
```markdown
# Technical Implementation Specification

## Architecture
- Component hierarchy
- Data flow design
- State management approach

## API Design
- Consolidated endpoint structure
- Request/response format
- Caching strategy

## Performance Targets
- Load time: <2 seconds
- Update frequency
- Bundle size limits

## Implementation Steps
1. Create hub container
2. Integrate components
3. Connect data sources
4. Implement caching
5. Add progressive disclosure
6. Optimize performance
7. Test thoroughly
```

## 🤖 AGENT ROLE ASSIGNMENTS FOR SUPER CARDS

### Frontend React Specialist
**Primary Responsibilities**:
- Create 5 Super Card hub containers
- Integrate existing components into hubs
- Implement tab navigation and progressive disclosure
- Ensure mobile responsiveness
- Add animations and polish

**Key Tasks**:
- SUPER-CARD-UI-* tasks
- Component integration
- Mobile optimization
- User experience enhancement

### Backend Node Specialist
**Primary Responsibilities**:
- Consolidate API endpoints (30+ → 5)
- Implement Zustand state management
- Create multi-layer caching strategy
- Optimize data fetching
- Handle real-time updates

**Key Tasks**:
- SUPER-CARD-API-* tasks
- State management migration
- Performance optimization
- Caching implementation

### QA Test Specialist
**Primary Responsibilities**:
- Test Super Card integrations
- Validate data accuracy
- Performance testing
- Mobile testing
- Accessibility testing

**Key Tasks**:
- SUPER-CARD-TEST-* tasks
- E2E test creation
- Performance benchmarking
- Cross-browser testing

## 📊 SUCCESS METRICS

### Technical Metrics
- **Load Time**: <2 seconds for any Super Card
- **API Calls**: Reduced from 30+ to 5 consolidated endpoints
- **Bundle Size**: <500KB per Super Card
- **Cache Hit Rate**: >80% for repeat visits

### User Experience Metrics
- **Feature Discovery**: 80% of features easily found
- **Mobile Performance**: Smooth 60fps scrolling
- **Progressive Disclosure**: 3 clicks max to any feature
- **Emotional Validation**: Daily SPY comparison prominent

### Business Metrics
- **Development Time**: 4 weeks to production
- **Code Reuse**: >80% existing components reused
- **Maintenance**: 5 cards easier than 18+ cards
- **User Satisfaction**: Improved information architecture

## 🔄 DAILY ORCHESTRATION CHECKLIST

### Morning Review
- [ ] Read Super Cards blueprint and todos
- [ ] Check agent memories for progress
- [ ] Review active tasks in todos.json
- [ ] Identify blockers and dependencies

### Task Assignment
- [ ] Assign tasks to appropriate agents
- [ ] Ensure parallel work where possible
- [ ] Create task contexts with full specs
- [ ] Set clear success criteria

### Progress Monitoring
- [ ] Check agent outputs in mailbox
- [ ] Validate work against Super Card architecture
- [ ] Update todos with completion status
- [ ] Document decisions and learnings

### End of Day
- [ ] Update memory with progress
- [ ] Archive completed work
- [ ] Plan next day priorities
- [ ] Communicate status to team

## 🎯 IMMEDIATE NEXT STEPS

1. **Complete Archival** (Day 1)
   - Execute ARCHIVE_MIGRATION_TODO.md
   - Move all old files to /Archive/
   - Clean project structure

2. **Create New Documentation** (Day 2)
   - Write SUPER_CARDS_BLUEPRINT.md
   - Create SUPER_CARDS_MASTER_TODO.md
   - Update all references

3. **Begin Integration** (Day 3)
   - Start with Performance Hub
   - Integrate existing components
   - Test consolidated approach

4. **Scale to All Cards** (Week 2)
   - Replicate pattern to other 4 cards
   - Ensure consistency
   - Optimize performance

---

**Remember**: The goal is to consolidate 18+ cards into 5 powerful Super Cards that provide better user experience, easier maintenance, and faster performance.