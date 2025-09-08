// frontend/src/supabaseClient.js
// Supabase client helper for the SoulScribe frontend
// Usage: import { supabase, signInWithEmail, signOut } from './supabaseClient'

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  // Don't throw at import time in non-browser contexts, but log a clear warning
  // so developers know they must provide the env vars in their environment.
  // This keeps the app from crashing if the file is imported in tests without envs.
  // The runtime functions below will still throw if used without proper config.
  // eslint-disable-next-line no-console
  console.warn('[supabaseClient] REACT_APP_SUPABASE_URL or REACT_APP_SUPABASE_ANON_KEY not set. Supabase will not be initialized.');
}

export const isSupabaseConfigured = () => Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured() ? createClient(supabaseUrl, supabaseAnonKey, {
  // Opt-in recommended defaults
  auth: { persistSession: true, detectSessionInUrl: true },
}) : null;

// Helper wrappers (return consistent objects and throw helpful errors when not configured)
export async function signInWithEmail(email, password) {
  if (!supabase) throw new Error('Supabase is not configured. Set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY.');
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signUpWithEmail(email, password, options = {}) {
  if (!supabase) throw new Error('Supabase is not configured. Set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY.');
  const { data, error } = await supabase.auth.signUp({ email, password }, options);
  if (error) throw error;
  return data;
}

export async function signOut() {
  if (!supabase) throw new Error('Supabase is not configured. Set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY.');
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  return true;
}

export function onAuthStateChange(callback) {
  if (!supabase) throw new Error('Supabase is not configured. Set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY.');
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
}

export default supabase;
