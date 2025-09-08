// src/components/LoadingScreen.js
import React, { useEffect, useState } from 'react';
import AOS from 'aos';

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
        <div data-aos="fade-up" data-aos-anchor-placement="bottom-bottom" className="mt-8 w-full flex justify-center">
          <div className="relative group">
            <button
              onClick={() => onContinue && onContinue()}
              className="relative inline-block p-px font-semibold leading-6 text-white bg-gray-800 shadow-2xl cursor-pointer rounded-xl shadow-zinc-900 transition-transform duration-300 ease-in-out hover:scale-105 active:scale-95"
            >
              <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-teal-400 via-blue-500 to-purple-500 p-[2px] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <span className="relative z-10 block px-6 py-3 rounded-xl bg-gray-950">
                <div className="relative z-10 flex items-center space-x-2">
                  <span className="transition-all duration-500 group-hover:translate-x-1 text-sm tracking-wide">GET STARTED</span>
                  <svg
                    className="w-6 h-6 transition-transform duration-500 group-hover:translate-x-1"
                    data-slot="icon"
                    aria-hidden="true"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      clipRule="evenodd"
                      d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z"
                      fillRule="evenodd"
                    />
                  </svg>
                </div>
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default LoadingScreen;
