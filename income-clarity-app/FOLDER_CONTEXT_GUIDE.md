# 🎯 SIMPLE FOLDER CONTEXT GUIDE FOR VIBE CODERS

## THE BIG IDEA
Each folder has its own CLAUDE.md file that remembers what happens there. When an AI agent enters a folder, it reads the local context first. When it finishes work, it updates the context for the next agent.

**Think of it like leaving sticky notes for the next person!**

## HOW IT WORKS (SUPER SIMPLE)

### 1. Agent Enters Folder
```
Agent: "I need to work on the Income Super Card"
System: *Automatically loads components/super-cards/CLAUDE.md*
Agent: "Oh, I see what's been happening here!"
```

### 2. Agent Does Work
```
Agent: *Fixes bugs, adds features, whatever you asked*
```

### 3. Agent Updates Context
```
Agent: *Updates the CLAUDE.md file*
"Added this, fixed that, next person should know X"
```

### 4. Next Agent Benefits
```
Next Agent: *Enters same folder*
System: *Loads updated CLAUDE.md*
Next Agent: "Perfect, I know exactly what's going on!"
```

## FOLDER STRUCTURE WITH CONTEXT

```
income-clarity-app/
├── CLAUDE_TEMPLATE.md          # Copy this to create new contexts
├── FOLDER_CONTEXT_GUIDE.md     # You're reading this!
│
├── components/
│   ├── super-cards/
│   │   ├── CLAUDE.md          # ✅ Context for all super cards
│   │   ├── IncomeIntelligenceHub.tsx
│   │   └── PerformanceHub.tsx
│   │
│   ├── income/
│   │   ├── CLAUDE.md          # ✅ Context for income components
│   │   └── DividendIntelligenceEngine.tsx
│   │
│   └── charts/
│       └── CLAUDE.md          # 📝 TODO: Add context here
│
├── app/
│   └── api/
│       └── super-cards/
│           ├── CLAUDE.md      # ✅ Context for API endpoints
│           └── income-hub/
│               └── route.ts
│
└── lib/
    └── services/
        └── CLAUDE.md          # 📝 TODO: Add context here
```

## WHAT GOES IN EACH CLAUDE.md?

Keep it SIMPLE - just 5 sections:

```markdown
# [Folder Name] Context

## What This Folder Does
One or two sentences max!

## Key Files & Patterns
- `important-file.tsx` - What it does
- `another-file.ts` - What it does

## Recent Changes
- 2025-08-16: Fixed the thing
- 2025-08-15: Added the feature

## Next Steps
- [ ] Fix this bug
- [ ] Add this feature

## Dependencies
- Uses: `/path/to/something`
- Called by: `/path/to/caller`
```

## FOR AI AGENTS: YOUR WORKFLOW

### When Starting Work:
1. **Check for local CLAUDE.md** in the folder you're working in
2. **Read it first** to understand context
3. **Also check parent folder** for broader context

### When Finishing Work:
1. **Update Recent Changes** section with what you did
2. **Update Next Steps** if you completed or found new tasks
3. **Keep it simple** - other agents need to understand quickly

### Example Update:
```markdown
## Recent Changes
+ 2025-08-16: Fixed TypeScript errors in IncomeHub (NEW)
- 2025-08-10: Old change (REMOVE after 5 entries)

## Next Steps
- [x] Fix TypeScript errors (COMPLETED)
- [ ] Add loading animations (STILL TODO)
+ [ ] Optimize mobile performance (NEW DISCOVERY)
```

## FOR HUMANS: HOW TO USE THIS

### You Don't Need To Do Anything!
- Agents will maintain the CLAUDE.md files automatically
- You can read them to understand what's happening
- You can edit them if you want to guide the agents

### If You Want To Guide Agents:
1. Find the folder where work needs to happen
2. Edit the CLAUDE.md file's "Next Steps" section
3. Add what you want done
4. Next agent will see it and do it!

### Creating New Context Files:
1. Copy `CLAUDE_TEMPLATE.md` to the new folder
2. Rename it to `CLAUDE.md`
3. Fill in the basic info
4. That's it!

## WHY THIS WORKS FOR VIBE CODING

1. **No Memory Loss** - Each folder remembers its own stuff
2. **Simple Structure** - Same 5 sections everywhere
3. **Automatic** - Agents handle the updates
4. **Readable** - You can see what's happening
5. **Scalable** - Just add CLAUDE.md to new folders as needed

## CURRENT STATUS

✅ **Already Set Up:**
- `/components/super-cards/CLAUDE.md`
- `/components/income/CLAUDE.md`
- `/app/api/super-cards/CLAUDE.md`

📝 **Still Need Context Files:**
- `/components/charts/`
- `/components/dashboard/`
- `/lib/services/`
- `/hooks/`
- `/contexts/`

## TIPS FOR SUCCESS

1. **Start Small** - Just add CLAUDE.md files as you work in folders
2. **Keep It Simple** - Don't write essays, just key points
3. **Update Often** - Small frequent updates > big rare updates
4. **Trust The System** - Let agents maintain it
5. **Read When Curious** - Check CLAUDE.md files to see progress

---

**That's it! The system is simple: Each folder has a memory, agents update it, everyone benefits!**

*For agents: Always check for local CLAUDE.md files and update them after work.*
*For humans: Just let it work, read when curious, guide when needed.*