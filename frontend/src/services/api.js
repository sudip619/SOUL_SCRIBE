// frontend/src/services/api.js
import { supabase } from '../supabaseClient'; // Import your configured Supabase client

// Use the environment variable for your deployed backend URL.
// Fallback to localhost for local development.
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://soul-scribe-flask-api.onrender.com/api';

/**
 * A robust, authenticated request helper for your Flask backend that uses the
 * Supabase session token for authorization.
 */
export async function makeAuthenticatedRequest(endpoint, method = 'GET', body = null) {
  // 1. Get the current, active session from Supabase.
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError || !session) {
    console.error('Supabase session error:', sessionError);
    // This error will be caught by the calling component (e.g., MoodSelector)
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

  // Ensure the endpoint starts with a slash
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const fullUrl = `${API_BASE_URL}${path}`;

  try {
    const response = await fetch(fullUrl, config);

    // If the token was rejected by the backend (e.g., it's valid for Supabase
    // but your backend couldn't verify it), we'll get a 401.
    if (response.status === 401) {
      throw new Error('Unauthorized or session expired.');
    }

    return response;
  } catch (error) {
    console.error('API request failed:', error);
    // Re-throw the error so the component can handle it (e.g., show a toast).
    throw error;
  }
}