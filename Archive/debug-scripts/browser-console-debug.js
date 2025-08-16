// Income Clarity Demo Login Debug Script
// Run this directly in the browser console while on the login page

console.log('🚀 Income Clarity Demo Login Debug Script Starting...');
console.log('===============================================');

// Debug utilities
const debug = {
    log: (message, type = 'info') => {
        const timestamp = new Date().toLocaleTimeString();
        const prefix = {
            info: '📋',
            success: '✅',
            warning: '⚠️',
            error: '❌'
        }[type];
        console.log(`${prefix} [${timestamp}] ${message}`);
    },
    
    // Check if we're on the login page
    checkLocation: () => {
        const isLoginPage = window.location.href.includes('/auth/login');
        debug.log(`Current URL: ${window.location.href}`, 'info');
        debug.log(`On login page: ${isLoginPage}`, isLoginPage ? 'success' : 'warning');
        return isLoginPage;
    },
    
    // Find the demo login button
    findDemoButton: () => {
        const demoButton = Array.from(document.querySelectorAll('button')).find(btn => 
            btn.textContent.includes('Try Demo Account')
        );
        
        if (demoButton) {
            debug.log('Demo button found!', 'success');
            debug.log(`Button text: "${demoButton.textContent.trim()}"`, 'info');
            debug.log(`Button enabled: ${!demoButton.disabled}`, demoButton.disabled ? 'warning' : 'success');
            debug.log(`Button classes: ${demoButton.className}`, 'info');
            
            // Make button globally accessible for testing
            window.demoButton = demoButton;
            debug.log('Demo button saved to window.demoButton', 'info');
        } else {
            debug.log('Demo button NOT found!', 'error');
            debug.log('Available buttons:', 'info');
            document.querySelectorAll('button').forEach((btn, i) => {
                debug.log(`  Button ${i + 1}: "${btn.textContent.trim()}"`, 'info');
            });
        }
        
        return demoButton;
    },
    
    // Check localStorage state
    checkLocalStorage: () => {
        debug.log('localStorage inspection:', 'info');
        const demoMode = localStorage.getItem('demo-mode');
        const demoUser = localStorage.getItem('demo-user');
        const demoProfile = localStorage.getItem('demo-profile');
        const demoSession = localStorage.getItem('demo-session');
        
        debug.log(`  demo-mode: ${demoMode || 'NOT SET'}`, demoMode ? 'success' : 'info');
        debug.log(`  demo-user: ${demoUser ? 'PRESENT' : 'NOT SET'}`, demoUser ? 'success' : 'info');
        debug.log(`  demo-profile: ${demoProfile ? 'PRESENT' : 'NOT SET'}`, demoProfile ? 'success' : 'info');
        debug.log(`  demo-session: ${demoSession ? 'PRESENT' : 'NOT SET'}`, demoSession ? 'success' : 'info');
        
        return { demoMode, demoUser, demoProfile, demoSession };
    },
    
    // Monitor network requests
    setupNetworkMonitoring: () => {
        const originalFetch = window.fetch;
        const requests = [];
        
        window.fetch = function(...args) {
            const url = args[0];
            debug.log(`🌐 Network request: ${url}`, 'info');
            requests.push({ url, timestamp: new Date() });
            
            return originalFetch.apply(this, args)
                .then(response => {
                    debug.log(`🌐 Response: ${response.status} ${url}`, response.ok ? 'success' : 'error');
                    return response;
                })
                .catch(error => {
                    debug.log(`🌐 Request failed: ${url} - ${error.message}`, 'error');
                    throw error;
                });
        };
        
        window.debugRequests = requests;
        debug.log('Network monitoring enabled (window.debugRequests)', 'success');
    },
    
    // Monitor console errors
    setupErrorMonitoring: () => {
        const errors = [];
        const originalError = console.error;
        
        console.error = function(...args) {
            errors.push({ args, timestamp: new Date() });
            debug.log(`JS Error captured: ${args.join(' ')}`, 'error');
            return originalError.apply(console, args);
        };
        
        window.addEventListener('error', (event) => {
            errors.push({ 
                message: event.message, 
                filename: event.filename, 
                lineno: event.lineno,
                timestamp: new Date() 
            });
            debug.log(`Global error: ${event.message}`, 'error');
        });
        
        window.debugErrors = errors;
        debug.log('Error monitoring enabled (window.debugErrors)', 'success');
    },
    
    // Test demo login
    testDemoLogin: async () => {
        debug.log('🧪 Starting demo login test...', 'info');
        
        // Clear localStorage first
        debug.log('Clearing localStorage...', 'info');
        localStorage.clear();
        
        const button = debug.findDemoButton();
        if (!button) {
            debug.log('Cannot test - demo button not found!', 'error');
            return false;
        }
        
        // Check initial state
        debug.log('Initial state:', 'info');
        debug.checkLocalStorage();
        
        // Monitor button state changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.target === button) {
                    debug.log(`Button state changed: ${button.textContent.trim()}`, 'info');
                }
            });
        });
        observer.observe(button, { 
            childList: true, 
            subtree: true, 
            attributes: true 
        });
        
        // Click the button
        debug.log('🖱️ Clicking demo button...', 'info');
        button.click();
        
        // Wait and check results
        setTimeout(() => {
            debug.log('⏱️ Checking results after 3 seconds...', 'info');
            debug.checkLocalStorage();
            debug.log(`Current URL: ${window.location.href}`, 'info');
            
            if (window.location.href.includes('/dashboard')) {
                debug.log('🎉 Successfully redirected to dashboard!', 'success');
            } else if (window.location.href.includes('/auth/login')) {
                debug.log('Still on login page - checking for issues...', 'warning');
                
                // Check for error messages
                const errorElements = document.querySelectorAll('[class*="red"], [class*="error"], .text-red-600');
                if (errorElements.length > 0) {
                    debug.log('Error messages found:', 'error');
                    errorElements.forEach((el, i) => {
                        if (el.textContent.trim()) {
                            debug.log(`  Error ${i + 1}: ${el.textContent.trim()}`, 'error');
                        }
                    });
                } else {
                    debug.log('No visible error messages', 'info');
                }
                
                // Check if button is still loading
                if (button.textContent.includes('Setting up demo')) {
                    debug.log('Button appears stuck in loading state', 'warning');
                }
            }
            
            observer.disconnect();
        }, 3000);
        
        // Extended check
        setTimeout(() => {
            debug.log('⏱️ Extended check after 8 seconds...', 'info');
            debug.checkLocalStorage();
            debug.log(`Final URL: ${window.location.href}`, 'info');
            
            if (window.debugErrors && window.debugErrors.length > 0) {
                debug.log('JavaScript errors detected:', 'error');
                window.debugErrors.forEach((error, i) => {
                    debug.log(`  Error ${i + 1}: ${error.message || error.args.join(' ')}`, 'error');
                });
            }
            
            debug.log('🏁 Demo login test completed!', 'success');
        }, 8000);
        
        return true;
    },
    
    // Full diagnostic
    runFullDiagnostic: () => {
        debug.log('🔍 Running full diagnostic...', 'info');
        debug.checkLocation();
        debug.setupNetworkMonitoring();
        debug.setupErrorMonitoring();
        debug.findDemoButton();
        debug.checkLocalStorage();
        debug.log('📋 Diagnostic complete. Use debug.testDemoLogin() to test the button', 'success');
    }
};

// Auto-run diagnostic
debug.runFullDiagnostic();

// Make debug utilities globally available
window.incomeDebug = debug;

console.log('🎯 Debug utilities available at window.incomeDebug');
console.log('🧪 Run incomeDebug.testDemoLogin() to test the demo login');
console.log('📋 Other available functions:');
console.log('  - incomeDebug.findDemoButton()');
console.log('  - incomeDebug.checkLocalStorage()');
console.log('  - incomeDebug.runFullDiagnostic()');
console.log('===============================================');