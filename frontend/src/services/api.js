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

  const fetchConfig = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    mode: 'cors',
    credentials: 'include',
    body: JSON.stringify(data),
    ...options,
  };

  try {
    const response = await fetch(url, fetchConfig);
    return response;
  } catch (fetchErr) {
    // Some analytics tools may wrap window.fetch and cause unexpected errors.
    // Attempt a lightweight XMLHttpRequest fallback so we can still reach the backend
    console.warn('Fetch failed, attempting XHR fallback:', fetchErr);
    return new Promise((resolve, reject) => {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', url);
        xhr.setRequestHeader('Content-Type', 'application/json');
        // If Authorization header present in options.headers, set it
        if (options.headers && options.headers.Authorization) {
          xhr.setRequestHeader('Authorization', options.headers.Authorization);
        }
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
        xhr.onerror = () => reject(new Error('Network error (XHR)'));
        xhr.send(JSON.stringify(data));
      } catch (xhrErr) {
        reject(xhrErr);
      }
    });
  }
}

export async function makeAuthenticatedRequest(url, method = 'GET', data = null) {
  const token = localStorage.getItem('authToken');
  if (!token) {
    alert('You are not logged in.');
    throw new Error('No authentication token found.');
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  const config = { method, headers };
  if (data) config.body = JSON.stringify(data);

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${url}`, config);
  } catch (err) {
    // Network-level error (CORS, DNS, refused connection, offline, etc.)
    console.error('Network error during API request:', err);
    throw new Error('Failed to reach the server. Please check your connection or try again later.');
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
