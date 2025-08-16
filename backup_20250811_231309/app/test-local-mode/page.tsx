'use client';

import { useEffect, useState } from 'react';
import { LocalModeUtils, LOCAL_MODE_CONFIG } from '@/lib/config/local-mode';
import { createClientComponentClient } from '@/lib/supabase-client';

export default function TestLocalModePage() {
  const [results, setResults] = useState<string[]>([]);

  useEffect(() => {
    const runTests = async () => {
      const testResults: string[] = [];
      
      // Test 1: Check if LOCAL_MODE is enabled
      testResults.push('🧪 Testing LOCAL_MODE Configuration');
      testResults.push('=====================================');
      
      if (LocalModeUtils.isEnabled()) {
        testResults.push('✅ LOCAL_MODE is ENABLED');
        testResults.push(`📋 Mock user: ${LOCAL_MODE_CONFIG.MOCK_USER.email}`);
      } else {
        testResults.push('❌ LOCAL_MODE is DISABLED');
      }
      
      testResults.push('');
      
      // Test 2: Test Supabase client
      testResults.push('🔌 Testing Supabase Client');
      testResults.push('===========================');
      
      try {
        const client = createClientComponentClient();
        testResults.push('✅ Supabase client created');
        
        // Test auth
        const { data: authData } = await client.auth.getUser();
        if (authData.user) {
          testResults.push(`✅ Auth user: ${authData.user.email}`);
        } else {
          testResults.push('ℹ️ No authenticated user');
        }
        
        // Test database query - should be mocked
        const { data: userData, error } = await client
          .from('users')
          .select('*')
          .limit(1);
          
        if (error) {
          testResults.push(`❌ Database error: ${error.message}`);
        } else {
          testResults.push(`✅ Database query returned ${userData?.length || 0} records`);
          if (userData && userData.length > 0) {
            testResults.push(`📋 First user: ${userData[0].email}`);
          }
        }
        
      } catch (error) {
        testResults.push(`❌ Supabase test failed: ${error}`);
      }
      
      testResults.push('');
      
      // Test 3: Environment check
      testResults.push('🌍 Environment Variables');
      testResults.push('========================');
      testResults.push(`NEXT_PUBLIC_LOCAL_MODE: ${process.env.NEXT_PUBLIC_LOCAL_MODE}`);
      testResults.push(`NODE_ENV: ${process.env.NODE_ENV}`);
      
      testResults.push('');
      testResults.push('🎯 Expected Results in LOCAL_MODE:');
      testResults.push('- ✅ LOCAL_MODE should be ENABLED');
      testResults.push('- ✅ Database queries should return mock data');
      testResults.push('- ✅ Auth should use mock user');
      testResults.push('- ✅ Network tab should show ZERO external requests');
      testResults.push('');
      testResults.push('🔍 Check DevTools Network Tab:');
      testResults.push('- Should see NO requests to *.supabase.co');
      testResults.push('- Should see NO requests to api.polygon.io');
      testResults.push('- Only localhost:3000 requests allowed');
      
      setResults(testResults);
    };
    
    runTests();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">
          LOCAL_MODE Test Results
        </h1>
        
        <div className="bg-black text-green-400 p-6 rounded-lg font-mono text-sm">
          {results.map((line, index) => (
            <div key={index} className="mb-1">
              {line}
            </div>
          ))}
        </div>
        
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Manual Verification Steps:</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>Open Chrome DevTools (F12)</li>
            <li>Go to Network tab</li>
            <li>Clear network log</li>
            <li>Refresh this page</li>
            <li>Verify NO external requests appear</li>
            <li>Navigate to <a href="/super-cards" className="text-blue-600 underline">/super-cards</a></li>
            <li>Verify app works completely offline</li>
          </ol>
        </div>
        
        <div className="mt-4 p-4 bg-green-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Success Criteria:</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Network tab shows ZERO external requests</li>
            <li>App loads and works without internet</li>
            <li>No failed CORS preflight requests</li>
            <li>No console errors about failed fetches</li>
          </ul>
        </div>
      </div>
    </div>
  );
}