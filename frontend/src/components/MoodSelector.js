// frontend/src/components/MoodSelector.js
import React from 'react';
import { makeAuthenticatedRequest } from '../services/api';
import { useTheme } from '../context/ThemeContext'; // 1. IMPORT THE THEME HOOK

function MoodSelector({ showAlert }) {
  const { applyTheme } = useTheme(); // 2. GET THE applyTheme FUNCTION

  const moods = [
    { name: 'happy', icon: 'images/mood_icons/happy.png', title: 'Happy / Content' },
    { name: 'calm', icon: 'images/mood_icons/calm.png', title: 'Calm / Peaceful' },
    { name: 'energized', icon: 'images/mood_icons/energized.png', title: 'Energized / Motivated' },
    { name: 'neutral', icon: 'images/mood_icons/neutral.png', title: 'Neutral / Okay' },
    { name: 'anxious', icon: 'images/mood_icons/anxious.png', title: 'Anxious / Worried' },
    { name: 'sad', icon: 'images/mood_icons/sad.png', title: 'Sad / Down' },
    { name: 'frustrated', icon: 'images/mood_icons/frustrated.png', title: 'Frustrated / Irritated' },
    { name: 'overwhelmed', icon: 'images/mood_icons/overwhelmed.png', title: 'Overwhelmed / Stressed' },
    { name: 'angry', icon: 'images/mood_icons/angry.png', title: 'Angry / Annoyed' },
    { name: 'tired', icon: 'images/mood_icons/tired.png', title: 'Tired / Exhausted' },
  ];

  const logSelectedMood = async (moodName, event) => {
    // 3. CALL applyTheme TO CHANGE THE UI INSTANTLY
    applyTheme(moodName);

    console.log('Selected mood:', moodName);
    try {
      const response = await makeAuthenticatedRequest('/mood', 'POST', { mood: moodName });
      const data = await response.json();

      if (response.ok) {
        showAlert(data.message || `Your mood "${moodName}" has been logged!`, true);
        const clickedButton = event.target.closest('button'); // Ensure we target the button itself
        if (clickedButton) {
          clickedButton.classList.add('scale-110', 'shadow-2xl');
          setTimeout(() => {
            clickedButton.classList.remove('scale-110', 'shadow-2xl');
          }, 500);
        }
      } else {
        showAlert(data.message || 'Failed to log mood. Please try again.', false);
      }
    } catch (error) {
      console.error('Error logging mood:', error);
      showAlert('Network error or server unavailable during mood logging.', false);
    }
  };

  return (
    <div className="flex flex-wrap justify-center gap-x-2 gap-y-1 px-1 py-0.5 w-full">
      {moods.map((mood) => (
        // In MoodSelector.js

      <button
        key={mood.name}
        onClick={(e) => logSelectedMood(mood.name, e)}
        // MODIFIED: Added transform and hover classes for the "pop" effect
        className="group relative flex flex-col items-center justify-center p-1.5 rounded-md
                   bg-dark-bg-secondary text-dark-text-lighter hover:bg-accent-teal hover:text-white
                   shadow-sm hover:shadow-md focus:outline-none focus:ring-1 focus:ring-accent-pink
                   transform transition-all duration-300 ease-out hover:scale-110 hover:-translate-y-2 hover:shadow-2xl" // <-- ADDED THESE
        title={mood.title}
      >
        <img
          src={mood.icon}
          alt={mood.name}
          className="w-8 h-8 object-contain pointer-events-none"
        />
      </button>
      ))}
    </div>  
  );
}

export default MoodSelector;