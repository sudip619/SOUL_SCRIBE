// src/components/AnimationOverlay.js
import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

function AnimationOverlay({ animationUrl, onAnimationComplete }) {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-500"
      style={{ pointerEvents: 'none' }} // Makes the overlay non-interactive
    >
      <div className="w-1/2 max-w-sm">
        <DotLottieReact
          src={animationUrl}
          loop={false} // We want it to play once
          autoplay
          onComplete={onAnimationComplete} // This function will be called when the animation finishes
        />
      </div>
    </div>
  );
}

export default AnimationOverlay;