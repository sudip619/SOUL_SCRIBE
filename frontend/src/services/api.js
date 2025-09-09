// frontend/src/services/api.js
import { supabase } from '../supabaseClient'; // Import your configured Supabase client

// MODIFIED: The base URL should NOT include the /api part.
// This should be the root URL of your deployed backend.
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://soul-scribe-flask-api.onrender.com';

/**
 * A robust, authenticated request helper for your Flask backend that uses the
 * Supabase session token for authorization.
 */
export async function makeAuthenticatedRequest(endpoint, method = 'GET', body = null) {
  // 1. Get the current, active session from Supabase.
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError || !session) {
    console.error('Supabase session error:', sessionError);
    throw new Error('Unauthorized or session expired.');
  }

  // 2. Extract the JWT access token from the session.
  const token = session.access_token;

  // 3. Set up the headers, including the Supabase token.
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  const config = {
    method: method,
    headers: headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  // --- THIS IS THE FIX ---
  // We ensure the final URL is correctly formatted as:
  // https://your-backend-url.onrender.com/api/your-endpoint
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const fullUrl = `${API_BASE_URL}/api${path}`;
  // -----------------------

  try {
    const response = await fetch(fullUrl, config);

    if (response.status === 401) {
      throw new Error('Unauthorized or session expired.');
    }
    
    // Add specific handling for 404 errors
    if (response.status === 404) {
        throw new Error(`API endpoint not found at ${fullUrl}`);
    }

    return response;
  } catch (error) {
    console.error('API request failed:', error);
    // Re-throw the error so the calling component can handle it.
    throw error;
  }
}