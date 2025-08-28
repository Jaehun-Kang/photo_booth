export function createScreenSketch({ 
  video, 
  width, 
  height,
  captureW = 1280,
  captureH = 720,
  filter, 
  onReady,
}) {
  return function sketch(p5js) {
    let offscreen;
    let readyCalled = false;
    let lastVideoSize = null; // 비디오 해상도 변화 감지용

    p5js.setup = () => {
      const targetAspect = 3 / 2;
      const h = width / targetAspect;
      
      // 캡처 크기도 목표 비율로 설정
      captureH = Math.round(captureW / targetAspect);

      p5js.pixelDensity(1);
      p5js.createCanvas(width, h);
      offscreen = p5js.createGraphics(captureW, captureH);
      
      // offscreen 캔버스도 pixelDensity 정규화
      offscreen.pixelDensity(1);

      if (filter.setup) filter.setup(p5js);
    };

    p5js.draw = () => {
      if (!video || video.readyState < 2 || !offscreen) return;
      
      // 비디오 크기가 유효하지 않으면 대기
      if (!video.videoWidth || !video.videoHeight || video.videoWidth <= 0 || video.videoHeight <= 0) {
        return;
      }

      // 비디오 해상도 변화 감지
      const currentVideoSize = `${video.videoWidth}x${video.videoHeight}`;
      if (lastVideoSize !== currentVideoSize) {
        console.log(`🔄 [FullScreen] 비디오 해상도 변화 감지: ${lastVideoSize || 'null'} -> ${currentVideoSize}`);
        lastVideoSize = currentVideoSize;
      }

      if (!readyCalled) {
        readyCalled = true;
        if (onReady) onReady();
      }

      const ctx = offscreen.drawingContext;
      if (!ctx) return;

      ctx.clearRect(0, 0, captureW, captureH);

      // 통합 크롭핑: 타겟 비율(3:2)에 맞게 크롭핑
      const targetRatio = 3 / 2;
      const videoRatio = video.videoWidth / video.videoHeight;
      
      let sx, sy, sw, sh;
      
      if (videoRatio > targetRatio) {
        // 좌우 크롭핑 (가로가 너무 넓은 경우)
        sh = video.videoHeight;
        sw = sh * targetRatio;
        sx = (video.videoWidth - sw) / 2;
        sy = 0;
      } else {
        // 상하 크롭핑 (세로가 너무 긴 경우)
        sw = video.videoWidth;
        sh = sw / targetRatio;
        sx = 0;
        sy = (video.videoHeight - sh) / 2;
      }

      // offscreen에 크롭핑된 비디오 그리기 (반전 없이)
      ctx.save();
      ctx.drawImage(video, sx, sy, sw, sh, 0, 0, captureW, captureH);
      ctx.restore();

      offscreen.loadPixels();
      if (!offscreen.pixels || offscreen.pixels.length < 4 * captureW * captureH) return;

      // 화면 표시를 위한 좌우반전 설정
      p5js.push();
      p5js.scale(-1, 1);
      p5js.translate(-p5js.width, 0);
      
      // 필터 적용 (반전된 상태에서)
      filter.draw(p5js, offscreen, p5js.width, p5js.height, captureW, captureH);
      
      p5js.pop();
    };

    return p5js;
  };
}
