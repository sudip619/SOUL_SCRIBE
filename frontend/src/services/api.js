// frontend/src/services/api.js

// Resolve API base URL with sensible defaults:
// - Use REACT_APP_API_BASE_URL when provided (prod/staging)
// - Else use relative "/api" so same-origin deployments work (behind reverse proxy)
// - In local dev with CRA, "/api" can be proxied via package.json "proxy" field
const API_BASE_URL = (process.env.REACT_APP_API_BASE_URL || '/api').replace(/\/$/, '');

export { API_BASE_URL };

export async function makeAuthenticatedRequest(url, method = 'GET', data = null) {
  const token = localStorage.getItem('authToken');
  if (!token) {
    alert('You are not logged in.');
    throw new Error('No authentication token found.');
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
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
