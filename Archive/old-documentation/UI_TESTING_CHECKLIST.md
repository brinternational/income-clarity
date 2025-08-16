# UI TESTING CHECKLIST
*Quick manual checks after UI changes*

## 🚨 After ANY UI Change, Check These:

### 1. Build Errors (Most Common)
```bash
# Check console for:
- "Duplicate export 'default'"
- "Expected '</', got..."  
- "Module parse failed"
- Any red error messages
```

### 2. CSS Working
- [ ] Colors showing (not all gray/white)
- [ ] Rounded corners visible
- [ ] Shadows on cards
- [ ] Proper spacing between elements

### 3. Basic Functionality
- [ ] Page loads without console errors
- [ ] Can click "Enter Demo" 
- [ ] Dashboard displays
- [ ] Theme switcher works (if added)

### 4. Common React Errors
- [ ] No infinite loops (page freezing)
- [ ] No "Cannot read property of undefined"
- [ ] No white screen of death

## 🔧 Quick Fix Guide

**Duplicate Export Error**
- Search for "export default" - should only have ONE

**JSX Syntax Errors**  
- Replace `<` with `&lt;`
- Replace `>` with `&gt;`

**CSS Not Working**
- Check PostCSS config
- Verify Tailwind version (v3 not v4)
- Check globals.css imports

## 📝 Workflow Suggestion

When using UI agents:
1. Give them the task
2. After they complete, YOU manually:
   - Refresh the page
   - Check browser console (F12)
   - Look for obvious visual issues
3. If errors found, give them back to UI agent to fix

This takes 30 seconds and catches 90% of issues!