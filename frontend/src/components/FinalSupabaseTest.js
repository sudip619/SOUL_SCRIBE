// src/components/FinalSupabaseTest.js
import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// --- TEMPORARY HARDCODED KEYS ---
// MODIFIED: Added quotes to make these valid strings
const TEST_SUPABASE_URL = "https://aqxqcrjnlxwchmjuznwi.supabase.co";
const TEST_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxeHFjcmpubHh3Y2htanV6bndpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczMTAyNjcsImV4cCI6MjA3Mjg4NjI2N30.8I8olMoonQ1qUNLgA39Xibydv7SrG1nbZ8v-LWAGe60";
// ---------------------------------

// We create a new, isolated Supabase client for this test
const testSupabase = createClient(TEST_SUPABASE_URL, TEST_SUPABASE_ANON_KEY);

function FinalSupabaseTest() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('Enter credentials to test the direct connection.');

  const handleTestSignUp = async (e) => {
    e.preventDefault();
    setMessage('Attempting to register new user...');

    try {
      const { data, error } = await testSupabase.auth.signUp({
        email: email,
        password: password,
      });

      if (error) {
        setMessage(`FAIL! Supabase Error: ${error.message}`);
        throw error;
      }

      setMessage('SUCCESS! Registration worked with hardcoded keys.');
      console.log('Successful registration data:', data);

    } catch (error) {
      console.error('Test Registration Failed:', error);
    }
  };

  return (
    <div style={{ padding: '2rem', backgroundColor: '#222', color: 'white', borderRadius: '8px' }}>
      <h2>Final Supabase Connection Test</h2>
      <hr style={{ margin: '1rem 0' }} />
      <form onSubmit={handleTestSignUp}>
        <div style={{ marginBottom: '1rem' }}>
          <label>New Email: </label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            style={{ color: 'black' }}
            required 
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Password (at least 6 characters): </label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            style={{ color: 'black' }}
            required 
          />
        </div>
        <button type="submit" style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>Test Registration</button>
      </form>
      <hr style={{ margin: '1rem 0' }} />
      <h3>Test Result:</h3>
      <p style={{ fontWeight: 'bold' }}>{message}</p>
    </div>
  );
}

export default FinalSupabaseTest;