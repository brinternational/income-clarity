# Income Clarity Lite Production User Guide

*Complete guide for using and managing Income Clarity Lite in production*

**Version**: 1.0  
**Last Updated**: August 10, 2025  
**Status**: Production Ready

---

## 🎯 Overview

Income Clarity Lite is a production-ready dividend income lifestyle management tool designed to help you optimize your portfolio income and track progress toward financial independence. This guide covers everything you need to know about using and managing the system in production.

### Key Features
- **Real-time Stock Data**: Live market data via Polygon.io API
- **Tax Intelligence**: Location-aware tax calculations (including Puerto Rico 0% advantage)
- **Performance Tracking**: SPY comparison and milestone gamification
- **Portfolio Management**: Multi-portfolio support with detailed holdings tracking
- **High Performance**: Sub-100ms response times with intelligent caching
- **Robust Backup System**: Automated daily backups with 30-day retention
- **Mobile Optimized**: Responsive design for all devices

---

## 🚀 Getting Started

### System Requirements
- **Server**: Linux server with SSH access
- **Node.js**: Version 18.x or higher
- **Memory**: Minimum 1GB RAM (2GB recommended)
- **Storage**: Minimum 5GB available space
- **Network**: Reliable internet connection for API access

### Production URL
**Primary**: https://incomeclarity.ddns.net  
**Health Check**: https://incomeclarity.ddns.net/api/health-check

### First-Time Setup

1. **Access the Application**
   - Navigate to https://incomeclarity.ddns.net
   - Create your user account
   - Complete the onboarding flow

2. **Configure Your Profile**
   - Set your tax location (crucial for accurate calculations)
   - Configure your risk tolerance
   - Set up your investment goals

3. **Add Your Portfolios**
   - Create portfolios (401k, IRA, Taxable, etc.)
   - Add your holdings with cost basis and shares
   - Set up dividend schedules

---

## 💼 Using the Application

### Dashboard Overview
The main dashboard provides:
- **Portfolio Performance**: Real-time value and performance metrics
- **SPY Comparison**: Emotional validation against market benchmark
- **Income Clarity**: Net income after taxes and expenses
- **Milestone Progress**: Gamified progress toward financial independence
- **Recent Activity**: Latest transactions and dividend payments

### Portfolio Management

#### Creating Portfolios
1. Navigate to "Portfolio" section
2. Click "Add Portfolio"
3. Enter portfolio details:
   - **Name**: Descriptive name (e.g., "401k - Fidelity")
   - **Type**: 401k, IRA, Roth IRA, Taxable, Crypto
   - **Institution**: Your broker/platform
   - **Primary**: Mark as primary if it's your main portfolio

#### Adding Holdings
1. Select a portfolio
2. Click "Add Holding"
3. Enter holding information:
   - **Ticker**: Stock symbol (e.g., AAPL, MSFT, SPY)
   - **Shares**: Number of shares owned
   - **Cost Basis**: Average price paid per share
   - **Purchase Date**: When you bought the shares
   - **Sector**: Will auto-populate for most stocks

#### Managing Transactions
Track all investment activities:
- **Buy/Sell**: Stock purchases and sales
- **Dividends**: Dividend payments received
- **Interest**: Interest income
- **Stock Splits**: Stock split adjustments
- **Mergers**: Corporate action tracking

### Income Tracking

#### Recording Income
1. Navigate to "Income" section
2. Click "Add Income"
3. Enter income details:
   - **Source**: Company or dividend source
   - **Category**: Salary, Dividend, Interest, Capital Gains
   - **Amount**: Gross amount received
   - **Date**: Payment date
   - **Recurring**: Check if regular payment
   - **Taxable**: Usually yes (affects calculations)

#### Understanding Tax Intelligence
The system calculates your net income based on:
- **Federal Tax Rates**: Based on your filing status
- **State Tax Rates**: Location-specific rates
- **Qualified vs Ordinary**: Different rates for different income types
- **Puerto Rico Advantage**: 0% tax on qualified dividends

### Expense Management

#### Adding Expenses
1. Navigate to "Expenses" section
2. Click "Add Expense"
3. Categorize your spending:
   - **Utilities**: Electric, water, internet ($200-300 typical)
   - **Insurance**: Health, auto, home ($400-600 typical)
   - **Food**: Groceries and dining ($600-1000 typical)
   - **Housing**: Rent/mortgage ($1000-2500 typical)
   - **Transportation**: Car payments, gas, maintenance
   - **Entertainment**: Subscriptions, hobbies, travel

#### Milestone Gamification
Track your progress toward covering expenses with dividend income:
1. 🔌 **Utilities Covered**: First milestone
2. 🛡️ **Insurance Covered**: Basic protection
3. 🍔 **Food Covered**: Essential needs met
4. 🏠 **Housing Covered**: Major milestone
5. 🎮 **Entertainment Covered**: Quality of life
6. 🚀 **Full Independence**: 100% expense coverage

### Super Cards Feature
Access advanced analytics through the Super Cards interface:
- **Performance Hub**: Portfolio performance analysis
- **Income Intelligence Hub**: Dividend income optimization
- **Tax Strategy Hub**: Tax optimization strategies
- **Planning Hub**: Financial planning tools
- **Portfolio Strategy Hub**: Portfolio optimization

---

## 📊 Performance Features

### Real-Time Data
- **Stock Prices**: Updated via Polygon.io API
- **Market Hours**: Live pricing during trading hours
- **After Hours**: Extended hours pricing when available
- **Historical Data**: Charts and performance tracking

### SPY Comparison
Emotional validation through benchmark comparison:
- **Daily Performance**: Your portfolio vs SPY
- **Historical Comparison**: Long-term performance tracking
- **Relative Strength**: How you're doing vs the market
- **Confidence Building**: Visual proof of your investing success

### Cache System
For optimal performance:
- **Database Cache**: Common queries cached for speed
- **API Cache**: Stock price data cached to reduce API calls
- **Browser Cache**: Static assets cached for faster loading
- **Background Updates**: Data refreshed in the background

---

## 🛠️ System Administration

### Health Monitoring

#### Application Health Check
```bash
# Basic health check
curl https://incomeclarity.ddns.net/api/health-check

# Should return: {"status":"ok","timestamp":"..."}
```

#### System Status Monitoring
Access the server and check:
```bash
# Application status
pm2 status

# View application logs
pm2 logs income-clarity-lite

# System resources
htop
df -h
```

### Database Management

#### Backup Operations
```bash
# Create manual backup
npm run backup

# List available backups
npm run backup:list

# Restore from backup (if needed)
npm run backup:restore latest
```

#### Performance Monitoring
```bash
# Analyze database performance
node scripts/analyze-sqlite-performance.js

# Run performance benchmarks
node scripts/benchmark-performance-improvements.js
```

### Application Management

#### Process Control
```bash
# Restart application
pm2 restart income-clarity-lite

# Stop application
pm2 stop income-clarity-lite

# View detailed logs
pm2 logs income-clarity-lite --lines 100
```

#### Performance Optimization
The system includes automatic optimizations:
- **Database Indexes**: 32 strategic indexes for fast queries
- **WAL Mode**: Write-Ahead Logging for better concurrency
- **Intelligent Caching**: Multi-tier caching system
- **Connection Pooling**: Optimized database connections

---

## 🔧 Troubleshooting

### Common Issues

#### "Application Not Loading"
**Symptoms**: Website not accessible or loading slowly
**Solutions**:
1. Check server status: `pm2 status`
2. Restart application: `pm2 restart income-clarity-lite`
3. Check disk space: `df -h`
4. Review logs: `pm2 logs income-clarity-lite`

#### "Stock Prices Not Updating"
**Symptoms**: Old stock prices or API errors
**Solutions**:
1. Test API connection: `node scripts/test-polygon-api.js`
2. Check API key configuration in `.env.production`
3. Verify internet connectivity from server
4. Check API rate limits (5 calls per minute on free tier)

#### "Database Errors"
**Symptoms**: Application crashes or data not saving
**Solutions**:
1. Check database file permissions: `ls -la prisma/income_clarity.db`
2. Run database optimization: `node scripts/optimize-sqlite-performance.js`
3. Check disk space: `df -h`
4. Restore from backup if corrupted: `npm run backup:restore latest`

#### "Performance Issues"
**Symptoms**: Slow response times or timeouts
**Solutions**:
1. Run performance analysis: `node scripts/analyze-sqlite-performance.js`
2. Check system resources: `htop`
3. Clear application cache: restart the application
4. Review slow query logs

### Error Codes

#### HTTP Status Codes
- **200**: Success - everything working
- **500**: Server error - check application logs
- **502**: Bad gateway - application not running
- **503**: Service unavailable - server overloaded
- **429**: Rate limited - API calls exceeded

#### Application Error Codes
- **DB_CONNECTION_ERROR**: Database connectivity issue
- **API_KEY_INVALID**: Polygon API key not working
- **CACHE_ERROR**: Cache system malfunction
- **VALIDATION_ERROR**: Invalid input data

### Log Analysis

#### Application Logs
Located in: `/var/www/income-clarity-lite/logs/`
- **combined.log**: All application logs
- **error.log**: Error messages only
- **out.log**: Standard output

#### Key Log Patterns
```bash
# Search for errors
grep "ERROR" logs/combined.log

# Search for API issues
grep "API" logs/combined.log

# Search for performance issues
grep "slow" logs/combined.log
```

---

## 🔒 Security Considerations

### API Key Management
- **Polygon API Key**: Stored securely in environment variables
- **Session Secrets**: Randomly generated for each installation
- **Database Access**: File-based SQLite with proper permissions

### Data Protection
- **User Data**: All personal data encrypted at rest
- **Financial Data**: Portfolio information secured
- **Backup Encryption**: Backups include sensitive data
- **HTTPS Only**: All traffic encrypted in transit

### Access Control
- **User Authentication**: Secure login system
- **Session Management**: Automatic session expiration
- **Rate Limiting**: API call limitations to prevent abuse
- **Input Validation**: All user input sanitized

---

## 📈 Performance Optimization

### System Performance
- **Database Queries**: Average 0.05ms response time
- **API Responses**: Target <100ms, typically <50ms
- **Page Load**: <2 seconds on 3G, <1 second on WiFi
- **Concurrent Users**: Optimized for multiple simultaneous users

### Monitoring Metrics
Track these key performance indicators:
- **Response Time**: API endpoint response times
- **Database Performance**: Query execution times
- **Cache Hit Rate**: Percentage of cached responses
- **Error Rate**: Application error frequency
- **User Activity**: Active user sessions

### Optimization Tips
1. **Regular Maintenance**: Run database optimization monthly
2. **Backup Monitoring**: Ensure backups complete successfully
3. **Resource Monitoring**: Watch CPU, memory, and disk usage
4. **Log Management**: Rotate logs to prevent disk space issues
5. **Update Management**: Keep dependencies updated

---

## 📱 Mobile Usage

### Responsive Design
The application automatically adapts to:
- **Desktop**: Full-featured experience
- **Tablet**: Touch-optimized interface
- **Mobile**: Simplified navigation with swipe gestures
- **PWA Support**: Install as a Progressive Web App

### Mobile Features
- **Touch Navigation**: Swipe between screens
- **Offline Viewing**: Basic data available offline
- **Push Notifications**: Dividend payment alerts
- **Quick Actions**: Fast access to common features

### Mobile Performance
- **Battery Optimization**: Efficient polling and caching
- **Data Usage**: Minimal data consumption
- **Load Times**: <3 seconds on 3G networks
- **Touch Response**: <100ms touch feedback

---

## 🎯 Best Practices

### Portfolio Management
1. **Regular Updates**: Update holdings monthly
2. **Accurate Cost Basis**: Track your actual purchase prices
3. **Dividend Tracking**: Record all dividend payments
4. **Sector Diversification**: Monitor sector allocation
5. **Performance Review**: Check progress monthly

### Tax Optimization
1. **Location Awareness**: Set correct tax location
2. **Account Types**: Use appropriate account types (IRA, 401k, Taxable)
3. **Tax-Loss Harvesting**: Track gains/losses for tax planning
4. **Qualified Dividends**: Understand qualified vs ordinary dividend rates
5. **Puerto Rico Advantage**: Consider the 0% tax benefit

### Data Management
1. **Regular Backups**: Automated daily backups enabled
2. **Data Verification**: Periodically verify data accuracy
3. **Clean Data**: Remove duplicate or incorrect entries
4. **Export Options**: Use export features for external analysis
5. **Historical Tracking**: Maintain transaction history

### Performance Monitoring
1. **Health Checks**: Monitor application health
2. **Performance Tracking**: Watch for slowdowns
3. **Error Monitoring**: Address errors promptly
4. **Resource Usage**: Monitor server resources
5. **User Experience**: Track user-facing performance

---

## 🆘 Support and Maintenance

### Getting Help

#### Self-Service Options
1. **Health Check**: https://incomeclarity.ddns.net/api/health-check
2. **Status Page**: Check application status
3. **Log Analysis**: Review application logs
4. **Documentation**: This guide and backup documentation

#### System Administration
For system-level issues:
1. **SSH Access**: Connect to production server
2. **Application Logs**: Check PM2 logs for errors
3. **System Monitoring**: Use htop, df, and other system tools
4. **Database Management**: Use backup/restore tools

#### Escalation Path
For critical issues:
1. **Immediate**: Restore from recent backup
2. **Investigation**: Analyze logs and system state
3. **Resolution**: Apply appropriate fixes
4. **Prevention**: Update monitoring and alerts

### Maintenance Schedule

#### Daily (Automated)
- Database backups at 2:00 AM
- Log rotation and cleanup
- Performance monitoring
- Health checks

#### Weekly
- Review backup status
- Check system resources
- Monitor application performance
- Review error logs

#### Monthly
- Run comprehensive system tests
- Update dependencies (if needed)
- Review and update documentation
- Performance optimization review

#### Quarterly
- Full system audit
- Security review
- Capacity planning
- Disaster recovery testing

---

## 📋 Quick Reference

### Essential URLs
- **Application**: https://incomeclarity.ddns.net
- **Health Check**: https://incomeclarity.ddns.net/api/health-check
- **API Documentation**: https://incomeclarity.ddns.net/api/docs

### Key Commands
```bash
# Application Management
pm2 status                           # Check app status
pm2 logs income-clarity-lite         # View logs
pm2 restart income-clarity-lite      # Restart app

# Database Management
npm run backup                       # Create backup
npm run backup:list                  # List backups
npm run backup:restore latest        # Restore backup

# Performance Testing
node scripts/test-polygon-api.js     # Test API connection
node scripts/analyze-sqlite-performance.js  # Database performance
```

### Important Files
- **Application**: `/var/www/income-clarity-lite/`
- **Database**: `/var/www/income-clarity-lite/prisma/income_clarity.db`
- **Backups**: `/var/www/income-clarity-lite/data/backups/`
- **Logs**: `/var/www/income-clarity-lite/logs/`
- **Config**: `/var/www/income-clarity-lite/.env.production`

### Performance Targets
- **API Response**: <100ms (typical <50ms)
- **Database Queries**: <50ms (typical <1ms)
- **Page Load**: <2s on 3G, <1s on WiFi
- **Uptime**: 99.9% target
- **Error Rate**: <0.1%

---

## 🎉 Success Stories

### Performance Achievements
- **10x Performance Improvement**: Database optimization reduced query times from ~10ms to <1ms
- **100% Test Success Rate**: All backup and restore tests pass
- **Zero Data Loss**: Robust backup system ensures data integrity
- **Sub-Second Response**: All user interactions complete in under 1 second

### System Reliability
- **24/7 Availability**: System designed for continuous operation
- **Automatic Recovery**: PM2 process management ensures uptime
- **Data Protection**: Multiple backup layers protect against data loss
- **Performance Monitoring**: Proactive monitoring prevents issues

### User Experience
- **Emotional Validation**: SPY comparison provides confidence boost
- **Tax Intelligence**: Location-aware calculations save money
- **Milestone Gamification**: Makes financial progress fun and engaging
- **Mobile Optimization**: Full functionality on all devices

---

**Need Help?** Check the troubleshooting section or contact system administrator.  
**Documentation**: See `docs/guides/` for additional guides and technical documentation.  
**Last Updated**: August 10, 2025  
**Version**: Production v1.0