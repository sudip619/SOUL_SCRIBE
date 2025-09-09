import React from 'react';
import { supabase } from '../supabaseClient';
import { useTheme } from '../context/ThemeContext';

const EMOTIONS = [
  { name: 'happy', title: 'Happy', description: '<p1>Celebrate what went</p1> <p2>well and try brief gratitude prompts to extend the uplift.</p2>' },
  { name: 'calm', title: 'Calm', description: 'Deepen calm with breathing, grounding, and gentle presence practices.' },
  { name: 'energized', title: 'Energized', description: 'Use focused work sprints, movement breaks, or short tasks to harness momentum.' },
  { name: 'neutral', title: 'Neutral', description: 'Light check-ins, planning, or low-effort reflection are good uses of this state.' },
  { name: 'anxious', title: 'Anxious', description: 'Quick grounding exercises, labeling feelings, and small breathing practices can help.' },
  { name: 'sad', title: 'Sad', description: 'Comfort-focused actions like soothing music, gentle journaling, or small self-care may help.' },
  { name: 'frustrated', title: 'Frustrated', description: 'Short breaks, reframing prompts, and physical release (walk/stretch) can ease tension.' },
  { name: 'overwhelmed', title: 'Overwhelmed', description: 'Break tasks into tiny steps, prioritize essentials, and take micro-resets.' },
  { name: 'angry', title: 'Angry', description: 'Use safe outlets: stepping away, paced breathing, or expressive writing to process intensity.' },
  { name: 'tired', title: 'Tired', description: 'Rest-focused suggestions: naps, wind-down routines, and low-effort restorative activities.' }
];

function CardStack({ showAlert }) {
  const { applyTheme } = useTheme();

  const onCardClick = async (moodName) => {
    const name = moodName.toLowerCase();
    applyTheme(name);
    try {
      const { data, error } = await supabase.from('mood_logs').insert({ mood_name: name });
      if (error) throw error;
      if (showAlert) showAlert(`Your mood "${name}" has been logged!`, true);
    } catch (err) {
      if (showAlert) showAlert('Network error or server unavailable during mood logging.', false);
    }
  };

  return (
    <div className="card-stack-row">
      {EMOTIONS.map((emotion, i) => (
        <div
          key={i}
          className={`card-stack-item is-clickable ${emotion.name === 'angry' ? 'emotion-angry' : ''}`}
          role="button"
          tabIndex={0}
          aria-label={`Select mood ${emotion.title}`}
          onClick={() => onCardClick(emotion.name)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onCardClick(emotion.name); }}
        >
          <div className="card-vertical">
            <span className="card-name">{emotion.title}</span>
          </div>
          <div className="card-details">
            <h3 className="card-details-title">{emotion.title}</h3>
            <p className="card-details-text">{emotion.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default CardStack;
