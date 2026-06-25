#!/usr/bin/env node

const url = 'https://trust-me-ai-builder-5714t45w4-sri-s-projectscs.vercel.app';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(status, message, details = '') {
  const symbol = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  const color = status === 'PASS' ? colors.green : status === 'FAIL' ? colors.red : colors.yellow;
  console.log(`${symbol} ${color}${status}${colors.reset}: ${message}${details ? ' - ' + details : ''}`);
}

async function run() {
  console.log('\n' + colors.cyan + '=== Gemini API Configuration Verification ===' + colors.reset + '\n');

  try {
    // Test 1: API Key Status
    console.log(colors.blue + '🔑 Testing API Key Status...' + colors.reset);
    const apiKeyRes = await fetch(`${url}/api/api-key-status`, {
      headers: { 'Accept': 'application/json' }
    });
    
    const contentType = apiKeyRes.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      log('FAIL', 'API Key Status', `Expected JSON, got ${contentType.substring(0, 30)}`);
    }
    
    let apiKeyData;
    try {
      apiKeyData = await apiKeyRes.json();
    } catch (e) {
      log('FAIL', 'API Key Status', 'Response is not valid JSON. Endpoint may not exist.');
      return;
    }
    
    if (apiKeyRes.ok && apiKeyData.active === true) {
      log('PASS', 'API Key Status', 'Key is ACTIVE and loaded');
    } else if (apiKeyRes.ok && apiKeyData.active === false) {
      log('FAIL', 'API Key Status', 'Key is NOT loaded or invalid');
    } else {
      log('FAIL', 'API Key Status', `HTTP ${apiKeyRes.status}`);
    }

    // Test 2: Analyze Prompt (Phase 1)
    console.log('\n' + colors.blue + '📊 Testing /api/analyze-prompt (Phase 1)...' + colors.reset);
    const analyzeRes = await fetch(`${url}/api/analyze-prompt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'build a simple todo app' })
    });
    
    if (analyzeRes.status === 429) {
      log('FAIL', 'Analyze Prompt', 'HTTP 429 - Quota Exceeded (Model might be overused)');
    } else if (analyzeRes.status === 200) {
      const data = await analyzeRes.json();
      if (data.error) {
        log('FAIL', 'Analyze Prompt', `API Error: ${data.error}`);
      } else if (data.features || data.requirements) {
        log('PASS', 'Analyze Prompt', 'Gemini is responding with analysis');
      } else {
        log('PASS', 'Analyze Prompt', 'HTTP 200 OK');
      }
    } else if (analyzeRes.status === 400 || analyzeRes.status === 401 || analyzeRes.status === 403) {
      const errText = await analyzeRes.text();
      log('FAIL', 'Analyze Prompt', `HTTP ${analyzeRes.status} - API error`);
    } else {
      log('FAIL', 'Analyze Prompt', `HTTP ${analyzeRes.status}`);
    }

    // Test 3: Generate (Phase 2)
    console.log('\n' + colors.blue + '🔨 Testing /api/generate (Phase 2)...' + colors.reset);
    const generateRes = await fetch(`${url}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        prompt: 'build a simple todo app',
        size: 'medium'
      })
    });
    
    if (generateRes.status === 429) {
      log('FAIL', 'Generate', 'HTTP 429 - Quota Exceeded');
    } else if (generateRes.status === 200) {
      const data = await generateRes.json();
      if (data.error) {
        log('FAIL', 'Generate', `API Error: ${data.error}`);
      } else if (data.files || data.html) {
        log('PASS', 'Generate', 'Gemini generated content successfully');
      } else {
        log('PASS', 'Generate', 'HTTP 200 OK');
      }
    } else if (generateRes.status === 400 || generateRes.status === 401 || generateRes.status === 403) {
      log('FAIL', 'Generate', `HTTP ${generateRes.status}`);
    } else {
      log('FAIL', 'Generate', `HTTP ${generateRes.status}`);
    }

    // Test 4: Sri AI Chat
    console.log('\n' + colors.blue + '💬 Testing /api/sri-ai (Chat)...' + colors.reset);
    const chatRes = await fetch(`${url}/api/sri-ai`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Hello, how are you?' })
    });
    
    if (chatRes.status === 429) {
      log('FAIL', 'Sri AI Chat', 'HTTP 429 - Quota Exceeded');
    } else if (chatRes.status === 200) {
      const data = await chatRes.json();
      if (data.error) {
        log('FAIL', 'Sri AI Chat', `API Error: ${data.error}`);
      } else if (data.reply || data.response) {
        log('PASS', 'Sri AI Chat', 'Chat is responding');
      } else {
        log('PASS', 'Sri AI Chat', 'HTTP 200 OK');
      }
    } else {
      log('FAIL', 'Sri AI Chat', `HTTP ${chatRes.status}`);
    }

    // Summary
    console.log('\n' + colors.cyan + '=== Summary ===' + colors.reset);
    console.log(`${colors.yellow}🔧 Troubleshooting Steps:${colors.reset}`);
    console.log('1. Check Vercel environment variables have GEMINI_API_KEY');
    console.log('2. Check GEMINI_MODEL=gemini-2.5-flash (new best-free model)');
    console.log('3. Verify new API key was set: https://console.cloud.google.com');
    console.log('4. Check Vercel function logs for initialization messages');
    console.log('5. If 429 persists, quota may be exhausted - try again in 24 hours');
    console.log('\nVercel URL: ' + url + '\n');

  } catch (error) {
    log('FAIL', 'Network Request', error.message);
    process.exitCode = 1;
  }
}

run();
