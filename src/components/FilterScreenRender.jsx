import React, { useEffect, useState, useMemo, useCallback } from 'react';
import FilterScreen from './FilterScreen.jsx';
import { createScreenSketch } from '../filters/createScreenSketch.js';
import { filters } from '../filters';
import backIcon from '../assets/arrow_left.svg';
import '../styles/FilterScreenRender.css';

function FilterScreenRender({ filterIndex, onBack }) {
  const [video, setVideo] = useState(null);
  const [videoReady, setVideoReady] = useState(false);
  const [webcamError, setWebcamError] = useState(null);
  const [videoSize, setVideoSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const p5video = document.createElement('video');
    navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    }).then((stream) => {
      p5video.srcObject = stream;
      p5video.play();
      p5video.width = 64;
      p5video.height = 36;
      p5video.style.display = 'none';
      document.body.appendChild(p5video);

      const onLoadedMetadata = () => {
        setVideo(p5video);
        setVideoReady(true);
        p5video.removeEventListener('loadedmetadata', onLoadedMetadata);
      };

      if (p5video.readyState >= 2) {
        onLoadedMetadata();
      } else {
        p5video.addEventListener('loadedmetadata', onLoadedMetadata);
      }
    }).catch(err => {
      console.error('웹캠 접근 오류:', err);
      setWebcamError(err);
    });

    return () => {
      if (p5video && p5video.srcObject) {
        p5video.srcObject.getTracks().forEach(track => track.stop());
        p5video.remove();
      }
    };
  }, []);

  // video와 videoReady 상태가 바뀌면 메모이제이션된 sketchFactory 반환
  const getSketchFactory = useCallback(
    (filter) => (w, h, onReady) => {
      const scaleRatio = videoSize.width / videoSize.height;

      return createScreenSketch({ video, width: w, height: h, filter, onReady, scaleRatio, videoSize });
    },
    [video, videoReady, videoSize]
  );

  // video가 준비되면 모든 필터에 대한 sketchFactory 배열 생성
  const sketchFactories = useMemo(() => {
    if (!videoReady) return [];
    return filters.map(filter => getSketchFactory(filter));
  }, [videoReady, getSketchFactory]);

  // 선택한 필터 하나만 렌더링
  if (
    typeof filterIndex !== 'number' ||
    filterIndex < 0 ||
    filterIndex >= filters.length
  ) {
    return (
      <div style={{ padding: '1rem', textAlign: 'center' }}>
        <p>유효하지 않은 필터입니다.</p>
        <button onClick={onBack}>←</button>
      </div>
    );
  }

  if (!videoReady) {
    return <p>loading...</p>;
  }

  return (
    <div>
      <button className='btn_back' onClick={onBack}>
        <img className='btn_back--img' src={backIcon} alt="Back" />
      </button>
      <div className='cam_screen--section'>
        <div className='cam_screen--section--container'>
          <FilterScreen
            sketchFactory={sketchFactories[filterIndex]}
            video={video}
          />
        </div>
      </div>
    </div>
  );
}

export default FilterScreenRender;
