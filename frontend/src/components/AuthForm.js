import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

function AuthForm({ onLoginSuccess, showAlert }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
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

  // Register new user using Supabase
  const handleRegister = async () => {
    if (!email || !password || !username) {
      showAlert('Please provide username, email and password to register.', false);
      return;
    }
    if (password !== confirmPassword) {
      showAlert('Passwords do not match.', false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: { data: { username } }
      });

      if (error) {
        showAlert(error.message || 'Registration failed.', false);
        return;
      }

      // If confirmation email is disabled, a session may be returned. If not, user must verify email.
      const userId = data?.user?.id || null;
      const displayName = (data?.user?.user_metadata && data.user.user_metadata.username) || username || email.split('@')[0];

      // Persist minimal auth info if we received a session
      const token = data?.session?.access_token;
      if (token) {
        localStorage.setItem('authToken', token);
        localStorage.setItem('username', displayName);
        localStorage.setItem('userId', userId);
        showAlert('Registration successful. You are now signed in.', true);
        onLoginSuccess && onLoginSuccess(displayName, userId);
      } else {
        // No session (email confirmation likely required) — inform user
        showAlert('Registration successful. Check your email to confirm your account (if email confirmation is enabled).', true);
      }
    } catch (err) {
      console.error('Registration error:', err);
      showAlert(err.message || 'Registration failed due to network error.', false);
    }
  };

  // Login existing user using email + password
  const handleLogin = async () => {
    if (!email || !password) {
      showAlert('Please enter your email and password.', false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        showAlert(error.message || 'Login failed.', false);
        return;
      }

      const userId = data?.user?.id || null;
      const displayName = (data?.user?.user_metadata && data.user.user_metadata.username) || (data?.user?.email ? data.user.email.split('@')[0] : null) || 'User';
      const token = data?.session?.access_token;

      if (token) {
        localStorage.setItem('authToken', token);
        localStorage.setItem('username', displayName);
        localStorage.setItem('userId', userId);
        showAlert('Signed in successfully.', true);
        onLoginSuccess && onLoginSuccess(displayName, userId);
      } else {
        showAlert('Signed in, but no session token was returned.', true);
      }
    } catch (err) {
      console.error('Login error:', err);
      showAlert(err.message || 'Login failed due to network error.', false);
    }
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
