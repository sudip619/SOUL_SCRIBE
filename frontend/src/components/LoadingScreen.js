// src/components/LoadingScreen.js
import React, { useEffect, useState } from 'react';

function LoadingScreen({ onContinue }) {
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowButton(true), 1000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="loading-screen" aria-live="polite">
      {/* SOULSCRIBE Text Animation */}
      <svg viewBox="0 0 400 100" className="loading-svg">
        <defs>
          <linearGradient id="soulscribe-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" className="gradient-start" />
            <stop offset="100%" className="gradient-end" />
          </linearGradient>
        </defs>
        <text
          className="loading-text"
          x="50%"
          y="50%"
          dy=".35em"
          textAnchor="middle"
        >
          SOULSCRIBE
        </text>
      </svg>

      {/* NEW: Pulsing Ring Loader Animation */}
      <svg className="pl" viewBox="0 0 240 240" aria-hidden>
        <circle className="pl__ring pl__ring--a" cx="120" cy="120" r="105" transform="rotate(-90,120,120)"></circle>
        <circle className="pl__ring pl__ring--b" cx="120" cy="120" r="35" transform="rotate(-90,120,120)"></circle>
        <circle className="pl__ring pl__ring--c" cx="85" cy="120" r="70" transform="rotate(-90,120,120)"></circle>
        <circle className="pl__ring pl__ring--d" cx="155" cy="120" r="70" transform="rotate(-90,120,120)"></circle>
      </svg>

      {showButton && (
        <div style={{ marginTop: '1rem' }}>
          <button className="c-button c-button--gooey" onClick={() => onContinue && onContinue()}>
            Get Started
            <div className="c-button__blobs"><div></div><div></div><div></div></div>
          </button>
        </div>
      )}
    </div>
  );
}

export default LoadingScreen;
