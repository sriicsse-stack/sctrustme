const url = 'https://trust-me-ai-builder-5714t45w4-sri-s-projectscs.vercel.app';

async function run() {
  try {
    const r = await fetch(url, { redirect: 'follow' });
    console.log('HOME_STATUS', r.status, r.headers.get('content-type'));
    const html = await r.text();
    console.log('HOME_HTML_LENGTH', html.length);
    console.log('HOME_HTML_SNIPPET', html.slice(0, 450).replace(/\n/g, ' '));

    const cssMatches = [...html.matchAll(/href="([^"]+\.css)"/gi)].map(m => m[1]);
    const jsMatches = [...html.matchAll(/src="([^"]+\.js)"/gi)].map(m => m[1]);
    console.log('CSS_URLS', cssMatches);
    console.log('JS_URLS', jsMatches);

    for (const cssPath of cssMatches) {
      const cssUrl = new URL(cssPath, url).href;
      const c = await fetch(cssUrl);
      console.log('CSS_FETCH', cssUrl, c.status, c.headers.get('content-type'));
    }
    for (const jsPath of jsMatches) {
      const jsUrl = new URL(jsPath, url).href;
      const j = await fetch(jsUrl);
      console.log('JS_FETCH', jsUrl, j.status, j.headers.get('content-type'));
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
