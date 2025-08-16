// Simple test without playwright dependency
const { exec } = require('child_process');

// Use PowerShell to run Microsoft Edge in headless mode and capture console
const command = `
  powershell -Command "
    Start-Process msedge -ArgumentList '--headless --dump-dom --virtual-time-budget=5000 http://localhost:3003/auth/login' -Wait -NoNewWindow -RedirectStandardOutput temp_page.html;
    Get-Content temp_page.html;
    Remove-Item temp_page.html
  "
`;

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error('Test failed:', error.message);
    return;
  }
  
  const pageContent = stdout;
  
  // Check if page contains demo button text
  const hasDemoButton = pageContent.includes('Try Demo Account') || 
                       pageContent.includes('Try Demo') ||
                       pageContent.includes('demo');
  
  const hasLoadingSpinner = pageContent.includes('Loading...') ||
                           pageContent.includes('animate-spin');
  
  const hasLoginForm = pageContent.includes('Sign in') ||
                      pageContent.includes('Email address') ||
                      pageContent.includes('Password');
  
  console.log('=== LOGIN PAGE TEST RESULTS ===');
  console.log('Has Demo Button:', hasDemoButton);
  console.log('Has Loading Spinner:', hasLoadingSpinner);
  console.log('Has Login Form:', hasLoginForm);
  
  // If still loading, show the beginning of the page content
  if (hasLoadingSpinner && !hasLoginForm) {
    console.log('\n=== PAGE IS STUCK IN LOADING STATE ===');
    console.log('First 500 characters:');
    console.log(pageContent.substring(0, 500));
  } else if (hasLoginForm) {
    console.log('\n=== SUCCESS: LOGIN FORM IS RENDERING ===');
    // Look for demo button specifically
    if (hasDemoButton) {
      console.log('Demo button found in page!');
    } else {
      console.log('Demo button not found, checking page structure...');
    }
  }
  
  if (stderr) {
    console.error('Stderr:', stderr);
  }
});