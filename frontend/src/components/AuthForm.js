import React, { useState } from 'react';

const API_BASE_URL = 'http://127.0.0.1:5000/api';

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

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      showAlert('Passwords do not match.', false);
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      if (response.ok) {
        showAlert('Registration successful! Please log in.', true);
        setIsRegistering(false);
      } else {
        showAlert(data.message || 'Registration failed.', false);
      }
    } catch (error) {
      showAlert('Network error during registration.', false);
    }
  };

  const handleLogin = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('username', data.username);
        localStorage.setItem('userId', data.user_id);
        onLoginSuccess(data.username, data.user_id);
      } else {
        showAlert(data.message || 'Login failed.', false);
      }
    } catch (error) {
      showAlert('Network error during login.', false);
    }
  };

  return (
    <div className="auth-page-container">
      
      {/* MODIFIED: Added fade-down animation with a 2500ms duration */}
      <div className="auth-form-container" data-aos="fade-down" data-aos-duration="1000">
        <p className="auth-title">{isRegistering ? 'Create an Account' : 'Welcome Back!'}</p>
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

      {/* MODIFIED: Added fade-down animation with a delay */}
      <div className="logo-card" data-aos="fade-down" data-aos-duration="2500" data-aos-anchor-placement="center-bottom">
        <div className="logo-card-inner">
          <img src="/images/logo.png" alt="SoulScribe Logo" className="w-full h-auto object-contain" />
        </div>
      </div>

    </div>
  );
}

export default AuthForm;