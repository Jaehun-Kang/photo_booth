export function createFilteredSketch({
  video,
  width,
  height,
  captureW = 360,
  captureH = 240,
  filter,
}) {
  return function sketch(p5js) {
    let offscreen;
    let debugLogged = false;

    p5js.setup = () => {
      const targetAspect = 360 / 240;
      const h = width / targetAspect;

      // devicePixelRatio의 영향을 제거
      p5js.pixelDensity(1);
      p5js.createCanvas(width, h);
      offscreen = p5js.createGraphics(captureW, captureH);

      if (filter.setup) filter.setup(p5js);
    };

    p5js.draw = () => {
      const ctx = offscreen.drawingContext;
      if (!ctx || !video) return;

      ctx.clearRect(0, 0, captureW, captureH);

      const targetRatio = 3 / 2;
      const videoRatio = video.videoWidth / video.videoHeight;
      
      let sx, sy, sw, sh;
      
      if (videoRatio > targetRatio) {
        // 비디오가 더 넓은 경우 - 좌우를 균등하게 자르기
        sh = video.videoHeight;
        sw = sh * targetRatio;
        sy = 0;
        sx = Math.floor((video.videoWidth - sw) / 2); // 정수로 변환
      } else {
        // 비디오가 더 좁은 경우 - 위아래를 균등하게 자르기
        sw = video.videoWidth;
        sh = sw / targetRatio;
        sx = 0;
        sy = Math.floor((video.videoHeight - sh) / 2); // 정수로 변환
      }

      // 디버깅용 로그
      // console.log('Video cropping:', {
      //   videoSize: `${video.videoWidth}x${video.videoHeight}`,
      //   videoRatio: videoRatio.toFixed(3),
      //   targetRatio: targetRatio.toFixed(3),
      //   crop: `sx:${sx}, sy:${sy}, sw:${sw.toFixed(1)}, sh:${sh.toFixed(1)}`
      // });

      ctx.save();
      ctx.setTransform(-1, 0, 0, 1, captureW, 0);
      ctx.drawImage(
        video,
        sx, sy, sw, sh,
        0, 0, captureW, captureH
      );
      ctx.restore();

      offscreen.loadPixels();
      if (!offscreen.pixels || offscreen.pixels.length < 4 * captureW * captureH) return;

      // DPR에 관계없이 일관된 크기 사용 (기준: DPR=1일 때의 크기)
      const dpr = window.devicePixelRatio || 1;
      const baseWidth = width * dpr;  // DPR=1 기준으로 정규화
      const baseHeight = baseWidth / (360 / 240);  // 3:2 비율 유지

      // 필터에 전달되는 인수들 디버깅 (한번만)
      if (!debugLogged) {
        console.log('Filter draw arguments:', {
          originalWidth: width,
          originalHeight: width / (360 / 240),
          baseWidth: baseWidth,
          baseHeight: baseHeight,
          canvasW: p5js.width,
          canvasH: p5js.height,
          captureW: captureW,
          captureH: captureH,
          devicePixelRatio: dpr,
          actualCanvasSize: `${p5js.canvas.width}x${p5js.canvas.height}`
        });
        debugLogged = true;
      }
      
      filter.draw(p5js, offscreen, baseWidth, baseHeight, captureW, captureH);
    };
  };
}
