const url = 'https://trust-me-ai-builder.vercel.app';

async function run() {
  try {
    const r = await fetch(url, { redirect: 'follow' });
    console.log('HOME_STATUS', r.status, r.headers.get('content-type'));
    const html = await r.text();

    const jsMatch = html.match(/src="(\/assets\/index-[^\"]+\.js)"/i);
    const cssMatch = html.match(/href="(\/assets\/index-[^\"]+\.css)"/i);
    console.log('JS_ASSET', jsMatch ? jsMatch[1] : 'not found');
    console.log('CSS_ASSET', cssMatch ? cssMatch[1] : 'not found');

    if (jsMatch) {
      const jsUrl = new URL(jsMatch[1], url).href;
      const js = await fetch(jsUrl);
      console.log('JS_FETCH', jsUrl, js.status, js.headers.get('content-type'));
    }
    if (cssMatch) {
      const cssUrl = new URL(cssMatch[1], url).href;
      const css = await fetch(cssUrl);
      console.log('CSS_FETCH', cssUrl, css.status, css.headers.get('content-type'));
    }

    const apiKey = await fetch(`${url}/api/api-key-status`);
    console.log('API_KEY_STATUS', apiKey.status);
    const analyze = await fetch(`${url}/api/analyze-prompt`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ prompt: 'test prompt' }),
    });
    console.log('ANALYZE_PROMPT_STATUS', analyze.status);
  } catch (err) {
    console.error('ERROR', err);
    process.exitCode = 1;
  }
}

run();
