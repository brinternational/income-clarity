# 🚨 CLAUDE.md UPDATE ENFORCEMENT SYSTEM

## THE PROBLEM
Agents forget to update local CLAUDE.md files, causing context loss.

## THE SOLUTION: 3-LAYER ENFORCEMENT

### Layer 1: MANDATORY PROMPT INSTRUCTIONS
Every agent task now includes:
```
MANDATORY STEPS:
1. FIRST: Check for and read local CLAUDE.md in working folder
2. PERFORM: [actual task]
3. LAST: Update local CLAUDE.md with changes made
```

### Layer 2: VISUAL REMINDERS
Agents must show these outputs:

**Before Task:**
```
📋 EXECUTION PLAN:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Local Context: ✅ [path/to/CLAUDE.md] loaded
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**After Task:**
```
📝 CONTEXT UPDATE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Updated: [path/to/CLAUDE.md]
Changes: [what was added/modified]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Layer 3: VALIDATION SCRIPT
Run this to check if agents are updating contexts:

```bash
# Check if CLAUDE.md files were updated today
find . -name "CLAUDE.md" -type f -mtime -1 -ls
```

## HOW META ORCHESTRATOR ENFORCES THIS

### 1. In Task Delegation
When META creates a task for an agent, it ALWAYS includes:
- Path to local CLAUDE.md file
- Instruction to read it first
- Instruction to update it last

### 2. Template Enforcement
All task templates now have:
```typescript
CONTEXT:
- Local CLAUDE.md: ${localContext} (MUST READ)

REQUIRED OUTPUT:
- Solution implementation
- Updated CLAUDE.md in working folder
```

### 3. Agent Instructions
Every agent prompt now starts with:
```
MANDATORY: 
1. Read local CLAUDE.md if it exists
2. Do your work
3. Update local CLAUDE.md before finishing
```

## SIMPLE VALIDATION CHECKS

### For Humans: How to Check
```bash
# See which CLAUDE.md files were updated recently
ls -la **/CLAUDE.md

# Check specific folder's context
cat components/super-cards/CLAUDE.md | grep "Recent Changes"
```

### For Agents: Self-Check
Before marking task complete, verify:
- [ ] Did I read the local CLAUDE.md?
- [ ] Did I update Recent Changes section?
- [ ] Did I update Next Steps if needed?

## ENFORCEMENT EXAMPLES

### Good Agent Behavior ✅
```
Agent: "Working on Income Hub..."
1. Reads: components/super-cards/CLAUDE.md
2. Fixes: TypeScript errors
3. Updates: CLAUDE.md with "Fixed TypeScript errors"
4. Reports: "Context updated for next agent"
```

### Bad Agent Behavior ❌
```
Agent: "Working on Income Hub..."
1. Skips: Reading local context
2. Fixes: TypeScript errors
3. Forgets: To update CLAUDE.md
4. Next agent: "What happened here?"
```

## AUTOMATIC REMINDER SYSTEM

### Pre-Task Reminder
```markdown
🔔 REMINDER: Check for local CLAUDE.md first!
   Path: [working/folder/CLAUDE.md]
```

### Post-Task Reminder
```markdown
🔔 REMINDER: Update local CLAUDE.md before finishing!
   - Add to Recent Changes
   - Update Next Steps
   - Note any dependencies
```

## ESCALATION PROTOCOL

If agents consistently forget:
1. **Gentle Reminder**: "Did you update CLAUDE.md?"
2. **Explicit Request**: "Please update CLAUDE.md now"
3. **Task Rejection**: "Task incomplete - CLAUDE.md not updated"

## SUCCESS METRICS

### How to Know It's Working
- Each folder's CLAUDE.md has recent timestamps
- Recent Changes sections show daily updates
- Next Steps sections evolve over time
- Agents reference previous work correctly

### Red Flags
- CLAUDE.md files older than 3 days
- Recent Changes stuck on old dates
- Agents asking "what was done here?"
- Repeated work on same issues

## FOR THE VIBE CODER

**You don't need to enforce anything!** This system is automatic:

1. **META ORCHESTRATOR** adds enforcement to every task
2. **Agents** see reminders in their prompts
3. **System** validates updates happened
4. **You** just watch it work

If you notice agents NOT updating:
- Just say: "Make sure to update CLAUDE.md"
- Or run: `ls -la **/CLAUDE.md` to check timestamps
- Or read: Any CLAUDE.md to see if it's current

## IMPLEMENTATION STATUS

✅ **Already Enforced In:**
- Global /home/devuser/.claude/CLAUDE.md
- META ORCHESTRATOR templates
- Task delegation system

📝 **Rolling Out To:**
- All new agent tasks
- All existing workflows
- All folder contexts

---

**REMEMBER: No context update = Incomplete task!**