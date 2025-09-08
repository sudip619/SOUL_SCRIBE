// src/components/SupabaseRegistrationTest.js
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

function SupabaseRegistrationTest() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('Enter credentials to test Supabase registration.');

  const handleTestSignUp = async (e) => {
    e.preventDefault();
    setMessage('Attempting to register new user...');

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (error) {
        setMessage(`FAIL! Supabase Error: ${error.message}`);
        throw error;
      }

      setMessage('SUCCESS! Registration was successful. A new user has been created in Supabase.');
      console.log('Successful registration data:', data);

    } catch (error) {
      console.error('Test Registration Failed:', error);
    }
  };

  return (
    <div style={{ padding: '2rem', backgroundColor: '#222', color: 'white', borderRadius: '8px' }}>
      <h2>Supabase Registration Test</h2>
      <p>This component will try to create a new user in your Supabase project.</p>
      <hr style={{ margin: '1rem 0' }} />
      <form onSubmit={handleTestSignUp}>
        <div style={{ marginBottom: '1rem' }}>
          <label>Email: </label>
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

export default SupabaseRegistrationTest;