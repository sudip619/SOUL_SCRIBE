import React from 'react';

const EMOTIONS = [
  'Happy', 'Calm', 'Energized', 'Neutral', 'Anxious',
  'Sad', 'Frustrated', 'Overwhelmed', 'Angry', 'Tired'
];

function CardStack() {
  return (
    <div className="card-stack-row">
      {EMOTIONS.map((title, i) => (
        <div className={`card-stack-item ${title === 'Angry' ? 'emotion-angry' : ''}`} key={i}>
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
