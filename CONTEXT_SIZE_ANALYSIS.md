# CONTEXT SIZE ANALYSIS
*Finding the optimal context size for agent tasks*

## ACTUAL FILE SIZES (in tokens, ~4 chars = 1 token)

### Typical Component Sizes:
- **Super Card Component**: 600-800 lines = ~8-12k tokens
- **API Route**: 100-200 lines = ~2-3k tokens  
- **Service Method**: 50-100 lines = ~1-2k tokens
- **Database Schema**: 200-300 lines = ~3-4k tokens
- **Type Definitions**: 100-200 lines = ~1-2k tokens

## TASK-BASED CONTEXT REQUIREMENTS

### 🔧 BUG FIXES (15-25k tokens optimal)
**What agents need:**
1. The broken file: ~5-10k tokens
2. Error stack trace: ~1k tokens
3. Related imports/types: ~3-5k tokens
4. One working example (if pattern-based): ~5-10k tokens

**Total: 15-25k tokens** ✅

### 🎨 UI MODIFICATIONS (20-35k tokens optimal)
**What agents need:**
1. Target component: ~8-12k tokens
2. Parent component (for context): ~5-8k tokens
3. Shared components used: ~3-5k tokens
4. Style patterns/theme: ~2-3k tokens
5. Types/interfaces: ~2-3k tokens

**Total: 20-35k tokens** ✅

### 🚀 NEW FEATURES (30-50k tokens optimal)
**What agents need:**
1. ONE similar complete example: ~10-15k tokens
2. API endpoint pattern: ~3-5k tokens
3. Database service pattern: ~5-8k tokens
4. Types and interfaces: ~3-5k tokens
5. Component library samples: ~5-8k tokens
6. Schema (relevant parts): ~2-3k tokens

**Total: 30-50k tokens** ✅

### 🏗️ ARCHITECTURAL CHANGES (50-80k tokens optimal)
**What agents need:**
1. Current architecture files: ~15-20k tokens
2. Migration patterns: ~10-15k tokens
3. Multiple affected components: ~20-30k tokens
4. Test patterns: ~5-10k tokens
5. Documentation: ~5-10k tokens

**Total: 50-80k tokens** ✅

## REVISED CONTEXT LOADING STRATEGY

### ✅ OPTIMAL APPROACH: "GRADUATED CONTEXT"

```typescript
// LEVEL 1: MINIMAL (15-25k) - Bug Fixes & Simple Changes
Task({
  subagent_type: "root-cause-investigator",
  prompt: `
    TASK: Fix ${specific_bug}
    
    CONTEXT PROVIDED:
    1. Error details and stack trace
    2. The affected file: ${file_path}
    3. Any directly imported dependencies
    
    Total context: ~20k tokens
    
    Fix the specific issue. Don't refactor unrelated code.
  `
})

// LEVEL 2: STANDARD (25-40k) - Feature Modifications
Task({
  subagent_type: "appropriate-specialist",
  prompt: `
    TASK: ${feature_modification}
    
    CONTEXT PROVIDED:
    1. Target component to modify
    2. ONE similar component as reference
    3. Shared utilities and types
    4. Relevant API endpoint (if applicable)
    
    Total context: ~35k tokens
    
    You have everything needed. Don't search for more files.
  `
})

// LEVEL 3: COMPREHENSIVE (40-60k) - New Features
Task({
  subagent_type: "appropriate-specialist",
  prompt: `
    TASK: Build ${new_feature}
    
    CONTEXT PROVIDED:
    1. Complete example of similar feature
    2. API pattern and database service
    3. All required types and interfaces
    4. UI component library examples
    5. Relevant schema sections
    
    Total context: ~50k tokens
    
    Everything you need is provided. Build following the patterns shown.
  `
})

// LEVEL 4: ARCHITECTURAL (60-80k) - System Changes
Task({
  subagent_type: "systems-architect",
  prompt: `
    TASK: ${architectural_change}
    
    CONTEXT PROVIDED:
    1. Current system architecture
    2. Target architecture pattern
    3. Migration examples
    4. Affected components list
    5. Testing requirements
    
    Total context: ~70k tokens
    
    Complete architectural context provided.
  `
})
```

## WHY THIS WORKS BETTER

### ❌ Problem with 10k tokens:
- **Too small** for real features
- Agent needs to search for patterns
- Missing critical context
- Multiple round trips

### ❌ Problem with 100k+ tokens:
- **Too much** to process efficiently  
- Agent spends time filtering noise
- Includes irrelevant information
- Processing overhead dominates

### ✅ Sweet spot (20-60k tokens):
- **Just right** for most tasks
- Complete context without overwhelm
- No need to search for more
- Fast processing time

## PRACTICAL EXAMPLES

### Example 1: Fix a TypeScript Error
```typescript
// TOO LITTLE (5k):
"Fix the error in Button.tsx"
// Agent: "I need to see the error and related types..."

// TOO MUCH (100k):
[Entire component library + all uses]
// Agent spends 30 mins processing...

// JUST RIGHT (20k):
"Fix this TypeScript error:
- Error: [specific error]
- File: Button.tsx [included]
- Interface: ButtonProps [included]
- Parent: Card.tsx [relevant parts included]"
// Agent: "I have everything I need!" ✅
```

### Example 2: Add New Super Card Tab
```typescript
// TOO LITTLE (10k):
"Add a new tab to PerformanceHub"
// Agent: "I need to see the tab pattern..."

// TOO MUCH (150k):
[All 5 Super Cards + all tabs + entire codebase]
// Agent: *dies from context overload*

// JUST RIGHT (40k):
"Add new 'Analytics' tab to PerformanceHub:
- Current PerformanceHub [included]
- Example tab from IncomeHub [included]  
- Tab component pattern [included]
- Required types [included]"
// Agent: "Clear pattern to follow!" ✅
```

## RECOMMENDED DEFAULTS

### By Task Type:
- **Typo/Simple Fix**: 5-10k tokens
- **Bug Fix**: 15-25k tokens
- **UI Change**: 20-35k tokens
- **Add Feature**: 30-50k tokens
- **New Component**: 40-60k tokens
- **Refactor**: 50-70k tokens
- **Architecture**: 60-80k tokens

## CRITICAL RULE

**"Include everything they need, but ONLY what they need"**

### How to verify you have the right amount:
1. Can the agent complete the task without searching? ✅
2. Is the context under 80k tokens? ✅
3. Are you including only 1-2 examples max? ✅
4. Is every file included actually needed? ✅

If all are YES, you have the optimal context size.