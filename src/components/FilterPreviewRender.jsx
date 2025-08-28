import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import FilterPreview from './FilterPreview.jsx';
import logo from '../assets/logo_blue.svg';
import { createFilteredSketch } from '../filters/createFilteredSketch.js';
import { filters } from '../filters';
import '../styles/FilterPreviewRender.css';
import WebcamErrorHandler from './WebcamErrorHandler.jsx';
import CameraSelect from './CameraSelect.jsx';
import { getCameraCapabilities, getPreviewResolution } from '../utils/cameraUtils.js';

function FilterPreviewRender({ onSelectFilter, selectedDeviceId, onDeviceSelect, onVideoReady, onError }) {
  const [video, setVideo] = useState(null);
  const [videoReady, setVideoReady] = useState(false);
  const [webcamError, setWebcamError] = useState(null);
  const [videoSize, setVideoSize] = useState({ width: 0, height: 0 });
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const setupCamera = useCallback(async () => {
    // 이전 스트림 정리
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (!selectedDeviceId) return;

    try {
      setVideoReady(false);

      // 카메라 정보 가져오기 (캐시 사용)
      const cameraInfo = await getCameraCapabilities(selectedDeviceId);
      const previewResolution = getPreviewResolution(cameraInfo);
      
      console.log(`📹 프리뷰용 해상도 설정: ${previewResolution.width}x${previewResolution.height} (원본: ${cameraInfo.maxWidth}x${cameraInfo.maxHeight})`);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: { exact: selectedDeviceId },
          width: { ideal: previewResolution.width },
          height: { ideal: previewResolution.height },
        }
      });

      streamRef.current = stream;
      const videoElement = document.createElement('video');
      videoElement.srcObject = stream;
      videoElement.playsInline = true;

      // 비디오 로드 완료 대기
      await new Promise((resolve, reject) => {
        videoElement.onloadedmetadata = () => {
          videoElement.play()
            .then(resolve)
            .catch(reject);
        };
        videoElement.onerror = reject;
      });

      // 성공적으로 로드된 경우에만 상태 업데이트
      await videoElement.play();
      
      // 비디오 해상도 로깅
      console.log('Preview Video Resolution:', {
        width: videoElement.videoWidth,
        height: videoElement.videoHeight,
        actualWidth: videoElement.width,
        actualHeight: videoElement.height
      });

      setVideo(videoElement);
      setVideoSize({
        width: videoElement.videoWidth,
        height: videoElement.videoHeight,
      });
      setVideoReady(true);
      videoRef.current = videoElement;
      onVideoReady && onVideoReady();

    } catch (err) {
      console.error('카메라 설정 오류:', err);
      onError && onError(err);
      setWebcamError(err);
    }
  }, [selectedDeviceId, onVideoReady, onError]);

  useEffect(() => {
    setupCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [selectedDeviceId, setupCamera]);

  const getSketchFactory = useCallback(
    (filter) => (w, h) => {
      const scaleRatio = videoSize.width / videoSize.height;

      return createFilteredSketch({ 
        video, 
        width: w, 
        height: h, 
        filter, 
        scaleRatio, 
        videoSize
      });
    },
    [video, videoSize]
  );

  const sketchFactories = useMemo(() => {
    if (!videoReady) return [];
    return filters.map(filter => getSketchFactory(filter));
  }, [videoReady, getSketchFactory]);

  return (
    <div className="main">
      <WebcamErrorHandler error={webcamError} />
      <div className="header">
        <div className='logo'>
          <img className='logo--img' src={logo} alt="Logo" />
          <div className='logo--text'>마법연구회</div>
        </div>
        <CameraSelect 
          onDeviceSelect={onDeviceSelect}
          selectedDevice={selectedDeviceId}
        />
      </div>
      <div className="cam_grid--section">
        <div className="cam_grid--section--container">
          {videoReady &&
            sketchFactories.map((sketchFactory, index) => (
              <div className="cam_grid--section--container--filter" key={index}>
                <FilterPreview 
                  sketchFactory={sketchFactory} 
                  video={video}
                  onSelectFilter={() => onSelectFilter(index)}
                />
              </div>
            ))}
        </div>
      </div>
      <div className="footer">
        <p>원하는 필터를 선택해주세요!</p>
      </div>
    </div>
  );
}

export default FilterPreviewRender;
