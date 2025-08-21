#!/bin/bash

# Service Organization Import Update Script
# Updates all import statements to new service organization structure

echo "🔄 Updating import statements for reorganized services..."

# Update logging service imports
echo "📝 Updating logging service imports..."
find /public/MasterV2/income-clarity/income-clarity-app -type f -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | \
  xargs sed -i "s|from '@/lib/logging/logger.service'|from '@/lib/services/infrastructure/logger.service'|g"

find /public/MasterV2/income-clarity/income-clarity-app -type f -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | \
  xargs sed -i "s|from '@/lib/logging/audit-logger.service'|from '@/lib/services/infrastructure/audit-logger.service'|g"

# Update monitoring service imports
echo "📊 Updating monitoring service imports..."
find /public/MasterV2/income-clarity/income-clarity-app -type f -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | \
  xargs sed -i "s|from '@/lib/monitoring/metrics.service'|from '@/lib/services/infrastructure/metrics.service'|g"

find /public/MasterV2/income-clarity/income-clarity-app -type f -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | \
  xargs sed -i "s|from '@/lib/monitoring/error-reporter.service'|from '@/lib/services/infrastructure/error-reporter.service'|g"

find /public/MasterV2/income-clarity/income-clarity-app -type f -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | \
  xargs sed -i "s|from '@/lib/monitoring/monitoring.service'|from '@/lib/services/infrastructure/monitoring.service'|g"

# Update job service imports
echo "⚙️ Updating job service imports..."
find /public/MasterV2/income-clarity/income-clarity-app -type f -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | \
  xargs sed -i "s|from '@/lib/jobs/queue-wrapper.service'|from '@/lib/services/infrastructure/queue-wrapper.service'|g"

find /public/MasterV2/income-clarity/income-clarity-app -type f -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | \
  xargs sed -i "s|from '@/lib/jobs/job-scheduler.service'|from '@/lib/services/infrastructure/job-scheduler.service'|g"

find /public/MasterV2/income-clarity/income-clarity-app -type f -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | \
  xargs sed -i "s|from '@/lib/jobs/queue-config'|from '@/lib/services/infrastructure/queue-config'|g"

# Update auth service imports
echo "🔐 Updating authentication service imports..."
find /public/MasterV2/income-clarity/income-clarity-app -type f -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | \
  xargs sed -i "s|from '@/lib/auth/session.service'|from '@/lib/services/auth/session.service'|g"

find /public/MasterV2/income-clarity/income-clarity-app -type f -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | \
  xargs sed -i "s|from '@/lib/auth/auth-debug.service'|from '@/lib/services/auth/auth-debug.service'|g"

find /public/MasterV2/income-clarity/income-clarity-app -type f -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | \
  xargs sed -i "s|from '@/lib/auth/edge-session-validator'|from '@/lib/services/auth/edge-session-validator'|g"

find /public/MasterV2/income-clarity/income-clarity-app -type f -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | \
  xargs sed -i "s|from '@/lib/auth/lite-production-auth'|from '@/lib/services/auth/lite-production-auth'|g"

# Update monitoring subdirectory imports (if any exist)
echo "🔍 Updating monitoring subdirectory imports..."
find /public/MasterV2/income-clarity/income-clarity-app -type f -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | \
  xargs sed -i "s|from '@/lib/monitoring/recovery/circuit-breaker'|from '@/lib/services/infrastructure/circuit-breaker'|g"

find /public/MasterV2/income-clarity/income-clarity-app -type f -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | \
  xargs sed -i "s|from '@/lib/monitoring/recovery/retry-strategy'|from '@/lib/services/infrastructure/retry-strategy'|g"

find /public/MasterV2/income-clarity/income-clarity-app -type f -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | \
  xargs sed -i "s|from '@/lib/monitoring/alerts/alert-manager'|from '@/lib/services/infrastructure/alert-manager'|g"

find /public/MasterV2/income-clarity/income-clarity-app -type f -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | \
  xargs sed -i "s|from '@/lib/monitoring/alerts/alert-rules'|from '@/lib/services/infrastructure/alert-rules'|g"

# Update documentation files
echo "📚 Updating documentation imports..."
find /public/MasterV2/income-clarity/income-clarity-app -type f -name "*.md" | \
  xargs sed -i "s|from '@/lib/logging/logger.service'|from '@/lib/services/infrastructure/logger.service'|g"

find /public/MasterV2/income-clarity/income-clarity-app -type f -name "*.md" | \
  xargs sed -i "s|from '@/lib/monitoring/|from '@/lib/services/infrastructure/|g"

find /public/MasterV2/income-clarity/income-clarity-app -type f -name "*.md" | \
  xargs sed -i "s|from '@/lib/auth/|from '@/lib/services/auth/|g"

echo "✅ Import statement updates completed!"
echo "🔍 Verifying no old imports remain..."

# Check for any remaining old imports
OLD_IMPORTS=$(grep -r "from '@/lib/\(logging\|monitoring\|jobs\|auth\)/" /public/MasterV2/income-clarity/income-clarity-app --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" | grep -v "/lib/services/" | wc -l)

if [ "$OLD_IMPORTS" -eq 0 ]; then
    echo "✅ All imports successfully updated!"
else
    echo "⚠️  Found $OLD_IMPORTS remaining old imports - manual review needed"
    grep -r "from '@/lib/\(logging\|monitoring\|jobs\|auth\)/" /public/MasterV2/income-clarity/income-clarity-app --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" | grep -v "/lib/services/"
fi

echo "🎯 Service organization import update complete!"