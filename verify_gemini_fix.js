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
  console.log('\n' + colors.cyan + '=== OpenRouter Configuration Verification ===' + colors.reset + '\n');

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
      log('PASS', 'API Key Status', 'Key is ACTIVE and loaded (OpenRouter)');
    } else if (apiKeyRes.ok && apiKeyData.active === false) {
      log('FAIL', 'API Key Status', 'Key is NOT loaded or invalid');
    } else {
      log('FAIL', 'API Key Status', `HTTP ${apiKeyRes.status}`);
    }

    // Test 2: Analyze Prompt
    console.log('\n' + colors.blue + '📊 Testing /api/analyze-prompt...' + colors.reset);
    const analyzeRes = await fetch(`${url}/api/analyze-prompt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'build a simple todo app' })
    });

    if (analyzeRes.status === 200) {
      const data = await analyzeRes.json();
      if (data.error) {
        log('FAIL', 'Analyze Prompt', `API Error: ${data.error}`);
      } else {
        log('PASS', 'Analyze Prompt', 'HTTP 200 OK (OpenRouter backend)');
      }
    } else {
      log('FAIL', 'Analyze Prompt', `HTTP ${analyzeRes.status}`);
    }

    // Test 3: Generate
    console.log('\n' + colors.blue + '🔨 Testing /api/generate...' + colors.reset);
    const generateRes = await fetch(`${url}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'build a simple todo app', size: 'medium' })
    });

    if (generateRes.status === 200) {
      const data = await generateRes.json();
      if (data.error) {
        log('FAIL', 'Generate', `API Error: ${data.error}`);
      } else {
        log('PASS', 'Generate', 'HTTP 200 OK (OpenRouter backend)');
      }
    } else {
      log('FAIL', 'Generate', `HTTP ${generateRes.status}`);
    }

    // Summary
    console.log('\n' + colors.cyan + '=== Summary ===' + colors.reset);
    console.log(`${colors.yellow}🔧 Troubleshooting Steps:${colors.reset}`);
    console.log('1. Ensure Vercel environment variables include OPENROUTER_API_KEY');
    console.log('2. Verify `MODEL`/`OPENROUTER_MODEL` is set to an OpenRouter model (for example `openrouter/free`)');
    console.log('3. Check server logs for OpenRouter initialization messages');
    console.log('\nVercel URL: ' + url + '\n');

  } catch (error) {
    log('FAIL', 'Network Request', error.message);
    process.exitCode = 1;
  }
}

run();
