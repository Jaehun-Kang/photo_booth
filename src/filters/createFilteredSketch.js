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

    p5js.setup = () => {
      const targetAspect = 364 / 242;
      const h = width / targetAspect;

      p5js.pixelDensity(1);
      p5js.createCanvas(width, h);
      offscreen = p5js.createGraphics(captureW, captureH);

      if (filter.setup) filter.setup(p5js);
    };

    p5js.draw = () => {
      const ctx = offscreen.drawingContext;
      if (!ctx || !video) return;

      ctx.clearRect(0, 0, captureW, captureH);

      // 영상을 컨테이너 비율(364:242)로 맞추기
      const targetRatio = 364 / 242;
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

      filter.draw(p5js, offscreen, width, p5js.height, captureW, captureH);
    };
  };
}
