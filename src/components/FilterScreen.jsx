import React, { useRef, useEffect, useState } from "react";
import p5 from "p5";

const FilterScreen = ({ sketchFactory, video }) => {
  const containerRef = useRef(null);
  const p5InstanceRef = useRef(null);
  const creatingInstanceRef = useRef(false);
  const removePendingRef = useRef(false);
  const [size, setSize] = useState(null);
  const [ready, setReady] = useState(false);

  // 비디오 비율에 맞춰 캔버스 크기 계산 (3:2 비율 강제)
  useEffect(() => {
    if (!video || !containerRef.current) return;

    const containerHeight = containerRef.current.clientHeight;
    const containerWidth = containerRef.current.clientWidth;

    // 3:2 비율 강제 적용
    const targetAspect = 3 / 2;
    const containerAspect = containerWidth / containerHeight;

    let canvasWidth, canvasHeight;
    if (containerAspect > targetAspect) {
      // 컨테이너가 더 넓은 경우: 높이 기준
      canvasHeight = containerHeight;
      canvasWidth = canvasHeight * targetAspect;
    } else {
      // 컨테이너가 더 좁은 경우: 너비 기준
      canvasWidth = containerWidth;
      canvasHeight = canvasWidth / targetAspect;
    }

    setSize({ width: canvasWidth, height: canvasHeight });
  }, [video]);

  // ResizeObserver로 container 크기 감지 및 size 업데이트 (3:2 비율 강제)
  useEffect(() => {
    if (!containerRef.current) return;

    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const containerHeight = containerRef.current.clientHeight;
        const containerWidth = containerRef.current.clientWidth;

        // 3:2 비율 강제 적용
        const targetAspect = 3 / 2;
        const containerAspect = containerWidth / containerHeight;

        let width, height;
        if (containerAspect > targetAspect) {
          height = containerHeight;
          width = height * targetAspect;
        } else {
          width = containerWidth;
          height = width / targetAspect;
        }

        setSize((prev) =>
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
      // 1단계: p5 인스턴스 제거
      if (p5InstanceRef.current) {
        p5InstanceRef.current.remove();
        p5InstanceRef.current = null;
      }

      // 2단계: 남은 캔버스 요소들 강제 제거
      if (!containerRef.current) return;
      const canvases = containerRef.current.querySelectorAll("canvas");
      console.log(`[FullScreen] 유령 캔버스 정리: ${canvases.length}개 발견`);
      canvases.forEach((canvas, index) => {
        console.log(`  - 캔버스 ${index + 1} 제거:`, canvas.id || "unnamed");
        canvas.remove();
      });

      // 3단계: DOM 정리 확인
      const remainingCanvases = containerRef.current.querySelectorAll("canvas");
      if (remainingCanvases.length > 0) {
        console.warn(
          `[FullScreen] 제거되지 않은 캔버스 ${remainingCanvases.length}개 발견`
        );
      }
    };

    const createInstance = () => {
      if (!containerRef.current) return;

      // 생성 전 마지막 정리 확인
      const preExistingCanvases =
        containerRef.current.querySelectorAll("canvas");
      if (preExistingCanvases.length > 0) {
        console.log(
          `[FullScreen] 생성 전 잔여 캔버스 ${preExistingCanvases.length}개 정리`
        );
        preExistingCanvases.forEach((canvas) => canvas.remove());
      }

      const sketch = sketchFactory(size.width, size.height, () =>
        setReady(true)
      );
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
        height: "100vh",
        width: size ? `${size.width}px` : "100vw",
        margin: "0 auto",
        backgroundColor: "#000",
        position: "relative",
        overflow: "hidden",
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
            fontSize: "1.5rem",
            zIndex: 1,
            backgroundColor: "#000",
          }}
        >
          loading...
        </div>
      )}
    </div>
  );
};

export default FilterScreen;
