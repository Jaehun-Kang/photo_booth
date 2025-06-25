export function createFilteredSketch({
  video,
  width,
  height,
  captureW = 32,
  captureH = 24,
  filter // ← drawFilter 대신 전체 객체 받음
}) {
  return function sketch(p5js) {
    let offscreen;

    p5js.setup = () => {
      p5js.createCanvas(width, height);
      offscreen = p5js.createGraphics(captureW, captureH);

      // filter.setup()이 있다면 호출
      if (filter.setup) filter.setup(p5js);
    };

    p5js.draw = () => {
      const ctx = offscreen.drawingContext;
      if (!ctx || !video) return;

      ctx.save();
      ctx.clearRect(0, 0, captureW, captureH);
      ctx.translate(captureW, 0);
      ctx.scale(-1, 1); // 좌우 반전
      ctx.drawImage(video, 0, 0, captureW, captureH);
      ctx.restore();

      offscreen.loadPixels();

      if (!offscreen.pixels || offscreen.pixels.length < 4 * captureW * captureH) return;

      filter.draw(p5js, offscreen, width, height, captureW, captureH);
    };
  };
}
