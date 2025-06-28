import React, { useRef, useEffect, useState } from 'react';
import p5 from 'p5';

const FilterScreen = ({ sketchFactory, video }) => {
  const containerRef = useRef(null);
  const p5InstanceRef = useRef(null);
  const creatingInstanceRef = useRef(false);
  const removePendingRef = useRef(false);
  const [size, setSize] = useState(null);
  const [ready, setReady] = useState(false);

  // 비디오 비율에 맞춰 캔버스 크기 계산
  useEffect(() => {
    if (!video || !containerRef.current) return;

    const containerHeight = containerRef.current.clientHeight;
    const containerWidth = containerRef.current.clientWidth;

    if (video.videoWidth && video.videoHeight) {
      const videoAspect = video.videoWidth / video.videoHeight;
      const canvasHeight = containerHeight;
      const canvasWidth = canvasHeight * videoAspect;

      // 만약 계산된 width가 container보다 넓으면, width 기준으로 재계산
      if (canvasWidth > containerWidth) {
        const canvasWidthAlt = containerWidth;
        const canvasHeightAlt = canvasWidthAlt / videoAspect;
        setSize({ width: canvasWidthAlt, height: canvasHeightAlt });
      } else {
        setSize({ width: canvasWidth, height: canvasHeight });
      }
    }
  }, [video]);

  // ResizeObserver로 container 크기 감지 및 size 업데이트 (디바운스)
  useEffect(() => {
    if (!containerRef.current) return;

    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (!video) return;
        const height = containerRef.current.clientHeight; // 👈 height 기준
        const ratio = video.videoWidth / video.videoHeight;
        const width = height * ratio;

        setSize(prev =>
          prev &&
          Math.abs(prev.width - width) < 2 &&
          Math.abs(prev.height - height) < 2
            ? prev
            : { width, height }
        );
      }, 150);
    };

    const observer = new ResizeObserver(handleResize);
    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      clearTimeout(resizeTimeout);
    };
  }, [video]);

  // p5 인스턴스 생성/제거 안전하게 관리
  useEffect(() => {
    if (!containerRef.current || !size) return;
    if (creatingInstanceRef.current || removePendingRef.current) return;

    creatingInstanceRef.current = true;
    setReady(false);

    // 기존 캔버스 제거
    const removeCanvas = () => {
      if (p5InstanceRef.current) {
        p5InstanceRef.current.remove();
        p5InstanceRef.current = null;
      }
      if (!containerRef.current) return;
      // container 내부 canvas 제거
      const canvases = containerRef.current.querySelectorAll('canvas');
      canvases.forEach(c => c.remove());
    };

    const createInstance = () => {
      if (!containerRef.current) return;

      const sketch = sketchFactory(size.width, size.height, () => setReady(true));
      p5InstanceRef.current = new p5(sketch, containerRef.current);

      setTimeout(() => {
        creatingInstanceRef.current = false;
      }, 500);
    };

    removePendingRef.current = true;
    removeCanvas();

    setTimeout(() => {
      removePendingRef.current = false;
      createInstance();
    }, 50);

    return () => {
      creatingInstanceRef.current = false;
      removePendingRef.current = false;
      setReady(false);
      removeCanvas();
    };
  }, [sketchFactory, size]);

  return (
    <div
      ref={containerRef}
      style={{
        height: '100vh',
        width: size ? `${size.width}px` : '100vw',
        margin: '0 auto',
        backgroundColor: '#000',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {!ready && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#aaa',
            fontSize: '1.5rem',
            zIndex: 1,
            backgroundColor: '#000',
          }}
        >
          loading...
        </div>
      )}
    </div>
  );
};

export default FilterScreen;
