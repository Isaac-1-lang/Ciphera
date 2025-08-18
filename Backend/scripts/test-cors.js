#!/usr/bin/env node

// Simple CORS test script
// Run this to test if your CORS configuration is working

import fetch from 'node-fetch';

const API_BASE = process.env.API_URL || 'http://localhost:3560';

async function testCORS() {
  console.log('🧪 Testing CORS configuration...\n');
  
  const tests = [
    {
      name: 'Health Check (GET)',
      url: `${API_BASE}/health`,
      method: 'GET',
      headers: {}
    },
    {
      name: 'API Docs (GET)',
      url: `${API_BASE}/api-docs`,
      method: 'GET',
      headers: {}
    },
    {
      name: 'Auth Endpoint (POST)',
      url: `${API_BASE}/api/auth/login`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3000'
      },
      body: JSON.stringify({ email: 'test@example.com', password: 'test' })
    }
  ];

  for (const test of tests) {
    try {
      console.log(`Testing: ${test.name}`);
      console.log(`URL: ${test.url}`);
      console.log(`Method: ${test.method}`);
      
      const response = await fetch(test.url, {
        method: test.method,
        headers: test.headers,
        body: test.body
      });
      
      console.log(`Status: ${response.status}`);
      console.log(`CORS Headers:`);
      console.log(`  Access-Control-Allow-Origin: ${response.headers.get('access-control-allow-origin')}`);
      console.log(`  Access-Control-Allow-Methods: ${response.headers.get('access-control-allow-methods')}`);
      console.log(`  Access-Control-Allow-Headers: ${response.headers.get('access-control-allow-headers')}`);
      console.log(`  Access-Control-Allow-Credentials: ${response.headers.get('access-control-allow-credentials')}`);
      
      if (response.ok) {
        console.log('✅ Success\n');
      } else {
        console.log('❌ Failed\n');
      }
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}\n`);
    }
  }
  
  console.log('🎯 CORS Test Complete!');
  console.log('\nTo test from your frontend:');
  console.log('1. Make sure your frontend is running on one of the allowed ports');
  console.log('2. Set NODE_ENV=development in your .env file for permissive CORS');
  console.log('3. Try making a request from your frontend to the API');
}

// Run the test
testCORS().catch(console.error);
