import React, { useState } from 'react';
import { postJSON } from '../services/api';
import { supabase } from '../supabaseClient';

function AuthForm({ onLoginSuccess, showAlert }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    if (isRegistering) {
      handleRegister();
    } else {
      handleLogin();
    }
  };

  // New handleRegister function
  const handleRegister = async (username, password) => {
    try {
      // Supabase uses email for registration. We'll create a dummy email from the username.
      const email = `${username}@example.com`;

      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: { username: username } // Stores the username in user metadata
        }
      });

      if (error) throw error;
      alert('Registration successful! Check your email for a verification link.');

    } catch (error) {
      alert('Error during registration: ' + error.message);
    }
  };

  // New handleLogin function
  const handleLogin = async (username, password) => {
    try {
      const email = `${username}@example.com`;

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) throw error;
      console.log('Login successful!', data);

    } catch (error){
    alert('Error during login: ' + error.message);
  ``}
};

  return (
    <div className="auth-page-wrapper">
      <div className="auth-page-container auth-only">
        <div className="auth-form-container" data-aos="fade-down" data-aos-duration="800">
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-input-card">
              <div className="auth-input-card2">
                <div className="auth-input-group">
                  <input required type="text" id="username" className="auth-input-field" value={username} onChange={(e) => setUsername(e.target.value)} placeholder=" " />
                  <label htmlFor="username" className="auth-input-label">Username</label>
                </div>
              </div>
            </div>

            <div className="auth-input-card">
              <div className="auth-input-card2">
                <div className="auth-input-group">
                  <input required type="password" id="password" className="auth-input-field" value={password} onChange={(e) => setPassword(e.target.value)} placeholder=" " />
                  <label htmlFor="password" className="auth-input-label">Password</label>
                </div>
              </div>
            </div>

            {isRegistering && (
              <div className="auth-input-card">
                <div className="auth-input-card2">
                  <div className="auth-input-group">
                    <input required type="password" id="confirmPassword" className="auth-input-field" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder=" " />
                    <label htmlFor="confirmPassword" className="auth-input-label">Confirm Password</label>
                  </div>
                </div>
              </div>
            )}

            <button type="submit" className="c-button c-button--gooey">
              {isRegistering ? 'Sign Up' : 'Sign In'}
              <div className="c-button__blobs"><div></div><div></div><div></div></div>
            </button>
          </form>
          <div className="auth-toggle-link">
            <a href="#" onClick={(e) => { e.preventDefault(); setIsRegistering(!isRegistering); }}>
              {isRegistering ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthForm;
