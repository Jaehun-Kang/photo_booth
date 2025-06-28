import React, { useEffect, useState } from 'react';
import FilterPreviewRender from './components/FilterPreviewRender.jsx';
import FilterScreenRender from './components/FilterScreenRender.jsx';

function App() {
  const [selectedFilterIndex, setSelectedFilterIndex] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);

  useEffect(() => {
    async function logCameraResolution() {
      try {
        let stream = await navigator.mediaDevices.getUserMedia({ video: true });
        let videoTrack = stream.getVideoTracks()[0];
        let capabilities = videoTrack.getCapabilities();

        console.log('Camera capabilities:', capabilities);

        if (capabilities.width && capabilities.height) {
          stream.getTracks().forEach(t => t.stop());
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: capabilities.width.max },
              height: { ideal: capabilities.height.max }
            }
          });
        }

        const video = document.createElement('video');
        video.srcObject = stream;

        await new Promise((resolve) => {
          video.onloadedmetadata = () => resolve();
          video.play();
        });

        console.log('Camera resolution:', video.videoWidth, 'x', video.videoHeight);

        stream.getTracks().forEach(track => track.stop());

        setCameraReady(true);
      } catch (err) {
        console.error('Failed to get camera resolution:', err);
        setCameraReady(true);
      }
    }

    logCameraResolution();
  }, []);


  if (!cameraReady) {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          color: '#888',
        }}
      >
        카메라 해상도 확인 중...
      </div>
    );
  }

  const handleSelectFilter = (index) => setSelectedFilterIndex(index);
  const handleBack = () => setSelectedFilterIndex(null);

  return selectedFilterIndex === null ? (
    <FilterPreviewRender onSelectFilter={handleSelectFilter} />
  ) : (
    <FilterScreenRender filterIndex={selectedFilterIndex} onBack={handleBack} />
  );
}

export default App;
