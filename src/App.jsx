import React, { useState } from 'react';
import FilterPreviewRender from './components/FilterPreviewRender';
import FilterScreenRender from './components/FilterScreenRender';
import WebcamErrorHandler from './components/WebcamErrorHandler';
import './styles/App.css';

function App() {
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [webcamError, setWebcamError] = useState(null);

  const handleDeviceSelect = (deviceId) => {
    console.log('Device selected:', deviceId);
    setSelectedDeviceId(deviceId);
    setIsVideoReady(false);
    setWebcamError(null);
  };

  const handleWebcamError = (error) => {
    console.error('Webcam error:', error);
    setWebcamError(error);
  };

  if (webcamError) {
    return <WebcamErrorHandler error={webcamError} />;
  }

  return (
    <div className="App">
      {selectedFilter === null ? (
        <FilterPreviewRender
          onSelectFilter={setSelectedFilter}
          selectedDeviceId={selectedDeviceId}
          onDeviceSelect={handleDeviceSelect}
          onVideoReady={() => setIsVideoReady(true)}
          onError={handleWebcamError}
        />
      ) : (
        <FilterScreenRender
          filterIndex={selectedFilter}
          onBack={() => setSelectedFilter(null)}
          selectedDeviceId={selectedDeviceId}
          onError={handleWebcamError}
        />
      )}
    </div>
  );
}

export default App;
