import React from 'react';
import FilterPreviewRender from './components/FilterPreviewRender.jsx';
import FilterScreenRender from './components/FilterScreenRender.jsx';
import { useCameraInfo } from './hooks/useCameraInfo.js';

function App() {
  const [selectedFilterIndex, setSelectedFilterIndex] = React.useState(null);
  const { videoSize, cameraReady, error } = useCameraInfo();

  if (!cameraReady) {
    return <div className="loading">카메라 해상도 확인 중...</div>;
  }

  if (error) {
    return <div className="error">카메라 접근 실패: {error.message}</div>;
  }

  return selectedFilterIndex === null ? (
    <FilterPreviewRender
      onSelectFilter={setSelectedFilterIndex}
      videoSize={videoSize}
    />
  ) : (
    <FilterScreenRender
      filterIndex={selectedFilterIndex}
      onBack={() => setSelectedFilterIndex(null)}
      videoSize={videoSize}
    />
  );
}

export default App;
