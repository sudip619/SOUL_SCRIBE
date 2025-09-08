// src/components/LoadingScreen.js
import React from 'react';

function LoadingScreen() {
  return (
    <div className="loading-screen" role="status" aria-live="polite">
      {/* Top progress bar */}
      <div className="loading-topbar">
        <div className="loading-topbar-fill" />
      </div>

      {/* Center badge with circular progress + play mark (AROCK-inspired) */}
      <div className="loading-badge">
        <svg className="loading-ring" viewBox="0 0 42 42" aria-hidden="true">
          <circle className="ring-trail" cx="21" cy="21" r="19.5" />
          <circle className="ring-progress" cx="21" cy="21" r="19.5" />
          <polygon className="ring-play" points="17,14.937 27.5,21 17,27.063" />
        </svg>
      </div>

      {/* SOULSCRIBE outline text draw */}
      <svg viewBox="0 0 400 100" className="loading-svg" aria-label="SoulScribe loading">
        <defs>
          <linearGradient id="soulscribe-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" className="gradient-start" />
            <stop offset="100%" className="gradient-end" />
          </linearGradient>
        </defs>
        <text className="loading-text" x="50%" y="50%" dy=".35em" textAnchor="middle">SOULSCRIBE</text>
      </svg>
    </div>
  );
}

export default LoadingScreen;
