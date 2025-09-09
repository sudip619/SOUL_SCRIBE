// frontend/src/components/ProfileView.js
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient'; // Correct: Supabase client is imported

// Small accessible dropdown that uses sidebar-like styling for options
// This component does not need any changes.
function Dropdown({ id, value, onChange, options = [] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onDocClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const selected = options.find((o) => o.value === value) || options[0] || { label: '' };

  return (
    <div className="profile-dropdown" ref={ref}>
      <div
        id={id}
        role="button"
        tabIndex={0}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((s) => !s)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen((s) => !s); } if (e.key === 'Escape') setOpen(false); }}
        className={`sidebar-item ${open ? 'is-active' : ''}`}
        style={{ width: '100%' }}
      >
        <span className="sidebar-label" style={{ opacity: 1, transform: 'translateX(0)' }}>{selected.label}</span>
      </div>

      {open && (
        <div className="profile-dropdown-menu" role="listbox" aria-label="Main concern options">
          {options.map((opt) => (
            <button
              type="button"
              key={opt.value || '__empty'}
              role="option"
              aria-selected={String(opt.value) === String(value)}
              className="sidebar-item"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              style={{ width: '100%', textAlign: 'left' }}
            >
              <span className="sidebar-label" style={{ opacity: 1, transform: 'translateX(0)' }}>{opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ProfileView({ username, showAlert }) {
  const [mainConcern, setMainConcern] = useState('');
  const [copingStrategies, setCopingStrategies] = useState([]);

  useEffect(() => {
    // This function is now correctly using Supabase
    const loadUserProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("No user logged in");

        const { data, error } = await supabase
          .from('profiles')
          .select(`username, profile_data`)
          .eq('id', user.id)
          .single();

        if (error) throw error;
        
        if (data && data.profile_data) {
          setMainConcern(data.profile_data.main_concern || '');
          setCopingStrategies(data.profile_data.coping_strategies || []);
        }
      } catch (error) {
        showAlert('Error loading profile: ' + error.message, false);
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

  // --- THIS IS THE UPDATED FUNCTION ---
  // Replaced the old `makeAuthenticatedRequest` with a direct Supabase call.
  const handleSavePreferences = async (event) => {
    event.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user logged in");
      
      const updates = {
        id: user.id, // The primary key to identify the row to update
        profile_data: {
          main_concern: mainConcern,
          coping_strategies: copingStrategies,
        },
        // Supabase can automatically update a 'updated_at' column
        // if you have one configured in your table policies.
      };

      // Upsert will create the row if it doesn't exist, or update it if it does.
      const { error } = await supabase.from('profiles').upsert(updates);

      if (error) throw error; // If Supabase returns an error, show it

      showAlert('Profile saved successfully!', true);
    } catch (error) {
      showAlert('Error saving profile: ' + error.message, false);
    }
  };

  return (
    <div className="container-wide glass-panel p-8">
      <h2 className="text-3xl font-bold text-center text-accent-teal mb-8">Your Profile</h2>
      <p className="text-center text-xl font-semibold mb-6 text-dark-text-lighter">Welcome, {username}!</p>

      <h3 className="text-2xl font-semibold text-center text-dark-text-light mb-6">Your Preferences & Goals</h3>
      <form onSubmit={handleSavePreferences} className="flex flex-col gap-6">
        <div>
          <label className="block text-dark-text-light text-lg font-medium mb-2">My primary concern is:</label>
          <Dropdown
            id="main-concern"
            value={mainConcern}
            onChange={(val) => setMainConcern(val)}
            options={[
              { value: '', label: 'Select...' },
              { value: 'stress', label: 'Stress' },
              { value: 'anxiety', label: 'Anxiety' },
              { value: 'motivation', label: 'Motivation' },
              { value: 'relationships', label: 'Relationships' },
              { value: 'sleep', label: 'Sleep' },
              { value: 'grief', label: 'Grief' },
            ]}
          />
        </div>

        <div>
          <label className="block text-dark-text-light text-lg font-medium mb-3">I prefer coping strategies like:</label>
          <div id="coping-strategies" className="space-y-3">
            {[
              { value: 'mindfulness', label: 'Mindfulness' },
              { value: 'breathing', label: 'Breathing Exercises' },
              { value: 'journaling', label: 'Journaling Prompts' },
              { value: 'distraction', label: 'Distraction Techniques' },
            ].map((strategy) => (
              <div key={strategy.value} className="flex items-center">
                <input
                  type="checkbox"
                  id={strategy.value}
                  name="coping_strategies"
                  value={strategy.value}
                  checked={copingStrategies.includes(strategy.value)}
                  onChange={handleCopingStrategyChange}
                  className="absolute opacity-0 h-0 w-0"
                />
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
          </div>
        </div>

        <button
          type="submit"
          className="send-fly-button mt-6 save-preferences-button"
        >
          <span>Save Preferences</span>
        </button>
      </form>
    </div>
  );
}

export default ProfileView;