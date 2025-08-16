# Next.js Build Error Context - CRITICAL

## Error Message
```
ENOENT: no such file or directory, open '/public/MasterV2/income-clarity/income-clarity-app/.next/routes-manifest.json'
```

## Problem Analysis
The `.next` build directory is missing or corrupted. The `routes-manifest.json` file is generated during the Next.js build process and is essential for routing.

## Root Causes (Possible)
1. Build was never run or failed
2. `.next` directory was deleted/corrupted
3. Build process interrupted
4. Port management issues causing incomplete builds
5. Node process killed during build

## Solution Steps
1. **Clean Build Directory**
   ```bash
   cd /public/MasterV2/income-clarity/income-clarity-app
   rm -rf .next
   rm -rf node_modules/.cache
   ```

2. **Check Port Status**
   ```bash
   npm run port:status
   npm run port:kill  # If needed
   ```

3. **Fresh Build**
   ```bash
   npm run build
   # OR for development:
   npm run dev
   ```

4. **Verify Build Output**
   - Check `.next` directory exists
   - Verify `routes-manifest.json` exists
   - Check for build errors in console

## Files to Check
- `/income-clarity-app/package.json` - Build scripts
- `/income-clarity-app/next.config.js` - Build configuration
- `/income-clarity-app/.next/` - Build output directory
- Port management scripts

## Common Next.js Build Issues
- Missing dependencies
- TypeScript errors blocking build
- Memory issues during build
- Port conflicts
- Corrupted node_modules

## Success Criteria
- [ ] `.next` directory exists
- [ ] `routes-manifest.json` present
- [ ] No build errors
- [ ] App runs on port 3000
- [ ] All routes accessible

## Priority: CRITICAL
Without the build directory, the app cannot run. This blocks all development and testing.