const BASE = 'https://soul-scribe-flask-api.onrender.com/api';

async function run() {
  const ts = Date.now();
  const username = `builder_e2e_${ts}`;
  const password = 'Test12345!';

  function log(title, data) {
    console.log(`\n=== ${title} ===`);
    if (typeof data === 'string') {
      console.log(data);
    } else {
      console.log(JSON.stringify(data, null, 2));
    }
  }

  try {
    // 1) Health
    const healthRes = await fetch(`${BASE}/health`);
    const healthJson = await healthRes.json();
    log('Health', { status: healthRes.status, body: healthJson });

    // 2) Register
    const regRes = await fetch(`${BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    let regBody = null;
    try { regBody = await regRes.json(); } catch (_) { regBody = await regRes.text(); }
    log('Register', { status: regRes.status, body: regBody, username });

    // 3) Login
    const loginRes = await fetch(`${BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const loginJson = await loginRes.json();
    log('Login', { status: loginRes.status, body: loginJson });

    if (!loginRes.ok || !loginJson.token) {
      console.log('\nLogin failed; aborting subsequent tests.');
      return;
    }

    const token = loginJson.token;

    // 4) Profile GET
    const profRes = await fetch(`${BASE}/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const profJson = await profRes.json();
    log('Profile GET', { status: profRes.status, body: profJson });

    // 5) Mood POST
    const moodRes = await fetch(`${BASE}/mood`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ mood: 'happy' })
    });
    const moodJson = await moodRes.json();
    log('Mood POST', { status: moodRes.status, body: moodJson });

    // 6) Mood history
    const histRes = await fetch(`${BASE}/mood/history`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const histJson = await histRes.json();
    log('Mood history', { status: histRes.status, body: histJson });

    // 7) Chat
    const chatRes = await fetch(`${BASE}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ message: 'Hello there' })
    });
    let chatBody;
    try { chatBody = await chatRes.json(); } catch (_) { chatBody = await chatRes.text(); }
    log('Chat', { status: chatRes.status, body: chatBody });
  } catch (err) {
    console.error('E2E test error:', err);
    process.exitCode = 1;
  }
}

run();
