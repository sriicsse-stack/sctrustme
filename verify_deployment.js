const url = 'https://trust-me-ai-builder-5714t45w4-sri-s-projectscs.vercel.app';

async function run() {
  try {
    const r = await fetch(url, { redirect: 'follow' });
    console.log('HOME_STATUS', r.status, r.headers.get('content-type'));
    const html = await r.text();

    const cssMatch = html.match(/href="([^"]+\.css)"/i);
    const jsMatch = html.match(/src="([^"]+\.js)"/i);

    if (cssMatch) {
      const cssUrl = new URL(cssMatch[1], url).href;
      const c = await fetch(cssUrl);
      console.log('CSS_STATUS', c.status, c.headers.get('content-type'));
    } else {
      console.log('CSS_STATUS none');
    }

    if (jsMatch) {
      const jsUrl = new URL(jsMatch[1], url).href;
      const j = await fetch(jsUrl);
      console.log('JS_STATUS', j.status, j.headers.get('content-type'));
    } else {
      console.log('JS_STATUS none');
    }

    console.log('LOGIN_INDICATOR', /supabase\.auth\.signInWithOAuth|sign in with google|google auth|auth\.signInWithOAuth|supabase/i.test(html));

    const apiKey = await fetch(`${url}/api/api-key-status`);
    console.log('API_KEY_STATUS', apiKey.status);

    const analyze = await fetch(`${url}/api/analyze-prompt`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ prompt: 'test prompt' }),
    });
    console.log('ANALYZE_PROMPT_STATUS', analyze.status);

  } catch (error) {
    console.error('ERROR', error);
    process.exitCode = 1;
  }
}

run();
