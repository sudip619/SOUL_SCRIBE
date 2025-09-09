import { supabase } from '../supabaseClient';

// Helper to build absolute URL for API requests
function buildUrl(endpoint) {
  const base = (process.env.REACT_APP_API_BASE_URL || '').replace(/\/+$/, '');
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return base ? `${base}${path}` : path;
}

// makeAuthenticatedRequest performs a fetch to the backend API and
// attaches an Authorization header when a Supabase session token is available.
export async function makeAuthenticatedRequest(endpoint, method = 'GET', body = null, extraHeaders = {}) {
  const url = buildUrl(endpoint);

  const headers = {
    'Content-Type': 'application/json',
    ...extraHeaders,
  };

  try {
    // Attempt to get a session token from Supabase (works with v2 and v1 clients)
    let token;

    if (supabase && supabase.auth) {
      // Supabase v2: supabase.auth.getSession()
      if (typeof supabase.auth.getSession === 'function') {
        const sessionResult = await supabase.auth.getSession();
        token = sessionResult?.data?.session?.access_token;
      }

      // Supabase v1 fallback: supabase.auth.session()
      if (!token && typeof supabase.auth.session === 'function') {
        token = supabase.auth.session()?.access_token;
      }
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  } catch (err) {
    // If anything goes wrong retrieving token, continue without it.
    // Avoid throwing here so UI components can handle unauthenticated flows.
    // eslint-disable-next-line no-console
    console.warn('Could not retrieve auth token for request', err);
  }

  const options = {
    method,
    headers,
  };

  if (body != null) {
    options.body = JSON.stringify(body);
  }

  return fetch(url, options);
}
