// src/components/SupabaseTest.js
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

function SupabaseTest() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('Enter your credentials to test the Supabase connection.');

  const handleTestLogin = async (e) => {
    e.preventDefault();
    setMessage('Attempting to log in...');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        // This will show us the REAL error from Supabase
        setMessage(`FAIL! Supabase Error: ${error.message}`);
        throw error;
      }

      setMessage('SUCCESS! Login was successful. Your credentials are correct.');
      console.log('Successful login data:', data);

    } catch (error) {
      console.error('Test Login Failed:', error);
    }
  };

  return (
    <div style={{ padding: '2rem', backgroundColor: '#222', color: 'white', borderRadius: '8px' }}>
      <h2>Supabase Connection Test</h2>
      <p>This component bypasses all other app logic to test the connection directly.</p>
      <hr style={{ margin: '1rem 0' }} />
      <form onSubmit={handleTestLogin}>
        <div style={{ marginBottom: '1rem' }}>
          <label>Email (e.g., testuser@example.com): </label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            style={{ color: 'black' }}
            required 
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Password: </label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            style={{ color: 'black' }}
            required 
          />
        </div>
        <button type="submit" style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>Test Login</button>
      </form>
      <hr style={{ margin: '1rem 0' }} />
      <h3>Test Result:</h3>
      <p style={{ fontWeight: 'bold' }}>{message}</p>
    </div>
  );
}

export default SupabaseTest;