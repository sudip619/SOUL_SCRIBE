// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

let supabase;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  // Provide a lightweight stub to avoid runtime crashes when env vars are not available
  // Methods return a consistent shape similar to Supabase responses: { data, error }
  console.warn('Supabase not configured: REACT_APP_SUPABASE_URL or REACT_APP_SUPABASE_ANON_KEY is missing. Supabase features will be disabled.');
  const makeRejected = (msg) => async () => ({ data: null, error: new Error(msg) });
  supabase = {
    auth: {
      signUp: makeRejected('Supabase not configured'),
      signInWithPassword: makeRejected('Supabase not configured'),
      signIn: makeRejected('Supabase not configured'),
      signOut: makeRejected('Supabase not configured'),
    },
    from: () => ({ select: makeRejected('Supabase not configured'), insert: makeRejected('Supabase not configured'), update: makeRejected('Supabase not configured'), delete: makeRejected('Supabase not configured') }),
    rpc: makeRejected('Supabase not configured')
  };
}

export { supabase };
