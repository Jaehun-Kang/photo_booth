import React, { useState, useEffect } from "react";
import FilterPreviewRender from "./components/FilterPreviewRender";
import FilterScreenRender from "./components/FilterScreenRender";
import WebcamErrorHandler from "./components/WebcamErrorHandler";
import ImageViewer from "./components/ImageViewer";
import "./styles/App.css";

function App() {
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [webcamError, setWebcamError] = useState(null);
  const [devicePixelRatio, setDevicePixelRatio] = useState(
    window.devicePixelRatio || 1
  );

  // URL에서 view 모드 확인
  const urlParams = new URLSearchParams(window.location.search);
  const isViewMode = urlParams.get("view") === "image";

  // DPR 변화 감지 (디바이스 툴바 토글 시)
  useEffect(() => {
    const handleDPRChange = () => {
      const newDPR = window.devicePixelRatio || 1;
      console.log("DPR changed:", devicePixelRatio, "->", newDPR);
      setDevicePixelRatio(newDPR);
    };

    // DPR 변화 감지를 위한 MediaQuery 사용
    const mediaQuery = window.matchMedia(
      `(resolution: ${window.devicePixelRatio}dppx)`
    );
    mediaQuery.addEventListener("change", handleDPRChange);

    return () => {
      mediaQuery.removeEventListener("change", handleDPRChange);
    };
  }, [devicePixelRatio]);

  const handleDeviceSelect = (deviceId) => {
    console.log("Device selected:", deviceId);
    setSelectedDeviceId(deviceId);
    setIsVideoReady(false);
    setWebcamError(null);
  };

  const handleWebcamError = (error) => {
    console.error("Webcam error:", error);
    setWebcamError(error);
  };

  if (webcamError) {
    return <WebcamErrorHandler error={webcamError} />;
  }

  // 이미지 뷰어 모드인 경우
  if (isViewMode) {
    return <ImageViewer />;
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
          onHome={() => setSelectedFilter(null)} // 홈 버튼용 동일한 동작
          selectedDeviceId={selectedDeviceId}
          onError={handleWebcamError}
        />
      )}
    </div>
  );
}

export default App;
