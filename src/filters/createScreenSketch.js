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

    p5js.setup = () => {
      const targetAspect = 3 / 2;
      const h = width / targetAspect;
      
      // 캡처 크기도 목표 비율로 설정
      captureH = Math.round(captureW / targetAspect);

      p5js.pixelDensity(1);
      p5js.createCanvas(width, h);
      offscreen = p5js.createGraphics(captureW, captureH);

      if (filter.setup) filter.setup(p5js);
    };

    p5js.draw = () => {
      if (!video || video.readyState < 2 || !offscreen) return;

      if (!readyCalled) {
        readyCalled = true;
        if (onReady) onReady();
      }

      const ctx = offscreen.drawingContext;
      if (!ctx) return;

      ctx.clearRect(0, 0, captureW, captureH);

      // 영상을 컨테이너 비율(364:242)로 맞추기
      const targetRatio = 3 / 2;
      const videoRatio = video.videoWidth / video.videoHeight;
      
      let sx, sy, sw, sh;
      
      if (videoRatio > targetRatio) {
        // 비디오가 더 넓은 경우 높이 기준으로 자르기
        sh = video.videoHeight;
        sw = sh * targetRatio;
        sy = 0;
        sx = (video.videoWidth - sw) / 2;
      } else {
        // 비디오가 더 좁은 경우 너비 기준으로 자르기
        sw = video.videoWidth;
        sh = sw / targetRatio;
        sx = 0;
        sy = (video.videoHeight - sh) / 2;
      }

      ctx.save();
      ctx.setTransform(-1, 0, 0, 1, captureW, 0);
      ctx.drawImage(
        video,
        sx, sy, sw, sh,  // 원본 영상에서 자를 영역
        0, 0, captureW, captureH  // 캔버스에 그릴 영역
      );
      ctx.restore();

      offscreen.loadPixels();
      if (!offscreen.pixels || offscreen.pixels.length < 4 * captureW * captureH) return;

      filter.draw(p5js, offscreen, p5js.width, p5js.height, captureW, captureH);
    };
  };
}
