// frontend/src/components/ProfileView.js
import React, { useState, useEffect } from 'react';
import { makeAuthenticatedRequest } from '../services/api';

function ProfileView({ username, showAlert }) {
  const [mainConcern, setMainConcern] = useState('');
  const [copingStrategies, setCopingStrategies] = useState([]);

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const response = await makeAuthenticatedRequest('/profile', 'GET');
        const data = await response.json();

        if (response.ok) {
          const profileData = data.profile_data || {};
          setMainConcern(profileData.main_concern || '');
          setCopingStrategies(profileData.coping_strategies || []);
        } else {
          showAlert(data.message || 'Failed to load profile.', false);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        showAlert('Network error or failed to load profile.', false);
      }
    };

    loadUserProfile();
  }, [showAlert]);

  const handleCopingStrategyChange = (e) => {
    const value = e.target.value;
    setCopingStrategies((prevStrategies) =>
      prevStrategies.includes(value)
        ? prevStrategies.filter((s) => s !== value)
        : [...prevStrategies, value]
    );
  };

  const handleSavePreferences = async (event) => {
    event.preventDefault();

    const preferencesToSave = {
      main_concern: mainConcern,
      coping_strategies: copingStrategies,
    };

    try {
      const response = await makeAuthenticatedRequest('/profile', 'POST', { profile_data: preferencesToSave });
      const data = await response.json();

      if (response.ok) {
        showAlert('Profile preferences saved successfully!', true);
      } else {
        showAlert(data.message || 'Failed to save profile preferences.', false);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      showAlert('Network error or failed to save profile.', false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 rounded-lg shadow-xl border border-border-color">
      <h2 className="text-3xl font-bold text-center text-accent-teal mb-8">Your Profile</h2>
      <p className="text-center text-xl font-semibold mb-6 text-dark-text-lighter">Welcome, {username}!</p>

      <h3 className="text-2xl font-semibold text-center text-dark-text-light mb-6">Your Preferences & Goals</h3>
      <form onSubmit={handleSavePreferences} className="flex flex-col gap-6">
        <div>
          <label htmlFor="main-concern" className="block text-dark-text-light text-lg font-medium mb-2">My primary concern is:</label>
          <select
            id="main-concern"
            name="main_concern"
            value={mainConcern}
            onChange={(e) => setMainConcern(e.target.value)}
            className="w-full p-3 bg-dark-bg-primary text-dark-text-light border border-dark-text-muted rounded-md
                       focus:outline-none focus:ring-2 focus:ring-accent-pink focus:border-accent-pink transition duration-300"
          >
            <option value="">Select...</option>
            <option value="stress">Stress</option>
            <option value="anxiety">Anxiety</option>
            <option value="motivation">Motivation</option>
            <option value="relationships">Relationships</option>
            <option value="sleep">Sleep</option>
            <option value="grief">Grief</option>
          </select>
        </div>

        <div>
          <label className="block text-dark-text-light text-lg font-medium mb-3">I prefer coping strategies like:</label>
          <div id="coping-strategies" className="space-y-3">
            
            {/* --- MODIFIED BLOCK FOR ANIMATED CHECKBOXES --- */}
            {[
              { value: 'mindfulness', label: 'Mindfulness' },
              { value: 'breathing', label: 'Breathing Exercises' },
              { value: 'journaling', label: 'Journaling Prompts' },
              { value: 'distraction', label: 'Distraction Techniques' },
            ].map((strategy) => (
              <div key={strategy.value} className="flex items-center">
                {/* The actual checkbox is now hidden, but still controls the state */}
                <input
                  type="checkbox"
                  id={strategy.value}
                  name="coping_strategies"
                  value={strategy.value}
                  checked={copingStrategies.includes(strategy.value)}
                  onChange={handleCopingStrategyChange}
                  className="absolute opacity-0 h-0 w-0" // Hides the default checkbox
                />
                {/* This label is the visible, clickable element */}
                <label htmlFor={strategy.value} className="flex items-center cursor-pointer">
                  <span className="animated-check">
                    <svg width="20px" height="20px" viewBox="0 0 18 18">
                      <path d="M1,9 L1,3.5 C1,2 2,1 3.5,1 L14.5,1 C16,1 17,2 17,3.5 L17,14.5 C17,16 16,17 14.5,17 L3.5,17 C2,17 1,16 1,14.5 L1,9 Z"></path>
                      <polyline points="1 9 7 14 15 4"></polyline>
                    </svg>
                  </span>
                  <span className="ml-3 text-dark-text-light text-base">{strategy.label}</span>
                </label>
              </div>
            ))}
            {/* --- END OF MODIFIED BLOCK --- */}

          </div>
        </div>

        <button
          type="submit"
          className="bg-accent-teal text-dark-text-lighter py-3 rounded-md font-semibold mt-6
                       hover:bg-accent-pink transition-all duration-300 ease-in-out
                       transform hover:scale-105 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-accent-pink"
        >
          Save Preferences
        </button>
      </form>
    </div>
  );
}

export default ProfileView;