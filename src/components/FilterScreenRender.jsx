import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import html2canvas from 'html2canvas';
import FilterScreen from './FilterScreen.jsx';
import Overlay from './Overlay.jsx';
import { createScreenSketch } from '../filters/createScreenSketch.js';
import { filters } from '../filters';
import backIcon from '../assets/arrow_left.svg';
import '../styles/FilterScreenRender.css';

function FilterScreenRender({ filterIndex, onBack, selectedDeviceId, onError }) {
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
    const setupCamera = async () => {
      try {
        const p5video = document.createElement('video');
        navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        }).then((stream) => {
          p5video.srcObject = stream;
          p5video.play();

          const onLoadedMetadata = () => {
            console.log('Video size:', p5video.videoWidth, p5video.videoHeight);
            setVideo(p5video);
            setVideoSize({  // videoSize 상태 설정 추가
              width: p5video.videoWidth,
              height: p5video.videoHeight,
            });
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
          }
        };
      } catch (err) {
        console.error('카메라 설정 오류:', err);
        onError && onError(err);
      }
    };

    setupCamera();
  }, [selectedDeviceId, onError]);

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

      await Promise.all(
        Array.from(resultRef.current.querySelectorAll('img')).map(img => {
          if (img.complete) return Promise.resolve();
          return new Promise(res => { img.onload = res; img.onerror = res; });
        })
      );

      const originalScale = resultRef.current.style.scale;
      resultRef.current.style.scale = '1';

      const canvas = await html2canvas(resultRef.current, {
        scale: window.devicePixelRatio * 2,
        useCORS: true,
      });

      resultRef.current.style.scale = originalScale;

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
            <InlineLogoSVG className='result-logo-svg' />
            <div className='result-logo-text'>
              마법연구회
              <div className='result-logo-text-date'>
                {`${new Date().getFullYear()}.${String(new Date().getMonth() + 1).padStart(2,'0')}.${String(new Date().getDate()).padStart(2,'0')}`}
              </div>
            </div>
          </div>
        </div>
        {/* 저장용 : 위 result-container 2개 넣어야함 */}
        <div className='forSave' ref={resultRef}>
          <div className='result-container'>
            <div className="result-frame">
              {images.map((src, idx) => (
                <img key={idx} src={src} alt={`촬영 ${idx + 1}`} />
              ))}
            </div>
            <div className='result-logo'>
              <InlineLogoSVG className='result-logo-svg' />
              <div className='result-logo-text'>
                마법연구회
                <div className='result-logo-text-date'>
                  {`${new Date().getFullYear()}.${String(new Date().getMonth() + 1).padStart(2,'0')}.${String(new Date().getDate()).padStart(2,'0')}`}
                </div>
              </div>
            </div>
          </div>
          <div className='result-container'>
            <div className="result-frame">
              {images.map((src, idx) => (
                <img key={idx} src={src} alt={`촬영 ${idx + 1}`} />
              ))}
            </div>
            <div className='result-logo'>
              <InlineLogoSVG className='result-logo-svg' />
              <div className='result-logo-text'>
                마법연구회
                <div className='result-logo-text-date'>
                  {`${new Date().getFullYear()}.${String(new Date().getMonth() + 1).padStart(2,'0')}.${String(new Date().getDate()).padStart(2,'0')}`}
                </div>
              </div>
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

function InlineLogoSVG(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" {...props}>
      <g id="logo1">
        {/* 십자형 두 패스를 정확히 하나로 합침 */}
        <path
          fill="rgb(0.21, 50.42, 225.59)"
          d="
            M500,927c0-477-5-495-113-495,108,0,113,0,113-360
            M500,927c0-477,5-495,113-495-108,0-113,0-113-360
          "
        />
        <path fill="rgb(0.21, 50.42, 225.59)" d="M178.72,549,19,434A2.5,2.5,0,0,1,19,430L178.72,315c-39.34,35.29-61.42,75-61.42,117S139.38,513.71,178.72,549Z"/>
        <path fill="rgb(0.21, 50.42, 225.59)" d="M820.28,549,980,434a2.5,2.5,0,0,0,0-4.06L820.28,315c39.34,35.29,61.42,75,61.42,117S859.62,513.71,820.28,549Z"/>
      </g>
    </svg>
  );
}

export default FilterScreenRender;
