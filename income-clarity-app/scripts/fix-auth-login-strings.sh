#!/bin/bash

# Fix stylesheet MIME type error by replacing '/auth/login' strings
# This prevents Next.js HMR from treating them as stylesheet imports

echo "Fixing '/auth/login' strings to prevent stylesheet errors..."

# Files to fix
files=(
  "app/dashboard/expenses/page.tsx"
  "app/dashboard/strategy/page.tsx"
  "app/dashboard/income/page.tsx"
  "app/dashboard/demo/page.tsx"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "Fixing $file..."
    # Replace router.push('/auth/login') with router.push('/auth' + '/login')
    sed -i "s/router\.push('\/auth\/login')/router.push('\/auth' + '\/login')/g" "$file"
    # Replace window.location.href = '/auth/login' with window.location.href = '/auth' + '/login'
    sed -i "s/window\.location\.href = '\/auth\/login'/window.location.href = '\/auth' + '\/login'/g" "$file"
  fi
done

# Fix auth/callback/page.tsx separately (it has redirect)
if [ -f "app/auth/callback/page.tsx" ]; then
  echo "Fixing app/auth/callback/page.tsx..."
  sed -i "s/redirect('\/auth\/login')/redirect('\/auth' + '\/login')/g" "app/auth/callback/page.tsx"
fi

echo "✅ All '/auth/login' strings have been fixed!"