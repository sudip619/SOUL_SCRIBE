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

const removeAllThemes = () => {
  document.body.classList.remove(
    'theme-bright',
    'theme-calm',
    'theme-muted',
    'theme-grounding',
    'theme-angry'
  );
};

const withSmoothTransition = (cb) => {
  document.body.classList.add('theme-smooth-transition');
  try { cb(); } finally {
    setTimeout(() => document.body.classList.remove('theme-smooth-transition'), 700);
  }
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(''); // Start with default landing palette

  const applyTheme = (mood) => {
    const newTheme = moodToTheme[mood] || '';
    withSmoothTransition(() => {
      removeAllThemes();
      if (newTheme) document.body.classList.add(newTheme);
      setTheme(newTheme);
    });
  };

  const resetTheme = () => {
    withSmoothTransition(() => {
      removeAllThemes();
      setTheme('');
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, applyTheme, resetTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
