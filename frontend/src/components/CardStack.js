import React from 'react';
import { makeAuthenticatedRequest } from '../services/api';
import { useTheme } from '../context/ThemeContext';

const EMOTIONS = [
  'Happy', 'Calm', 'Energized', 'Neutral', 'Anxious',
  'Sad', 'Frustrated', 'Overwhelmed', 'Angry', 'Tired'
];

function CardStack({ showAlert }) {
  const { applyTheme } = useTheme();

  const onCardClick = async (title) => {
    const moodName = title.toLowerCase();
    applyTheme(moodName);
    try {
      const response = await makeAuthenticatedRequest('/mood', 'POST', { mood: moodName });
      const data = await response.json();
      if (response.ok) {
        if (showAlert) showAlert(data.message || `Your mood "${moodName}" has been logged!`, true);
      } else {
        if (showAlert) showAlert(data.message || 'Failed to log mood. Please try again.', false);
      }
    } catch (err) {
      if (showAlert) showAlert('Network error or server unavailable during mood logging.', false);
    }
  };

  return (
    <div className="card-stack-row">
      {EMOTIONS.map((title, i) => (
        <div
          key={i}
          className={`card-stack-item is-clickable ${title === 'Angry' ? 'emotion-angry' : ''}`}
          role="button"
          tabIndex={0}
          aria-label={`Select mood ${title}`}
          onClick={() => onCardClick(title)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onCardClick(title); }}
        >
          <div className="card-vertical">
            <span className="card-index">{String(i + 1).padStart(2, '0')}</span>
            <span className="card-name">{title}</span>
          </div>
          <div className="card-details">
            <h3 className="card-details-title">{title}</h3>
            <p className="card-details-text">Explore tools, tips and reflections tailored for this emotion. Hover to reveal more space.</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default CardStack;
