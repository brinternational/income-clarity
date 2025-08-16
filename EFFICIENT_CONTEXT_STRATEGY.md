# EFFICIENT CONTEXT STRATEGY FOR AGENTS
*Reducing agent task time from hours to minutes*

## THE PROBLEM
Agents are receiving 50-150k tokens of context, causing:
- 1+ hour task completion times
- Context processing overhead
- Irrelevant information overload
- Agents getting "stuck" compacting/processing

## THE SOLUTION: TARGETED CONTEXT

### 🎯 PRINCIPLE: "MINIMUM VIABLE CONTEXT"
Give agents ONLY what they need, nothing more.

## CONTEXT LEVELS (REVISED)

### 🔴 MICRO (1-5k tokens) - Simple Fixes
```typescript
Task({
  subagent_type: "root-cause-investigator",
  prompt: `
    FIX THIS ERROR:
    Error: ${error.message}
    File: ${error.file}
    Line: ${error.line}
    
    The error is in this specific function/component.
    Read ONLY the affected file and fix the error.
    Do not refactor or improve unrelated code.
  `
})
```

### 🟡 FOCUSED (5-15k tokens) - Targeted Changes
```typescript
Task({
  subagent_type: "appropriate-specialist",
  prompt: `
    TASK: ${specific_task}
    TARGET: ${target_file}
    
    Instructions:
    1. Read the target file
    2. If needed, read ONE similar example
    3. Make the specific change requested
    
    DO NOT:
    - Read entire directories
    - Load all similar components
    - Include documentation files
  `
})
```

### 🟢 SMART (15-30k tokens) - New Features
```typescript
Task({
  subagent_type: "appropriate-specialist", 
  prompt: `
    BUILD: ${feature_name}
    LOCATION: ${target_directory}
    
    REFERENCE PATTERN:
    Look at ${one_similar_example} as a pattern to follow.
    
    REQUIRED CONTEXT:
    1. The ONE example file
    2. Required types/interfaces
    3. The API endpoint (if needed)
    
    Build the feature following the pattern.
    Keep it simple and focused.
  `
})
```

## WHAT NOT TO INCLUDE

### ❌ NEVER Include:
- Entire folders of components
- All Super Cards when building one
- Complete service files (15k+ tokens)
- Multiple examples of the same pattern
- Documentation/blueprint files (unless specifically needed)
- Historical context or changelogs
- Test files (unless writing tests)

### ✅ ALWAYS Include:
- The specific error or requirement
- The exact file path to work on
- ONE good example (if needed)
- Direct dependencies only

## SMART PATTERNS FOR COMMON TASKS

### Bug Fix
```typescript
// BAD: 50k tokens
"Here's all the context about the app, all similar components, 
the entire service layer, and the complete schema..."

// GOOD: 5k tokens
"Fix this TypeScript error in /components/Button.tsx line 45.
The error is: 'Property onClick does not exist'.
Add the missing prop to the interface."
```

### Add Feature to Component
```typescript
// BAD: 100k tokens
"Here are all 5 Super Cards, all their APIs, 
the complete database service..."

// GOOD: 15k tokens  
"Add a refresh button to PerformanceHub.
Look at IncomeHub's refresh button as an example.
Location: /components/super-cards/performance-hub/index.tsx"
```

### Create New API Endpoint
```typescript
// BAD: 80k tokens
"Here's the entire API directory, all routes,
complete service layer, full schema..."

// GOOD: 10k tokens
"Create GET endpoint at /api/portfolio/summary.
Follow pattern from /api/portfolio/holdings/route.ts.
Return: { totalValue, totalGain, totalYield }"
```

## DELEGATION EXAMPLES

### Before (Slow):
```typescript
Task({
  prompt: `
    ${await Read(entire_super_cards_folder)} // 100k
    ${await Read(all_api_routes)} // 50k
    ${await Read(complete_services)} // 50k
    
    Build a new dashboard widget.
  `
}) // 200k tokens = 1+ hour
```

### After (Fast):
```typescript
Task({
  prompt: `
    Build a dashboard widget at /components/dashboard/NewWidget.tsx
    
    Pattern to follow: /components/dashboard/QuickStats.tsx
    
    Requirements:
    - Show portfolio total
    - Show daily change
    - Use existing Card component
    
    That's it. Keep it simple.
  `
}) // 10k tokens = 5-10 minutes
```

## MEASURING SUCCESS

### Before:
- Agent task time: 30-60+ minutes
- Context size: 50-150k tokens
- Success rate: 70%
- Often includes unnecessary changes

### After (Target):
- Agent task time: 5-15 minutes
- Context size: 5-30k tokens
- Success rate: 90%
- Focused, specific changes only

## IMPLEMENTATION CHECKLIST

When delegating to agents:
- [ ] Is the task clearly defined?
- [ ] Have I specified the EXACT file(s) to work on?
- [ ] Am I including only ONE example (if needed)?
- [ ] Have I explicitly said what NOT to read?
- [ ] Is my context under 30k tokens?
- [ ] Have I told them to keep it simple?

## EMERGENCY PROTOCOL

If an agent is taking > 20 minutes:
1. Cancel the task
2. Reduce context by 75%
3. Make the task more specific
4. Try again with MICRO context

## KEY INSIGHT

**Agents don't need to understand the entire system to fix a button.**

They just need:
- Where the button is
- What's wrong with it  
- How to fix it

That's it. Everything else is noise that slows them down.

---

Remember: The best context is the smallest context that gets the job done.