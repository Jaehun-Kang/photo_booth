import React, { useRef, useEffect, useLayoutEffect, useState } from "react";
import p5 from "p5";

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

      setSize((prev) => {
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
      console.log("[FilterPreview] useEffect aborted: no container");
      return;
    }
    if (!size || size.width === 0 || size.height === 0) {
      console.log("[FilterPreview] useEffect aborted: invalid size");
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

      // 생성 전 마지막 정리 확인
      if (containerRef.current) {
        const canvases = containerRef.current.querySelectorAll("canvas");
        if (canvases.length > 0) {
          console.log(`생성 전 잔여 캔버스 ${canvases.length}개 정리`);
          canvases.forEach((canvas, index) => {
            console.log(
              `  - 생성전 캔버스 ${index + 1} 제거:`,
              canvas.id || "unnamed"
            );
            canvas.remove();
          });
        }
      }

      const canvasWidth = containerRef.current.clientWidth;
      const canvasHeight = containerRef.current.clientHeight;

      // 3:2 비율에 맞춰 실제 캔버스 크기 계산
      const targetAspect = 3 / 2;
      const containerAspect = canvasWidth / canvasHeight;

      let actualWidth, actualHeight;
      if (containerAspect > targetAspect) {
        // 컨테이너가 더 넓은 경우: 높이 기준으로 너비 계산
        actualHeight = canvasHeight;
        actualWidth = actualHeight * targetAspect;
      } else {
        // 컨테이너가 더 좁은 경우: 너비 기준으로 높이 계산
        actualWidth = canvasWidth;
        actualHeight = actualWidth / targetAspect;
      }

      const sketch = sketchFactory(actualWidth, actualHeight);
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

        // 1단계: p5 인스턴스 제거
        p5InstanceRef.current.remove();
        p5InstanceRef.current = null;

        // 2단계: 남은 캔버스 요소들 강제 제거
        if (containerRef.current) {
          const canvases = containerRef.current.querySelectorAll("canvas");
          console.log(`유령 캔버스 정리: ${canvases.length}개 발견`);
          canvases.forEach((canvas, index) => {
            console.log(
              `  - 캔버스 ${index + 1} 제거:`,
              canvas.id || "unnamed"
            );
            canvas.remove();
          });

          // 3단계: DOM 정리 확인
          const remainingCanvases =
            containerRef.current.querySelectorAll("canvas");
          if (remainingCanvases.length > 0) {
            console.warn(
              `제거되지 않은 캔버스 ${remainingCanvases.length}개 발견`
            );
          }
        }

        setTimeout(() => {
          removePendingRef.current = false;
          if (!isCancelled) {
            createInstance();
          }
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
        width: "100%",
        aspectRatio: "3 / 2", // ← 비율 고정
        position: "relative",
        backgroundColor: "#111",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {!ready && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#aaa",
            fontSize: "1.2rem",
            zIndex: 1,
            backgroundColor: "#111",
          }}
        >
          loading...
        </div>
      )}
    </div>
  );
};

export default FilterPreview;
