import React from "react";
import "../styles/Overlay.css";

function Overlay({ onStartCapture, countdown, showFlash, captureProgress }) {
  return (
    <div className="overlay">
      {captureProgress !== null && (
        <div className="overlay--progress">{captureProgress}/4</div>
      )}
      {countdown > 0 && <div className="overlay--countdown">{countdown}</div>}
      {showFlash && <div className="overlay--flash" />}
      {captureProgress === null && (
        <button className="overlay--button" onClick={onStartCapture}>
          START
        </button>
      )}
    </div>
  );
}

export default Overlay;
