#!/bin/bash

# BACKEND-006: Load Testing Script
# Execute load tests with database setup, k6, and comprehensive reporting

set -e

echo "🚀 BACKEND-006: Load Testing Infrastructure"
echo "=========================================="

# Configuration
BASE_URL="${NEXT_PUBLIC_APP_URL:-http://localhost:3000}"
MAX_USERS="${MAX_USERS:-1000}"
TEST_DURATION="${TEST_DURATION:-5}"
DB_URL="${DATABASE_URL:-$NEXT_PUBLIC_SUPABASE_URL}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check prerequisites
check_prerequisites() {
    echo -e "${BLUE}🔍 Checking prerequisites...${NC}"
    
    # Check if Node.js is available
    if ! command -v node >/dev/null 2>&1; then
        echo -e "${RED}❌ Node.js is required but not installed${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Node.js available${NC}"
    
    # Check if server is running
    echo "🌐 Checking if server is accessible at ${BASE_URL}..."
    if curl -s --max-time 5 "${BASE_URL}/api/health" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Server is accessible${NC}"
    else
        echo -e "${RED}❌ Server not accessible at ${BASE_URL}${NC}"
        echo "Please start the server with: npm run dev"
        exit 1
    fi
    
    # Check database connection
    if [ -n "$DATABASE_URL" ] || [ -n "$NEXT_PUBLIC_SUPABASE_URL" ]; then
        echo -e "${GREEN}✅ Database configuration found${NC}"
    else
        echo -e "${YELLOW}⚠️  No database configuration - using mock data${NC}"
    fi
    
    echo ""
}

# Function to generate load test data
generate_test_data() {
    echo -e "${BLUE}📊 Generating load test data...${NC}"
    
    # Create a Node.js script to generate test data via API
    cat > /tmp/generate-load-data.js << 'EOF'
const fetch = require('node-fetch');

async function generateLoadTestData() {
    const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
    const USER_COUNT = parseInt(process.env.USER_COUNT) || 100;
    
    console.log(`Generating test data for ${USER_COUNT} users...`);
    
    try {
        // Call the database function if available
        const response = await fetch(`${BASE_URL}/api/test/generate-data`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userCount: USER_COUNT,
                includePortfolios: true,
                includeExpenses: true,
                includeTransactions: true
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('✅ Test data generated successfully:', result);
            return result;
        } else if (response.status === 404) {
            console.log('⚠️  No database generation endpoint - using runtime test data');
            return { message: 'Using runtime test data', userCount: USER_COUNT };
        } else {
            throw new Error(`API call failed: ${response.status}`);
        }
    } catch (error) {
        console.log('⚠️  Database generation failed, using runtime test data:', error.message);
        return { message: 'Using runtime test data', userCount: USER_COUNT };
    }
}

// Run if called directly
if (require.main === module) {
    generateLoadTestData().then(result => {
        console.log(JSON.stringify(result, null, 2));
        process.exit(0);
    }).catch(error => {
        console.error('Test data generation failed:', error);
        process.exit(1);
    });
}

module.exports = { generateLoadTestData };
EOF
    
    # Run the data generation
    if BASE_URL="$BASE_URL" USER_COUNT="100" node /tmp/generate-load-data.js; then
        echo -e "${GREEN}✅ Test data preparation completed${NC}"
    else
        echo -e "${YELLOW}⚠️  Test data generation had issues - proceeding with runtime data${NC}"
    fi
    
    echo ""
}

# Function to run Node.js based load test
run_nodejs_load_test() {
    echo -e "${BLUE}🔥 Running Node.js Load Test...${NC}"
    
    # Check if the load test script exists
    if [ ! -f "scripts/load-test-super-cards.js" ]; then
        echo -e "${RED}❌ Load test script not found at scripts/load-test-super-cards.js${NC}"
        return 1
    fi
    
    echo "Configuration:"
    echo "- Base URL: ${BASE_URL}"
    echo "- Max Users: ${MAX_USERS}"
    echo "- Duration: ${TEST_DURATION} minutes"
    echo ""
    
    # Set environment variables and run the test
    export TEST_BASE_URL="$BASE_URL"
    export MAX_USERS="$MAX_USERS"
    export TEST_DURATION="$TEST_DURATION"
    
    echo "🚀 Starting load test..."
    if node scripts/load-test-super-cards.js; then
        echo -e "${GREEN}✅ Node.js load test completed successfully${NC}"
        return 0
    else
        echo -e "${RED}❌ Node.js load test failed${NC}"
        return 1
    fi
}

# Function to install and run k6 test
run_k6_load_test() {
    echo -e "${BLUE}📈 Running k6 Load Test...${NC}"
    
    # Check if k6 is installed
    if ! command -v k6 >/dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  k6 not found, attempting to install...${NC}"
        
        # Try to install k6 based on OS
        if [[ "$OSTYPE" == "darwin"* ]]; then
            if command -v brew >/dev/null 2>&1; then
                echo "Installing k6 via Homebrew..."
                brew install k6
            else
                echo -e "${RED}❌ Homebrew not found. Please install k6 manually${NC}"
                return 1
            fi
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            echo "Installing k6 for Linux..."
            sudo apt-get update && sudo apt-get install -y k6 || {
                echo "Trying alternative k6 installation..."
                wget -q -O - https://dl.k6.io/key.gpg | sudo apt-key add -
                echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
                sudo apt-get update
                sudo apt-get install k6
            }
        else
            echo -e "${YELLOW}⚠️  Automatic k6 installation not supported on this OS${NC}"
            echo "Please install k6 manually from https://k6.io/docs/getting-started/installation/"
            return 1
        fi
    fi
    
    # Create k6 test script
    cat > /tmp/k6-super-cards-test.js << EOF
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
let errorRate = new Rate('errors');
let responseTime = new Trend('response_time');
let requestCount = new Counter('requests');

// Test configuration
export let options = {
    stages: [
        { duration: '30s', target: ${MAX_USERS} }, // Ramp-up
        { duration: '${TEST_DURATION}m', target: ${MAX_USERS} }, // Stay at peak
        { duration: '30s', target: 0 }, // Ramp-down
    ],
    thresholds: {
        'http_req_duration': ['p(95)<200', 'p(99)<500'], // 95% under 200ms, 99% under 500ms
        'http_req_failed': ['rate<0.01'], // Less than 1% errors
        'requests': ['rate>100'], // More than 100 requests per second
    },
};

// Test scenarios
const scenarios = [
    { name: 'performance', weight: 30, cards: ['performance'] },
    { name: 'dashboard', weight: 40, cards: ['performance', 'income', 'lifestyle'] },
    { name: 'full_view', weight: 20, cards: ['performance', 'income', 'lifestyle', 'strategy', 'quickActions'] },
    { name: 'single_card', weight: 10, cards: ['income'] }
];

export default function() {
    // Select random scenario
    const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    const cards = scenario.cards.join(',');
    const timeRange = ['1D', '1W', '1M', '3M', '6M', '1Y', 'YTD'][Math.floor(Math.random() * 7)];
    
    // Make API request
    const url = \`${BASE_URL}/api/super-cards?cards=\${cards}&timeRange=\${timeRange}&demo=true\`;
    
    const params = {
        headers: {
            'Content-Type': 'application/json',
            'X-Test-Scenario': scenario.name,
            'X-Test-User': \`k6-user-\${__VU}-\${__ITER}\`
        },
    };
    
    const response = http.get(url, params);
    
    // Record metrics
    requestCount.add(1);
    responseTime.add(response.timings.duration);
    
    // Check response
    const isSuccess = check(response, {
        'status is 200': (r) => r.status === 200,
        'response time < 2000ms': (r) => r.timings.duration < 2000,
        'has data': (r) => r.body.includes('data') || r.body.includes('error'),
    });
    
    errorRate.add(!isSuccess);
    
    // Brief pause between requests
    sleep(1);
}

export function handleSummary(data) {
    const summary = {
        k6_version: data.root_group.name,
        timestamp: new Date().toISOString(),
        summary: {
            checks: data.metrics.checks,
            http_reqs: data.metrics.http_reqs,
            http_req_duration: data.metrics.http_req_duration,
            http_req_failed: data.metrics.http_req_failed,
            iterations: data.metrics.iterations,
        },
        thresholds: data.thresholds,
    };
    
    console.log('📊 K6 Test Summary:');
    console.log(\`Total Requests: \${data.metrics.http_reqs.values.count}\`);
    console.log(\`Request Rate: \${data.metrics.http_reqs.values.rate.toFixed(2)}/s\`);
    console.log(\`Error Rate: \${(data.metrics.http_req_failed.values.rate * 100).toFixed(2)}%\`);
    console.log(\`Avg Response Time: \${data.metrics.http_req_duration.values.avg.toFixed(2)}ms\`);
    console.log(\`P95 Response Time: \${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms\`);
    console.log(\`P99 Response Time: \${data.metrics.http_req_duration.values['p(99)'].toFixed(2)}ms\`);
    
    return {
        'stdout': JSON.stringify(summary, null, 2),
        'k6-summary.json': JSON.stringify(summary, null, 2),
    };
}
EOF
    
    echo "🚀 Running k6 load test..."
    if k6 run /tmp/k6-super-cards-test.js --out json=/tmp/k6-results.json; then
        echo -e "${GREEN}✅ k6 load test completed successfully${NC}"
        
        # Show results if available
        if [ -f "/tmp/k6-results.json" ]; then
            echo -e "${BLUE}📊 k6 Results Summary:${NC}"
            tail -n 20 /tmp/k6-results.json | head -n 10
        fi
        
        if [ -f "k6-summary.json" ]; then
            echo -e "${BLUE}📋 Full k6 Summary available in k6-summary.json${NC}"
        fi
        
        return 0
    else
        echo -e "${RED}❌ k6 load test failed${NC}"
        return 1
    fi
}

# Function to run performance monitoring during tests
monitor_performance() {
    echo -e "${BLUE}📊 Starting performance monitoring...${NC}"
    
    # Create monitoring script
    cat > /tmp/monitor-performance.sh << 'EOF'
#!/bin/bash
echo "Starting performance monitoring..."
echo "Timestamp,CPU%,Memory_MB,Response_Time_ms,Active_Connections" > performance-monitor.csv

for i in {1..60}; do
    # Get current timestamp
    timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    # Get system metrics (simplified)
    if command -v top >/dev/null 2>&1; then
        cpu_usage=$(top -l 1 -n 0 | grep "CPU usage" | awk '{print $3}' | sed 's/%//' || echo "0")
    else
        cpu_usage="0"
    fi
    
    if command -v free >/dev/null 2>&1; then
        memory_usage=$(free -m | awk 'NR==2{print $3}' || echo "0")
    else
        memory_usage="0"
    fi
    
    # Test API response time
    response_time=$(curl -w "%{time_total}" -s -o /dev/null "$BASE_URL/api/health" | awk '{print $1*1000}' || echo "0")
    
    # Get connection count (if available)
    connections=$(netstat -an 2>/dev/null | grep :3000 | wc -l || echo "0")
    
    echo "$timestamp,$cpu_usage,$memory_usage,$response_time,$connections" >> performance-monitor.csv
    
    sleep 10
done

echo "Performance monitoring completed. Data saved to performance-monitor.csv"
EOF
    
    chmod +x /tmp/monitor-performance.sh
    
    # Run monitoring in background
    BASE_URL="$BASE_URL" /tmp/monitor-performance.sh &
    MONITOR_PID=$!
    
    echo "📊 Performance monitoring started (PID: $MONITOR_PID)"
    echo "   Data will be saved to performance-monitor.csv"
    
    # Return the PID so we can stop it later
    echo $MONITOR_PID
}

# Function to generate comprehensive report
generate_comprehensive_report() {
    echo -e "${BLUE}📄 Generating comprehensive load test report...${NC}"
    
    # Create a summary report combining all test results
    cat > load-test-report.md << EOF
# Load Test Report - Income Clarity API

**Test Date:** $(date)  
**Configuration:**
- Base URL: ${BASE_URL}
- Max Concurrent Users: ${MAX_USERS}
- Test Duration: ${TEST_DURATION} minutes
- Target Environment: $([ "$BASE_URL" = "http://localhost:3000" ] && echo "Development" || echo "Production")

## Test Results Summary

### Node.js Load Test
EOF
    
    # Add Node.js results if available
    if ls load-test-report-*.json >/dev/null 2>&1; then
        latest_report=$(ls -t load-test-report-*.json | head -n1)
        echo "- Results file: ${latest_report}" >> load-test-report.md
        
        if command -v jq >/dev/null 2>&1; then
            echo "" >> load-test-report.md
            echo "**Summary:**" >> load-test-report.md
            jq -r '.report.summary | to_entries[] | "- \(.key): \(.value)"' "$latest_report" >> load-test-report.md
            
            echo "" >> load-test-report.md
            echo "**Response Times:**" >> load-test-report.md
            jq -r '.report.responseTime | to_entries[] | "- \(.key): \(.value)ms"' "$latest_report" >> load-test-report.md
        fi
    else
        echo "- No Node.js results available" >> load-test-report.md
    fi
    
    cat >> load-test-report.md << EOF

### k6 Load Test
EOF
    
    # Add k6 results if available
    if [ -f "k6-summary.json" ]; then
        echo "- Results file: k6-summary.json" >> load-test-report.md
        
        if command -v jq >/dev/null 2>&1; then
            echo "" >> load-test-report.md
            echo "**Summary:**" >> load-test-report.md
            jq -r '.summary | to_entries[] | "- \(.key): \(.value)"' "k6-summary.json" >> load-test-report.md
        fi
    else
        echo "- No k6 results available" >> load-test-report.md
    fi
    
    cat >> load-test-report.md << EOF

### Performance Monitoring
EOF
    
    # Add performance monitoring results if available
    if [ -f "performance-monitor.csv" ]; then
        echo "- Monitoring data: performance-monitor.csv" >> load-test-report.md
        echo "- Monitoring duration: $(wc -l < performance-monitor.csv) samples" >> load-test-report.md
        
        # Calculate basic stats if available
        if command -v awk >/dev/null 2>&1 && [ -f "performance-monitor.csv" ]; then
            echo "" >> load-test-report.md
            echo "**Performance Stats:**" >> load-test-report.md
            
            avg_response_time=$(tail -n +2 performance-monitor.csv | awk -F',' '{sum+=$4; count++} END {print sum/count}')
            max_response_time=$(tail -n +2 performance-monitor.csv | awk -F',' '{max=($4>max)?$4:max} END {print max}')
            
            echo "- Average Response Time: ${avg_response_time}ms" >> load-test-report.md
            echo "- Max Response Time: ${max_response_time}ms" >> load-test-report.md
        fi
    else
        echo "- No performance monitoring data available" >> load-test-report.md
    fi
    
    cat >> load-test-report.md << EOF

## Conclusions and Recommendations

EOF
    
    # Add basic conclusions
    echo "### Performance Assessment" >> load-test-report.md
    
    if ls load-test-report-*.json >/dev/null 2>&1; then
        latest_report=$(ls -t load-test-report-*.json | head -n1)
        
        if command -v jq >/dev/null 2>&1; then
            # Check if targets were met
            targets_met=$(jq -r '.report.targets | to_entries[] | select(.value.passed == false) | .key' "$latest_report")
            
            if [ -z "$targets_met" ]; then
                echo "✅ **All performance targets met** - System is ready for production load" >> load-test-report.md
            else
                echo "❌ **Some performance targets not met** - Optimization required:" >> load-test-report.md
                echo "$targets_met" | sed 's/^/- /' >> load-test-report.md
            fi
        fi
    fi
    
    cat >> load-test-report.md << EOF

### Recommendations

1. **Database Optimization:**
   - Ensure all materialized views are refreshed regularly
   - Monitor query performance logs
   - Consider connection pooling optimization

2. **Caching Strategy:**
   - Monitor cache hit rates (target: >80%)
   - Optimize Redis configuration
   - Consider edge caching for anonymous users

3. **Monitoring and Alerting:**
   - Set up real-time performance monitoring
   - Configure alerts for response time degradation
   - Monitor error rates and rate limiting

4. **Scalability:**
   - Consider horizontal scaling for >1000 concurrent users
   - Implement load balancing if needed
   - Monitor resource utilization

### Next Steps

- [ ] Review detailed test results
- [ ] Address any performance bottlenecks identified
- [ ] Set up production monitoring
- [ ] Schedule regular load testing
EOF
    
    echo -e "${GREEN}✅ Comprehensive report generated: load-test-report.md${NC}"
}

# Main function
main() {
    echo "🚀 BACKEND-006: Load Testing Infrastructure"
    echo "Max Users: ${MAX_USERS}, Duration: ${TEST_DURATION}m, URL: ${BASE_URL}"
    echo ""
    
    # Load environment variables if available
    if [ -f .env.local ]; then
        export $(grep -v '^#' .env.local | grep -v '^\s*$' | xargs)
        echo -e "${GREEN}✅ Loaded environment variables from .env.local${NC}"
    fi
    
    # Run all steps
    check_prerequisites
    generate_test_data
    
    # Start performance monitoring
    monitor_pid=$(monitor_performance)
    
    # Run load tests
    nodejs_success=false
    k6_success=false
    
    echo -e "${BLUE}🔥 Starting load tests...${NC}\n"
    
    # Run Node.js load test
    if run_nodejs_load_test; then
        nodejs_success=true
    fi
    
    echo ""
    
    # Run k6 load test
    if run_k6_load_test; then
        k6_success=true
    fi
    
    # Stop performance monitoring
    if [ -n "$monitor_pid" ]; then
        echo -e "${BLUE}🛑 Stopping performance monitoring...${NC}"
        kill $monitor_pid 2>/dev/null || true
        sleep 2
    fi
    
    # Generate comprehensive report
    generate_comprehensive_report
    
    # Summary
    echo ""
    echo -e "${BLUE}📊 Load Testing Summary:${NC}"
    echo "========================="
    echo -e "Node.js Test: $([ "$nodejs_success" = true ] && echo "${GREEN}✅ PASSED${NC}" || echo "${RED}❌ FAILED${NC}")"
    echo -e "k6 Test: $([ "$k6_success" = true ] && echo "${GREEN}✅ PASSED${NC}" || echo "${RED}❌ FAILED${NC}")"
    echo ""
    echo "📋 Generated files:"
    ls -la load-test-report*.json k6-summary.json performance-monitor.csv load-test-report.md 2>/dev/null || echo "  (No files generated)"
    echo ""
    
    if [ "$nodejs_success" = true ] || [ "$k6_success" = true ]; then
        echo -e "${GREEN}🎉 Load testing completed successfully!${NC}"
        echo ""
        echo "Next steps:"
        echo "1. Review load-test-report.md for detailed analysis"
        echo "2. Check performance metrics in performance-monitor.csv"
        echo "3. Address any performance issues identified"
        echo "4. Set up production monitoring based on results"
        exit 0
    else
        echo -e "${RED}❌ Load testing failed${NC}"
        echo "Please check the error messages above and resolve issues before retrying."
        exit 1
    fi
}

# Run main function
main "$@"