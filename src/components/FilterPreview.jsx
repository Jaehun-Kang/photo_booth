import React, { useRef, useEffect, useLayoutEffect, useState } from 'react';
import p5 from 'p5';

const FilterPreview = ({ sketchFactory, video, onSelectFilter }) => {
  const containerRef = useRef(null);
  const p5InstanceRef = useRef(null);
  const creatingInstanceRef = useRef(false);
  const removePendingRef = useRef(false);
  const [size, setSize] = useState(null);
  const [ready, setReady] = useState(false);
  const resizeTimeoutRef = useRef(null);
  const prevSizeRef = useRef({ width: 0, height: 0 });

  // video 로드 후 p5 인스턴스 크기 설정
  useLayoutEffect(() => {
    if (!video || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const ratio = video.videoHeight / video.videoWidth;
    const height = width * ratio;

    setSize({ width, height });
  }, [video]);

  // 컨테이너 사이즈 변경 감지 및 p5 인스턴스 크기 조정
  useEffect(() => {
    if (!video || !video.videoWidth || !video.videoHeight) return;

    const updateSize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const ratio = video.videoHeight / video.videoWidth;
      const height = width * ratio;
      if (width === 0 || height === 0) return;

      setSize(prev => {
        if (
          prev &&
          Math.abs(prev.width - width) < 2 &&
          Math.abs(prev.height - height) < 2
        ) {
          return prev;
        }
        return { width, height };
      });
    };

    const debouncedUpdate = () => {
      clearTimeout(resizeTimeoutRef.current);
      resizeTimeoutRef.current = setTimeout(updateSize, 150);
    };

    const resizeObserver = new ResizeObserver(debouncedUpdate);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      clearTimeout(resizeTimeoutRef.current);
    };
  }, [video]);

  // p5 인스턴스 생성 및 제거
  useEffect(() => {
    if (!containerRef.current) {
      console.log('[FilterPreview] useEffect aborted: no container');
      return;
    }
    if (!size || size.width === 0 || size.height === 0) {
      console.log('[FilterPreview] useEffect aborted: invalid size');
      return;
    }

    if (
      size.width === prevSizeRef.current.width &&
      size.height === prevSizeRef.current.height
    ) {
      return;
    }

    prevSizeRef.current = size;

    if (creatingInstanceRef.current || removePendingRef.current) {
      return;
    }

    let isCancelled = false;

    const createInstance = () => {
      if (isCancelled || creatingInstanceRef.current) return;

      creatingInstanceRef.current = true;
      setReady(false);

      // 중복 캔버스 제거
      if (containerRef.current) {
        const canvases = containerRef.current.querySelectorAll('canvas');
        canvases.forEach(canvas => canvas.remove());
      }

      const sketch = sketchFactory(size.width, size.height);
      p5InstanceRef.current = new p5(sketch, containerRef.current);

      setReady(true);

      setTimeout(() => {
        creatingInstanceRef.current = false;
      }, 500);
    };

    const safelyReplaceInstance = () => {
      if (p5InstanceRef.current) {
        if (removePendingRef.current) {
          return;
        }
        removePendingRef.current = true;

        p5InstanceRef.current.remove();
        p5InstanceRef.current = null;

        if (containerRef.current) {
          const canvases = containerRef.current.querySelectorAll('canvas');
          canvases.forEach(canvas => canvas.remove());
        }

        setTimeout(() => {
          removePendingRef.current = false;
          createInstance();
        }, 50);
      } else {
        createInstance();
      }
    };

    safelyReplaceInstance();

    return () => {
      isCancelled = true;
      setReady(false);
      creatingInstanceRef.current = false;
      removePendingRef.current = false;
      if (p5InstanceRef.current) {
        p5InstanceRef.current.remove();
        p5InstanceRef.current = null;
      }
    };
  }, [sketchFactory, size]);

  return (
    <div
      ref={containerRef}
      onClick={onSelectFilter}
      style={{
        width: '100%',
        aspectRatio:
          video && video.videoWidth && video.videoHeight
            ? `${video.videoWidth} / ${video.videoHeight}`
            : '4 / 3',
        position: 'relative',
        backgroundColor: '#111',
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
            fontSize: '1.2rem',
            zIndex: 1,
            backgroundColor: '#111',
          }}
        >
          loading...
        </div>
      )}
    </div>
  );
};

export default FilterPreview;
