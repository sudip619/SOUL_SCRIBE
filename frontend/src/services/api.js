// frontend/src/services/api.js

// Resolve API base URL with sensible defaults:
// - Use REACT_APP_API_BASE_URL when provided (prod/staging)
// - Else use relative "/api" so same-origin deployments work (behind reverse proxy)
// - In local dev with CRA, "/api" can be proxied via package.json "proxy" field
const API_BASE_URL = (process.env.REACT_APP_API_BASE_URL || '/api').replace(/\/$/, '');

export { API_BASE_URL };

// POST JSON with robust error handling and XHR fallback to avoid analytics wrappers
export async function postJSON(path, data, options = {}) {
  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`;

  // Temporary debug: log request URL and non-sensitive data shape (no values)
  try {
    const dataInfo = data && typeof data === 'object' ? { keys: Object.keys(data) } : { type: typeof data };
    console.debug('[postJSON] Request URL:', url, 'Data info:', dataInfo, 'Options keys:', Object.keys(options || {}));
  } catch (dbgErr) {
    console.debug('[postJSON] Request URL:', url, '(error building debug info):', dbgErr);
  }

  // Avoid sending credentials by default (reduces CORS complexity). Allow override via options.
  const fetchConfig = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    // mode: 'cors' is default for cross-origin requests from browsers
    body: JSON.stringify(data),
    ...options,
  };

  const timeoutMs = options.timeout || 30000; // 30s default
  const retries = Number.isInteger(options.retries) ? options.retries : 2; // retry attempts for transient failures

  // Fast fail when offline
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    throw new Error('You appear to be offline. Please check your network connection and try again.');
  }

  // First attempt(s): plain fetch with retry/backoff using AbortController to cancel on timeout
  for (let attempt = 0; attempt <= retries; attempt++) {
    let controller = null;
    let timeoutId = null;
    try {
      controller = new AbortController();
      const fetchWithSignal = { ...fetchConfig, signal: controller.signal };
      const fetchPromise = fetch(url, fetchWithSignal);

      // Set up timeout to abort the request cleanly
      timeoutId = setTimeout(() => {
        try { controller.abort(); } catch (_) {}
      }, timeoutMs);

      const response = await fetchPromise;

      if (timeoutId) clearTimeout(timeoutId);

      if (response && response.type === 'opaque') {
        throw new Error('Opaque response received — likely blocked by CORS. Enable CORS on the API server or use a same-origin proxy.');
      }

      return response;
    } catch (fetchErr) {
      if (timeoutId) clearTimeout(timeoutId);
      const isAbort = fetchErr && (fetchErr.name === 'AbortError' || /timed out/i.test(fetchErr.message));
      console.error(`[postJSON] fetch attempt ${attempt + 1} failed for URL: ${url}`, fetchErr);
      if (attempt < retries) {
        // Exponential backoff before retrying
        const backoff = 300 * Math.pow(2, attempt);
        console.debug(`[postJSON] retrying in ${backoff}ms (attempt ${attempt + 2}/${retries + 1})`);
        await new Promise((res) => setTimeout(res, backoff));
        continue;
      }

      // If abort/timeouts occurred, provide clearer guidance
      if (isAbort) {
        const timedOutError = new Error(`Request timed out when calling ${url}. The server may be slow or unreachable. Try again or check the server/CORS configuration.`);
        timedOutError.name = 'RequestTimeoutError';
        throw timedOutError;
      }

      // After exhausting fetch retries, proceed to iframe/XHR fallbacks
      try {
        // Create an inert iframe to access an unwrapped fetch implementation
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = 'about:blank';
        document.documentElement.appendChild(iframe);
        const win = iframe.contentWindow;
        if (win && typeof win.fetch === 'function') {
          try {
            console.debug('[postJSON] Attempting iframe.fetch fallback for URL:', url);
            const iframeController = new win.AbortController ? new win.AbortController() : null;
            const iframeSignal = iframeController ? { signal: iframeController.signal } : {};
            const iframeFetchPromise = win.fetch(url, { ...fetchConfig, ...iframeSignal });
            const iframeTimeoutId = setTimeout(() => { try { iframeController && iframeController.abort(); } catch (_) {} }, timeoutMs);
            const iframeResponse = await iframeFetchPromise;
            try { document.documentElement.removeChild(iframe); } catch (_) {}
            if (iframeTimeoutId) clearTimeout(iframeTimeoutId);
            if (iframeResponse && iframeResponse.type === 'opaque') {
              throw new Error('Opaque response received from iframe.fetch — likely blocked by CORS.');
            }
            return iframeResponse;
          } catch (iframeErr) {
            console.warn('[postJSON] iframe.fetch fallback failed for URL:', url, 'error:', iframeErr);
            try { document.documentElement.removeChild(iframe); } catch (_) {}
          }
        } else {
          try { document.documentElement.removeChild(iframe); } catch (_) {}
        }
      } catch (iframeConstructionErr) {
        console.warn('[postJSON] Could not use iframe.fetch fallback:', iframeConstructionErr);
      }

      console.warn('Fetch (and iframe.fetch) failed, will try XHR fallback');

      // Second attempt: try XHR
      return new Promise((resolve, reject) => {
        try {
          const xhr = new XMLHttpRequest();
          xhr.open('POST', url);
          xhr.setRequestHeader('Content-Type', 'application/json');
          if (options.headers && options.headers.Authorization) {
            xhr.setRequestHeader('Authorization', options.headers.Authorization);
          }
          xhr.timeout = timeoutMs;
          xhr.onload = () => {
            const res = {
              ok: xhr.status >= 200 && xhr.status < 300,
              status: xhr.status,
              text: () => Promise.resolve(xhr.responseText),
              json: () => {
                try {
                  return Promise.resolve(JSON.parse(xhr.responseText));
                } catch (e) {
                  return Promise.reject(e);
                }
              },
            };
            resolve(res);
          };
          xhr.onerror = () => reject(new Error(`Network error (XHR) — possible CORS or connectivity issue when calling ${url}`));
          xhr.ontimeout = () => reject(new Error(`Request timed out (XHR) when calling ${url}`));
          xhr.send(JSON.stringify(data));
        } catch (xhrErr) {
          console.error('[postJSON] XHR construction failed for URL:', url, 'error:', xhrErr);
          reject(xhrErr);
        }
      });
    }
  }
}

export async function makeAuthenticatedRequest(url, method = 'GET', data = null, options = {}) {
  const token = localStorage.getItem('authToken');
  if (!token) {
    alert('You are not logged in.');
    throw new Error('No authentication token found.');
  }

  // Fast fail when offline
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    throw new Error('You appear to be offline. Please check your network connection and try again.');
  }

  // Normalize path: ensure it starts with /api
  let path = url || '';
  if (!path.startsWith('/')) path = `/${path}`;
  if (!path.startsWith('/api')) path = `/api${path}`;

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...(options.headers || {}),
  };

  const config = { method, headers };
  if (data) config.body = JSON.stringify(data);

  const fullUrl = `${API_BASE_URL}${path}`;

  // Use AbortController to enforce timeout
  const timeoutMs = options.timeout || 30000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => { try { controller.abort(); } catch (_) {} }, timeoutMs);

  let response;
  try {
    response = await fetch(fullUrl, { ...config, signal: controller.signal });
  } catch (err) {
    if (err && err.name === 'AbortError') {
      throw new Error(`Request timed out when calling ${fullUrl}`);
    }
    console.error('Network error during API request:', err);
    throw new Error('Failed to reach the server. Please check your connection or try again later.');
  } finally {
    clearTimeout(timeoutId);
  }

  if (response.status === 401 || response.status === 403) {
    let errorMessage = 'Session expired or unauthorized. Please log in again.';
    try {
      const errorData = await response.json();
      if (errorData?.message) errorMessage = errorData.message;
    } catch (_) {}
    alert(errorMessage);
    throw new Error('Unauthorized or session expired.');
  }

  return response;
}
