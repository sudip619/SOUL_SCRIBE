// frontend/src/components/MoodSelector.js
import React from 'react';
import { supabase } from '../supabaseClient';
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

// In MoodSelector.js
  const logSelectedMood = async (moodName, event) => {
    applyTheme(moodName); // This is your theme-switching logic, it stays.
    try {
      // 1. Insert a new row into the 'mood_logs' table.
      const { error } = await supabase
        .from('mood_logs')
        .insert({ mood_name: moodName }); 
      
      // NOTE: We don't need to provide user_id!
      // The database is configured to automatically use the logged-in user's ID
      // as the default value for the user_id column.

      if (error) throw error;
      
      showAlert(`Your mood "${moodName}" has been logged!`, true);

      // Your UI animation logic can stay exactly the same.
      const clickedButton = event.target.closest('button');
      if (clickedButton) {
        clickedButton.classList.add('scale-110', 'shadow-2xl');
        setTimeout(() => {
          clickedButton.classList.remove('scale-110', 'shadow-2xl');
        }, 500);
      }

    } catch (error) {
      showAlert('Error logging mood: ' + error.message, false);
    }
  };

  return (
    <div className="mood-row w-full">
      {moods.map((mood) => (
        <button
          key={mood.name}
          onClick={(e) => logSelectedMood(mood.name, e)}
          className="mood-chip"
          title={mood.title}
        >
          <img src={mood.icon} alt={mood.name} className="object-contain" />
          <span className="label capitalize hidden sm:inline">{mood.name}</span>
        </button>
      ))}
    </div>
  );
}

export default MoodSelector;
