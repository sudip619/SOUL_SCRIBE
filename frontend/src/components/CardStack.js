import React from 'react';

const CARD_TITLES = [
  'First card','Second card','Third card','Fourth card','Fifth card',
  'Sixth card','Seventh card','Eighth card','Ninth card','Tenth card'
];

function CardStack() {
  return (
    <div className="card-stack-row">
      {CARD_TITLES.map((title, i) => (
        <div className="card-stack-item" key={i}>
          <div className="card-vertical">
            <span className="card-index">{String(i + 1).padStart(2, '0')}</span>
            <span className="card-name">{title}</span>
          </div>
          <div className="card-details">
            <h3 className="card-details-title">{title}</h3>
            <p className="card-details-text">This area expands to reveal more space for content. Use this space to highlight features, prompts, or quick tips.</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default CardStack;
