// src/context/ThemeContext.js
import React, { createContext, useState, useContext } from 'react';

const ThemeContext = createContext();

// Updated mapping based on our defined groups
const moodToTheme = {
  // Bright Theme
  'happy': 'theme-bright',
  'energized': 'theme-bright',
  // Calm Theme
  'calm': 'theme-calm',
  'neutral': 'theme-calm',
  // Muted Theme
  'sad': 'theme-muted',
  'tired': 'theme-muted',
  // Grounding Theme
  'anxious': 'theme-grounding',
  'frustrated': 'theme-grounding',
  'overwhelmed': 'theme-grounding',
  'angry': 'theme-angry',
  'annoyed': 'theme-angry',
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('theme-calm'); // Start with the calm theme

  const applyTheme = (mood) => {
    const newTheme = moodToTheme[mood] || 'theme-calm'; // Default to calm theme
    
    // Updated list to include all our theme classes
    document.body.classList.remove(
      'theme-bright',
      'theme-calm',
      'theme-muted',
      'theme-grounding',
      'theme-angry'
    );
    
    // Add the new theme class
    document.body.classList.add(newTheme);
    
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, applyTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
