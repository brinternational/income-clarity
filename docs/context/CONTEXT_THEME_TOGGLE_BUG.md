# CONTEXT: Theme Toggle Bug in Settings Page

## Problem
The theme toggle in Settings page doesn't actually apply the theme to the DOM. The toggle UI works and saves to database, but the theme doesn't change visually.

## Root Cause
The theme is only being saved to state/database but not applied to the document root element.

## Solution Needed

### 1. Apply theme to DOM when toggled:
```typescript
const handleThemeChange = (newTheme: 'light' | 'dark') => {
  // Update state
  setSettings(prev => ({ ...prev, theme: newTheme }));
  
  // Apply to DOM immediately
  if (newTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  
  // Save to localStorage for persistence
  localStorage.setItem('theme', newTheme);
};
```

### 2. Load theme on mount:
```typescript
useEffect(() => {
  // Check localStorage first
  const savedTheme = localStorage.getItem('theme') || settings.theme;
  
  // Apply to DOM
  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}, []);
```

### 3. Ensure Tailwind dark mode is configured:
In `tailwind.config.js`:
```javascript
module.exports = {
  darkMode: 'class', // Enable class-based dark mode
  // ... rest of config
}
```

## Files to Modify
- `/app/settings/page.tsx` - Add DOM manipulation for theme
- `/app/layout.tsx` - Apply initial theme on app load
- `tailwind.config.js` - Ensure darkMode: 'class' is set

## Testing
1. Navigate to Settings
2. Toggle theme to Dark
3. Verify background becomes dark
4. Refresh page
5. Verify theme persists
6. Toggle back to Light
7. Verify background becomes light

## Priority
HIGH - Theme toggle is a visible feature that affects user experience

## Status
- Created: 2025-08-13
- Bug discovered during Settings implementation
- Needs immediate fix before Profile page