import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import html2canvas from 'html2canvas';
import FilterScreen from './FilterScreen.jsx';
import Overlay from './Overlay.jsx';
import logo from '../assets/logo.svg';
import { createScreenSketch } from '../filters/createScreenSketch.js';
import { filters } from '../filters';
import backIcon from '../assets/arrow_left.svg';
import '../styles/FilterScreenRender.css';

function FilterScreenRender({ filterIndex, onBack }) {
  const [video, setVideo] = useState(null);
  const [videoReady, setVideoReady] = useState(false);
  const [webcamError, setWebcamError] = useState(null);
  const [videoSize, setVideoSize] = useState({ width: 0, height: 0 });
  const [countdown, setCountdown] = useState(null);
  const [showFlash, setShowFlash] = useState(false);
  const [captureProgress, setCaptureProgress] = useState(null);
  const [capturedImages, setCapturedImages] = useState([]);
  const [showResult, setShowResult] = useState(false);


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

  // 필터 오류 시 반환
  if (
    typeof filterIndex !== 'number' ||
    filterIndex < 0 || filterIndex >= filters.length
  ) {
    return (
      <div style={{ padding: '1rem', textAlign: 'center' }}>
        <p>유효하지 않은 필터입니다.</p>
        <button className='btn_back' onClick={onBack}>
          <img className='btn_back--img' src={backIcon} alt="Back" />
        </button>
      </div>
    );
  }

  if (!videoReady) {
    return <p>loading...</p>;
  }

  // 촬영 n번 반복
  const handleCaptureStart = async () => {
    setCapturedImages([]);

    setCaptureProgress(0);
    for (let i = 0; i < 4; i++) {
      await runSingleCapture();
      setCaptureProgress(i + 1);
    }
    setCaptureProgress(null);
    setShowResult(true);
  };

  // 촬영 함수
  function runSingleCapture() {
    return new Promise((resolve) => {
      let count = 10;
      setCountdown(count);

      const interval = setInterval(() => {
        count--;
        if (count >= 1) {
          setCountdown(count);
        } else {
          clearInterval(interval);
          setCountdown(null);
          setShowFlash(true);
          setTimeout(() => {
            setShowFlash(false);
            
            // 개별 이미지 저장 로직
            const canvas = document.querySelector('canvas');
            if (canvas) {
              const imageData = canvas.toDataURL('image/png');
              setCapturedImages((prev) => [...prev, imageData]);
            }

            resolve();
          }, 200);
        }
      }, 1000);
    });
  }

  function CaptureResult({ images, onBack }) {
    const resultRef = useRef();

    const handleSave = async () => {
      if (!resultRef.current) return;

      const canvas = await html2canvas(resultRef.current, {
        scale: window.devicePixelRatio,
        useCORS: true,
      });

      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = 'photo_result.png';
      link.click();
    };

    return (
      <div className='result'>
        <div className='result-container' onClick={handleSave} title='Save'>
            <div className="result-frame">
              {images.map((src, idx) => (
                <img key={idx} src={src} alt={`촬영 ${idx + 1}`} />
              ))}
            </div>
            <div className='result-logo'>
              <img className='result-logo-svg' src={logo} alt="" />
              <div className='result-logo-text'>마법연구회</div>
            </div>
        </div>
        <div className='forSave' ref={resultRef}>
          <div className='result-container'>
              <div className="result-frame">
                {images.map((src, idx) => (
                  <img key={idx} src={src} alt={`촬영 ${idx + 1}`} />
                ))}
              </div>
              <div className='result-logo'>
              <img className='result-logo-svg' src={logo} alt="" />
              <div className='result-logo-text'>마법연구회</div>
            </div>
          </div>
          <div className='result-container'>
              <div className="result-frame">
                {images.map((src, idx) => (
                  <img key={idx} src={src} alt={`촬영 ${idx + 1}`} />
                ))}
              </div>
              <div className='result-logo'>
                <img className='result-logo-svg' src={logo} alt="" />
                <div className='result-logo-text'>마법연구회</div>
              </div>
          </div>
        </div>
        <button className='btn_back' onClick={onBack}>
          <img className='btn_back--img' src={backIcon} alt="Back" />
        </button>
      </div>
    );
  }


  return showResult ? (
    <CaptureResult
      images={capturedImages}
      onBack={() => {
        setShowResult(false);
        setCapturedImages([]);
      }}
    />
  ) : (
    <div>
      {captureProgress === null && (
        <button className='btn_back' onClick={onBack}>
          <img className='btn_back--img' src={backIcon} alt="Back" />
        </button>
      )}
      <div className='cam_screen--section'>
        <div className='cam_screen--section--container'>
          <FilterScreen
            sketchFactory={sketchFactories[filterIndex]}
            video={video}
          />
        </div>
      </div>
      <Overlay
        onStartCapture={handleCaptureStart}
        countdown={countdown}
        showFlash={showFlash}
        captureProgress={captureProgress}
      />
    </div>
  );
}

export default FilterScreenRender;
