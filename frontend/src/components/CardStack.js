import React from 'react';

const EMOTIONS = [
  'Happy', 'Calm', 'Energized', 'Neutral', 'Anxious',
  'Sad', 'Frustrated', 'Overwhelmed', 'Angry', 'Tired'
];

function CardStack() {
  const rows = [EMOTIONS.slice(0, 5), EMOTIONS.slice(5)];
  return (
    <div className="card-stack-rows">
      {rows.map((row, rIdx) => (
        <div className="card-stack-row" key={rIdx}>
          {row.map((title, i) => {
            const index = rIdx * 5 + i + 1;
            return (
              <div className="card-stack-item" key={index}>
                <div className="card-vertical">
                  <span className="card-index">{String(index).padStart(2, '0')}</span>
                  <span className="card-name">{title}</span>
                </div>
                <div className="card-details">
                  <h3 className="card-details-title">{title}</h3>
                  <p className="card-details-text">Explore tools, tips and reflections tailored for this emotion. Hover to reveal more space.</p>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export default CardStack;
