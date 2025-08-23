# Puppeteer MCP Service - Installation & Usage Guide

## 🚀 Installation Complete - Status Report

### ✅ Installation Successful
- **Package**: `puppeteer-mcp-claude@0.1.7` - Latest version specifically designed for Claude Code
- **Installation Method**: Global npm installation + automatic Claude Code CLI integration
- **Configuration Location**: `/home/devuser/.claude.json` (project-specific configuration)
- **Binary Location**: `/usr/local/bin/puppeteer-mcp-claude`
- **Server Binary**: `/usr/local/lib/node_modules/puppeteer-mcp-claude/dist/index.js`

### 🔧 Configuration Details
The service is now configured in Claude Code CLI with the following setup:
```json
{
  "mcpServers": {
    "puppeteer-mcp-claude": {
      "type": "stdio",
      "command": "node /usr/local/lib/node_modules/puppeteer-mcp-claude/dist/index.js",
      "args": [],
      "env": {}
    }
  }
}
```

## 🛠️ Available Browser Automation Tools

When the MCP service is active, agents will have access to these 15 powerful browser automation tools:

### Core Browser Management
- **`puppeteer_launch`** - Launch browser instance with configuration options
- **`puppeteer_new_page`** - Create new browser tab/page
- **`puppeteer_close_page`** - Close specific browser tab
- **`puppeteer_close_browser`** - Close entire browser instance

### Navigation & Interaction
- **`puppeteer_navigate`** - Navigate to specific URL
- **`puppeteer_click`** - Click on page elements (buttons, links, etc.)
- **`puppeteer_type`** - Type text into input fields and forms
- **`puppeteer_wait_for_selector`** - Wait for elements to appear on page

### Data Extraction & Analysis
- **`puppeteer_get_text`** - Extract text content from page elements
- **`puppeteer_screenshot`** - Capture screenshots for testing/documentation
- **`puppeteer_evaluate`** - Execute custom JavaScript in browser context

### Cookie & Session Management
- **`puppeteer_set_cookies`** - Set browser cookies for authentication
- **`puppeteer_get_cookies`** - Retrieve current browser cookies
- **`puppeteer_delete_cookies`** - Clear specific or all cookies

### Advanced Features
- **`puppeteer_set_request_interception`** - Intercept/modify network requests (block ads, modify responses)

## 📋 Common Use Cases & Examples

### 1. E2E Testing & Screenshot Generation
```bash
# Perfect for Production E2E Testing
puppeteer_launch -> puppeteer_navigate -> puppeteer_screenshot
```
**Use Case**: Validate production deployment with visual proof

### 2. Form Automation & User Workflows
```bash
# Complete user registration/login flows
puppeteer_navigate -> puppeteer_type -> puppeteer_click -> puppeteer_screenshot
```
**Use Case**: Automate complex form submissions and user journeys

### 3. Performance Monitoring
```bash
# Capture page load times and performance metrics
puppeteer_launch -> puppeteer_navigate -> puppeteer_evaluate -> puppeteer_screenshot
```
**Use Case**: Automated performance testing and monitoring

### 4. Content Validation & Data Extraction
```bash
# Validate page content and extract data
puppeteer_navigate -> puppeteer_wait_for_selector -> puppeteer_get_text
```
**Use Case**: Verify content deployment and extract dynamic data

### 5. Authentication Testing
```bash
# Test login flows with cookie management
puppeteer_set_cookies -> puppeteer_navigate -> puppeteer_screenshot
```
**Use Case**: Test authenticated user experiences

## 🎯 Integration for Income Clarity Project

### Production E2E Testing Enhancement
- **Production URL Testing**: https://incomeclarity.ddns.net
- **Screenshot Evidence**: Automated visual validation for all features
- **User Journey Testing**: Complete login → dashboard → super-cards workflows
- **Performance Monitoring**: Page load times and JavaScript error detection

### Specific Use Cases for Our Project
1. **Super Cards Validation**: Automated testing of all 5 super card views
2. **Progressive Disclosure Testing**: Validate momentum/hero-view/detailed levels
3. **Authentication Flow Testing**: Demo user login/logout workflows
4. **Performance Baseline Creation**: Automated Lighthouse-style performance testing
5. **Mobile/Desktop Responsive Testing**: Cross-device validation

## 🔧 Management Commands

### Status & Control
```bash
# Check installation status
puppeteer-mcp-claude status

# Reinstall if needed
puppeteer-mcp-claude install

# Remove from Claude Code
puppeteer-mcp-claude uninstall

# Get help and available commands
puppeteer-mcp-claude --help
```

### Chrome Remote Debugging (Advanced)
```bash
# Start Chrome with remote debugging (useful for complex scenarios)
puppeteer-mcp-claude chrome 9222

# Then connect with: browserWSEndpoint: "ws://localhost:9222"
```

## 📖 Agent Usage Instructions

### For All Agents: Accessing Puppeteer Tools
When you need browser automation, check if `puppeteer_*` functions are available in your function list. If they appear, you can use them directly.

### Best Practices for Agents
1. **Always take screenshots** for E2E testing evidence
2. **Use wait_for_selector** before interacting with dynamic content
3. **Handle errors gracefully** - browser automation can be unreliable
4. **Clean up resources** - always close pages/browsers when done
5. **Test on production** - use https://incomeclarity.ddns.net for real validation

### Typical Workflow for E2E Testing
```javascript
// 1. Launch browser
await puppeteer_launch({headless: true})

// 2. Create new page
await puppeteer_new_page()

// 3. Navigate to target
await puppeteer_navigate("https://incomeclarity.ddns.net")

// 4. Wait for content
await puppeteer_wait_for_selector("selector")

// 5. Interact with page
await puppeteer_click("button")
await puppeteer_type("input", "test data")

// 6. Capture evidence
await puppeteer_screenshot({path: "evidence.png"})

// 7. Clean up
await puppeteer_close_browser()
```

## ⚠️ Troubleshooting

### If MCP Tools Don't Appear
1. **Restart Claude Code CLI** - MCP services require restart to load
2. **Check configuration** - Verify entry exists in `.claude.json`
3. **Test binary** - Ensure `/usr/local/lib/node_modules/puppeteer-mcp-claude/dist/index.js` exists
4. **Reinstall** - Run `puppeteer-mcp-claude install` again

### Common Issues
- **Timeout errors**: Increase wait times for slow-loading content
- **Element not found**: Use `puppeteer_wait_for_selector` before interaction
- **Permission errors**: Ensure headless mode for server environments
- **Memory issues**: Always close browsers/pages when finished

## 🎉 Success Metrics

### Installation Verification Checklist
- ✅ Global npm package installed (`puppeteer-mcp-claude@0.1.7`)
- ✅ Binary available at `/usr/local/bin/puppeteer-mcp-claude`
- ✅ Configuration added to Claude Code CLI (`.claude.json`)
- ✅ 15 browser automation tools available to agents
- ✅ Documentation created for agent reference

### Next Steps for Agents
1. **Test basic functionality** - Try `puppeteer_launch` and `puppeteer_screenshot`
2. **Validate production access** - Test with https://incomeclarity.ddns.net
3. **Create test automation** - Build E2E tests for key user workflows
4. **Generate screenshot evidence** - Document all testing with visual proof

## 📚 Resources

- **Package Repository**: https://github.com/jaenster/puppeteer-mcp-claude
- **NPM Package**: https://www.npmjs.com/package/puppeteer-mcp-claude
- **Puppeteer Documentation**: https://pptr.dev/
- **MCP Protocol**: https://modelcontextprotocol.io/

---

**STATUS**: ✅ **PUPPETEER MCP SERVICE INSTALLATION COMPLETE**
**CAPABILITY**: Enhanced browser automation for all Claude Code CLI agents
**IMPACT**: Enables comprehensive E2E testing, screenshot generation, and production validation