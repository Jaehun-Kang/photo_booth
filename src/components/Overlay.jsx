import React from 'react';
import '../styles/Overlay.css';

function Overlay({ onStartCapture, countdown, showFlash }) {
  return (
    <div className="overlay-container">
      {countdown > 0 && <div className="overlay-countdown">{countdown}</div>}
      {showFlash && <div className="overlay-flash" />}
      {onStartCapture && countdown === null && (
        <button className="overlay-button" onClick={onStartCapture}>
          촬영 시작
        </button>
      )}
    </div>
  );
}

export default Overlay;
